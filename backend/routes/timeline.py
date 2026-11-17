from flask import Blueprint, jsonify, request

from backend.extensions import db
from backend.models import Evidence, TimelineEvent
from backend.permissions import (
    error, get_case_for_user, login_required, parse_datetime, touch,
)

timeline_bp = Blueprint("timeline", __name__, url_prefix="/api")


def _resolve_evidence(case, ids):
    if not isinstance(ids, list):
        return None, "evidence_ids must be a list"
    items = []
    try:
        ids = [int(i) for i in ids]
    except (TypeError, ValueError):
        return None, "evidence_ids must be integers"
    for evidence_id in dict.fromkeys(ids):
        item = db.session.get(Evidence, evidence_id)
        if item is None or item.case_id != case.id:
            return None, f"Evidence {evidence_id} does not belong to this case"
        items.append(item)
    return items, None


def _clean_event_fields(data, partial=False):
    fields = {}
    if "title" in data or not partial:
        title = str(data.get("title") or "").strip()
        if not title:
            return None, "Title is required"
        if len(title) > 150:
            return None, "Title must be 150 characters or fewer"
        fields["title"] = title
    if "event_date" in data or not partial:
        if not data.get("event_date"):
            return None, "event_date is required"
        try:
            fields["event_date"] = parse_datetime(data["event_date"])
        except ValueError:
            return None, "event_date must be an ISO date"
    if "description" in data:
        fields["description"] = str(data.get("description") or "").strip() or None
    if "order_index" in data:
        try:
            fields["order_index"] = int(data["order_index"])
        except (TypeError, ValueError):
            return None, "order_index must be an integer"
    return fields, None


def _get_event(case, event_id):
    event = db.session.get(TimelineEvent, event_id)
    if event is None or event.case_id != case.id:
        return None, error("Timeline event not found", 404)
    return event, None


@timeline_bp.route("/cases/<int:case_id>/timeline", methods=["GET"])
@login_required
def get_case_timeline(case_id):
    case, err = get_case_for_user(case_id, "viewer")
    if err:
        return err

    events = [e.to_dict(include_evidence=True) for e in case.timeline_events]
    return jsonify({"case_id": case.id, "events": events, "count": len(events)}), 200


@timeline_bp.route("/cases/<int:case_id>/timeline", methods=["POST"])
@login_required
def create_event(case_id):
    case, err = get_case_for_user(case_id, "editor")
    if err:
        return err

    data = request.get_json(silent=True) or {}
    fields, problem = _clean_event_fields(data)
    if problem:
        return error(problem, 400)

    if "order_index" not in fields:
        highest = db.session.scalar(
            db.select(db.func.max(TimelineEvent.order_index)).where(TimelineEvent.case_id == case.id)
        )
        fields["order_index"] = 0 if highest is None else highest + 1

    event = TimelineEvent(case_id=case.id, **fields)
    if "evidence_ids" in data:
        items, problem = _resolve_evidence(case, data["evidence_ids"])
        if problem:
            return error(problem, 400)
        event.evidence_links = items

    db.session.add(event)
    touch(case)
    db.session.commit()
    return jsonify(event.to_dict(include_evidence=True)), 201


@timeline_bp.route("/cases/<int:case_id>/timeline/<int:event_id>", methods=["GET"])
@login_required
def get_event(case_id, event_id):
    case, err = get_case_for_user(case_id, "viewer")
    if err:
        return err
    event, err = _get_event(case, event_id)
    if err:
        return err
    return jsonify(event.to_dict(include_evidence=True)), 200


@timeline_bp.route("/cases/<int:case_id>/timeline/<int:event_id>", methods=["PUT", "PATCH"])
@login_required
def update_event(case_id, event_id):
    case, err = get_case_for_user(case_id, "editor")
    if err:
        return err
    event, err = _get_event(case, event_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}
    fields, problem = _clean_event_fields(data, partial=True)
    if problem:
        return error(problem, 400)

    if "evidence_ids" in data:
        items, problem = _resolve_evidence(case, data["evidence_ids"])
        if problem:
            return error(problem, 400)
        event.evidence_links = items

    for key, value in fields.items():
        setattr(event, key, value)
    touch(case)
    db.session.commit()
    return jsonify(event.to_dict(include_evidence=True)), 200


@timeline_bp.route("/cases/<int:case_id>/timeline/<int:event_id>", methods=["DELETE"])
@login_required
def delete_event(case_id, event_id):
    case, err = get_case_for_user(case_id, "editor")
    if err:
        return err
    event, err = _get_event(case, event_id)
    if err:
        return err
    db.session.delete(event)
    touch(case)
    db.session.commit()
    return jsonify({"message": "Timeline event deleted"}), 200