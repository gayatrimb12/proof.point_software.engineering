from flask import Blueprint, jsonify, request

from backend.extensions import db
from backend.models import Case, Evidence

evidence_bp = Blueprint("evidence", __name__, url_prefix="/api")


@evidence_bp.route("/cases/<int:case_id>/evidence", methods=["GET"])
def list_case_evidence(case_id):
    case = db.session.get(Case, case_id)
    if case is None:
        return jsonify({"error": "Case not found"}), 404

    query = db.select(Evidence).where(Evidence.case_id == case_id)

    evidence_type = request.args.get("type", "").strip()
    if evidence_type:
        query = query.where(Evidence.evidence_type == evidence_type)

    items = db.session.scalars(
        query.order_by(Evidence.created_at.desc(), Evidence.id.desc())
    ).all()
    return jsonify({"evidence": [e.to_dict() for e in items], "count": len(items)}), 200


@evidence_bp.route("/evidence/<int:evidence_id>", methods=["GET"])
def get_evidence(evidence_id):
    item = db.session.get(Evidence, evidence_id)
    if item is None:
        return jsonify({"error": "Evidence not found"}), 404
    return jsonify(item.to_dict()), 200
