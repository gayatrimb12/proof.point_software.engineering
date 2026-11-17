import hashlib
import mimetypes
import os
import uuid

from flask import Blueprint, current_app, g, jsonify, request, send_from_directory
from werkzeug.utils import safe_join, secure_filename

from backend.extensions import db
from backend.models import Evidence, TimelineEvent
from backend.permissions import (
    error, get_case_for_user, login_required, parse_datetime, touch,
)

evidence_bp = Blueprint("evidence", __name__, url_prefix="/api")

CHUNK = 64 * 1024


def _extension(filename):
    return filename.rsplit(".", 1)[1].lower() if "." in filename else ""


def _hash_stream(stream):
    digest = hashlib.sha256()
    for chunk in iter(lambda: stream.read(CHUNK), b""):
        digest.update(chunk)
    stream.seek(0)
    return digest.hexdigest()


def _save_upload(file, ext):
    stored = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], stored)
    digest = hashlib.sha256()
    with open(path, "wb") as out:
        for chunk in iter(lambda: file.stream.read(CHUNK), b""):
            digest.update(chunk)
            out.write(chunk)
    return stored, digest.hexdigest()


def _remove_file(stored_name):
    if not stored_name:
        return
    path = safe_join(current_app.config["UPLOAD_FOLDER"], stored_name)
    if path and os.path.isfile(path):
        try:
            os.remove(path)
        except OSError:
            pass


def delete_stored_file(item):
    _remove_file(item.file_path)


def _validate_upload(file):
    ext = _extension(file.filename)
    if ext not in current_app.config["ALLOWED_UPLOAD_EXTENSIONS"]:
        allowed = ", ".join(sorted(current_app.config["ALLOWED_UPLOAD_EXTENSIONS"]))
        return None, error(f"File type '.{ext}' is not allowed. Allowed: {allowed}", 400)
    return ext, None


def _request_data():
    if request.files or request.form:
        return request.form
    return request.get_json(silent=True) or {}


def _event_ids_from(data):
    if hasattr(data, "getlist"):  # multipart: repeated field or comma separated
        raw = data.getlist("event_ids")
        if not raw:
            return None, None
        parts = [p for r in raw for p in str(r).split(",") if p.strip()]
    else:
        if "event_ids" not in data:
            return None, None
        parts = data["event_ids"] or []
        if not isinstance(parts, list):
            return None, "event_ids must be a list"
    try:
        return [int(p) for p in parts], None
    except (TypeError, ValueError):
        return None, "event_ids must be integers"


def _resolve_events(case, ids):
    events = []
    for event_id in dict.fromkeys(ids):
        event = db.session.get(TimelineEvent, event_id)
        if event is None or event.case_id != case.id:
            return None, f"Timeline event {event_id} does not belong to this case"
        events.append(event)
    return events, None


def _clean_text_fields(data, partial=False):
    fields = {}
    if "title" in data or not partial:
        title = str(data.get("title") or "").strip()
        if not title:
            return None, "Title is required"
        if len(title) > 150:
            return None, "Title must be 150 characters or fewer"
        fields["title"] = title
    if "evidence_type" in data or not partial:
        etype = str(data.get("evidence_type") or "Other").strip()
        if not etype or len(etype) > 50:
            return None, "Evidence type must be 1-50 characters"
        fields["evidence_type"] = etype
    if "description" in data:
        fields["description"] = str(data.get("description") or "").strip() or None
    if "linked_person" in data:
        person = str(data.get("linked_person") or "").strip()
        if len(person) > 120:
            return None, "Linked person must be 120 characters or fewer"
        fields["linked_person"] = person or None
    if "date_assigned" in data:
        raw = data.get("date_assigned")
        if raw in (None, ""):
            fields["date_assigned"] = None
        else:
            try:
                fields["date_assigned"] = parse_datetime(raw)
            except ValueError:
                return None, "date_assigned must be an ISO date"
    return fields, None


def _duplicates(case_id, file_hash, exclude_id=None):
    query = db.select(Evidence).where(Evidence.case_id == case_id, Evidence.file_hash == file_hash)
    if exclude_id:
        query = query.where(Evidence.id != exclude_id)
    return db.session.scalars(query).all()


def _load_evidence(evidence_id, min_role):
    item = db.session.get(Evidence, evidence_id)
    if item is None:
        return None, None, error("Evidence not found", 404)
    case, err = get_case_for_user(item.case_id, min_role)
    if err:
        return None, None, (error("Evidence not found", 404) if err[1] == 404 else err)
    return item, case, None


