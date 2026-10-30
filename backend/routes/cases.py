from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from backend.extensions import db
from backend.models import Case

cases_bp = Blueprint("cases", __name__, url_prefix="/api/cases")


@cases_bp.route("", methods=["GET"])
def list_cases():
    query = db.select(Case)

    q = request.args.get("q", "").strip()
    if q:
        like = f"%{q}%"
        query = query.where(or_(Case.title.ilike(like), Case.description.ilike(like)))

    category = request.args.get("category", "").strip()
    if category:
        query = query.where(Case.category == category)

    cases = db.session.scalars(query.order_by(Case.updated_at.desc(), Case.id.desc())).all()
    return jsonify({"cases": [c.to_dict() for c in cases], "count": len(cases)}), 200


@cases_bp.route("/<int:case_id>", methods=["GET"])
def get_case(case_id):
    case = db.session.get(Case, case_id)
    if case is None:
        return jsonify({"error": "Case not found"}), 404
    return jsonify(
        case.to_dict(include_members=True, include_evidence=True, include_timeline=True)
    ), 200
