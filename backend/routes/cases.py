from flask import Blueprint, g, jsonify, request
from sqlalchemy import func, or_

from backend.extensions import db
from backend.models import CASE_STATUSES, Case, CaseMember, User
from backend.permissions import (
    error, get_case_for_user, login_required, role_in_case, touch,
)

cases_bp = Blueprint("cases", __name__, url_prefix="/api/cases")

SHARE_ROLES = ("editor", "viewer")


def _case_payload(case, **flags):
    data = case.to_dict(**flags)
    data["my_role"] = role_in_case(case, g.user)
    return data


def _clean_case_fields(data, partial=False):
    """Validate title/description/category/status. Returns (fields, error_msg)."""
    fields = {}
    if "title" in data or not partial:
        title = str(data.get("title") or "").strip()
        if not title:
            return None, "Title is required"
        if len(title) > 150:
            return None, "Title must be 150 characters or fewer"
        fields["title"] = title
    if "description" in data:
        fields["description"] = (str(data["description"]).strip() if data["description"] is not None else None)
    if "category" in data:
        category = str(data["category"] or "").strip()
        if not category or len(category) > 50:
            return None, "Category must be 1-50 characters"
        fields["category"] = category
    if "status" in data:
        if data["status"] not in CASE_STATUSES:
            return None, f"Status must be one of: {', '.join(CASE_STATUSES)}"
        fields["status"] = data["status"]
    return fields, None


@cases_bp.route("", methods=["GET"])
@login_required
def list_cases():
    query = db.select(Case)

    if not g.user.is_admin:
        query = query.where(
            Case.id.in_(db.select(CaseMember.case_id).where(CaseMember.user_id == g.user.id))
        )

    q = request.args.get("q", "").strip()
    if q:
        like = f"%{q}%"
        query = query.where(or_(Case.title.ilike(like), Case.description.ilike(like)))

    category = request.args.get("category", "").strip()
    if category:
        query = query.where(Case.category == category)

    status = request.args.get("status", "").strip()
    if status:
        query = query.where(Case.status == status)

    cases = db.session.scalars(query.order_by(Case.updated_at.desc(), Case.id.desc())).all()
    return jsonify({"cases": [_case_payload(c) for c in cases], "count": len(cases)}), 200


@cases_bp.route("", methods=["POST"])
@login_required
def create_case():
    data = request.get_json(silent=True) or {}
    fields, problem = _clean_case_fields(data)
    if problem:
        return error(problem, 400)

    case = Case(
        title=fields["title"],
        description=fields.get("description"),
        category=fields.get("category", "General"),
        status=fields.get("status", "Active"),
    )
    db.session.add(case)
    db.session.flush()
    db.session.add(CaseMember(case_id=case.id, user_id=g.user.id, role="owner"))
    db.session.commit()
    return jsonify(_case_payload(case, include_members=True)), 201


@cases_bp.route("/<int:case_id>", methods=["GET"])
@login_required
def get_case(case_id):
    case, err = get_case_for_user(case_id, "viewer")
    if err:
        return err
    return jsonify(
        _case_payload(case, include_members=True, include_evidence=True, include_timeline=True)
    ), 200


@cases_bp.route("/<int:case_id>", methods=["PUT", "PATCH"])
@login_required
def update_case(case_id):
    case, err = get_case_for_user(case_id, "owner")
    if err:
        return err
    data = request.get_json(silent=True) or {}
    fields, problem = _clean_case_fields(data, partial=True)
    if problem:
        return error(problem, 400)
    for key, value in fields.items():
        setattr(case, key, value)
    touch(case)
    db.session.commit()
    return jsonify(_case_payload(case, include_members=True)), 200


@cases_bp.route("/<int:case_id>", methods=["DELETE"])
@login_required
def delete_case(case_id):
    case, err = get_case_for_user(case_id, "owner")
    if err:
        return err
    from backend.routes.evidence import delete_stored_file
    for item in list(case.evidence_items):
        delete_stored_file(item)
    db.session.delete(case)
    db.session.commit()
    return jsonify({"message": "Case deleted"}), 200


@cases_bp.route("/<int:case_id>/members", methods=["GET"])
@login_required
def list_members(case_id):
    case, err = get_case_for_user(case_id, "viewer")
    if err:
        return err
    members = sorted(case.members, key=lambda m: (m.role != "owner", m.added_at))
    return jsonify({"members": [m.to_dict() for m in members], "count": len(members)}), 200


@cases_bp.route("/<int:case_id>/members", methods=["POST"])
@login_required
def add_member(case_id):
    case, err = get_case_for_user(case_id, "owner")
    if err:
        return err

    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    role = str(data.get("role", "viewer")).strip().lower()

    if not email or "@" not in email:
        return error("A valid email address is required", 400)
    if role not in SHARE_ROLES:
        return error(f"Role must be one of: {', '.join(SHARE_ROLES)}", 400)

    user = db.session.scalar(db.select(User).where(func.lower(User.email) == email))
    if user is None or not user.is_active_account:
        return error("No user with that email address", 404)
    if case.user_role(user) is not None:
        return error("This user already has access to the case", 409)

    member = CaseMember(case_id=case.id, user_id=user.id, role=role)
    db.session.add(member)
    touch(case)
    db.session.commit()
    return jsonify(member.to_dict()), 201


def _get_member(case, member_id):
    member = db.session.get(CaseMember, member_id)
    if member is None or member.case_id != case.id:
        return None, error("Member not found", 404)
    return member, None


@cases_bp.route("/<int:case_id>/members/<int:member_id>", methods=["PUT", "PATCH"])
@login_required
def update_member(case_id, member_id):
    case, err = get_case_for_user(case_id, "owner")
    if err:
        return err
    member, err = _get_member(case, member_id)
    if err:
        return err
    if member.role == "owner":
        return error("The owner's role cannot be changed", 400)

    role = str((request.get_json(silent=True) or {}).get("role", "")).strip().lower()
    if role not in SHARE_ROLES:
        return error(f"Role must be one of: {', '.join(SHARE_ROLES)}", 400)

    member.role = role
    touch(case)
    db.session.commit()
    return jsonify(member.to_dict()), 200


@cases_bp.route("/<int:case_id>/members/<int:member_id>", methods=["DELETE"])
@login_required
def remove_member(case_id, member_id):
    case, err = get_case_for_user(case_id, "owner")
    if err:
        return err
    member, err = _get_member(case, member_id)
    if err:
        return err
    if member.role == "owner":
        return error("The owner cannot be removed", 400)

    db.session.delete(member)
    touch(case)
    db.session.commit()
    return jsonify({"message": "Member removed"}), 200