@evidence_bp.route("/cases/<int:case_id>/evidence", methods=["GET"])
@login_required
def list_case_evidence(case_id):
    case, err = get_case_for_user(case_id, "viewer")
    if err:
        return err

    query = db.select(Evidence).where(Evidence.case_id == case_id)

    evidence_type = request.args.get("type", "").strip()
    if evidence_type:
        query = query.where(Evidence.evidence_type == evidence_type)

    items = db.session.scalars(
        query.order_by(Evidence.created_at.desc(), Evidence.id.desc())
    ).all()
    return jsonify({"evidence": [e.to_dict() for e in items], "count": len(items)}), 200


@evidence_bp.route("/cases/<int:case_id>/evidence", methods=["POST"])
@login_required
def create_evidence(case_id):
    case, err = get_case_for_user(case_id, "editor")
    if err:
        return err

    data = _request_data()
    fields, problem = _clean_text_fields(data)
    if problem:
        return error(problem, 400)

    event_ids, problem = _event_ids_from(data)
    if problem:
        return error(problem, 400)
    events = []
    if event_ids:
        events, problem = _resolve_events(case, event_ids)
        if problem:
            return error(problem, 400)

    file = request.files.get("file")
    stored_name = file_hash = mime = original = None
    if file and file.filename:
        ext, err = _validate_upload(file)
        if err:
            return err
        original = secure_filename(file.filename) or f"upload.{ext}"
        stored_name, file_hash = _save_upload(file, ext)
        if os.path.getsize(os.path.join(current_app.config["UPLOAD_FOLDER"], stored_name)) == 0:
            _remove_file(stored_name)
            return error("The uploaded file is empty", 400)
        mime = mimetypes.guess_type(stored_name)[0] or "application/octet-stream"

    duplicates = _duplicates(case.id, file_hash) if file_hash else []

    item = Evidence(
        case_id=case.id,
        uploaded_by=g.user.id,
        file_path=stored_name,
        file_hash=file_hash,
        original_filename=original,
        mime_type=mime,
        **fields,
    )
    item.linked_events = events
    try:
        db.session.add(item)
        touch(case)
        db.session.commit()
    except Exception:
        db.session.rollback()
        _remove_file(stored_name)
        raise

    body = item.to_dict()
    body["duplicate_of"] = [d.id for d in duplicates]
    return jsonify(body), 201


@evidence_bp.route("/cases/<int:case_id>/evidence/check-duplicate", methods=["POST"])
@login_required
def check_duplicate(case_id):
    case, err = get_case_for_user(case_id, "editor")
    if err:
        return err
    file = request.files.get("file")
    if not file or not file.filename:
        return error("A file is required", 400)

    matches = _duplicates(case.id, _hash_stream(file.stream))
    return jsonify({
        "duplicate": bool(matches),
        "matches": [{"id": m.id, "title": m.title} for m in matches],
    }), 200


@evidence_bp.route("/evidence/<int:evidence_id>", methods=["GET"])
@login_required
def get_evidence(evidence_id):
    item, _case, err = _load_evidence(evidence_id, "viewer")
    if err:
        return err
    return jsonify(item.to_dict()), 200


@evidence_bp.route("/evidence/<int:evidence_id>", methods=["PUT", "PATCH"])
@login_required
def update_evidence(evidence_id):
    item, case, err = _load_evidence(evidence_id, "editor")
    if err:
        return err

    data = request.get_json(silent=True) or {}
    fields, problem = _clean_text_fields(data, partial=True)
    if problem:
        return error(problem, 400)

    event_ids, problem = _event_ids_from(data)
    if problem:
        return error(problem, 400)
    if event_ids is not None:
        events, problem = _resolve_events(case, event_ids)
        if problem:
            return error(problem, 400)
        item.linked_events = events

    for key, value in fields.items():
        setattr(item, key, value)
    touch(case)
    db.session.commit()
    return jsonify(item.to_dict()), 200


@evidence_bp.route("/evidence/<int:evidence_id>", methods=["DELETE"])
@login_required
def delete_evidence(evidence_id):
    item, case, err = _load_evidence(evidence_id, "editor")
    if err:
        return err
    delete_stored_file(item)
    db.session.delete(item)
    touch(case)
    db.session.commit()
    return jsonify({"message": "Evidence deleted"}), 200


@evidence_bp.route("/evidence/<int:evidence_id>/file", methods=["GET"])
@login_required
def evidence_file(evidence_id):
    item, _case, err = _load_evidence(evidence_id, "viewer")
    if err:
        return err
    if not item.file_path:
        return error("This evidence has no file", 404)

    as_attachment = request.args.get("download", "").lower() in ("1", "true", "yes")
    response = send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        item.file_path,
        mimetype=item.mime_type or None,
        as_attachment=as_attachment,
        download_name=item.original_filename or item.file_path,
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "private, no-store"
    return response