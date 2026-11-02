from flask import Blueprint, jsonify

from backend.extensions import db
from backend.models import Case

timeline_bp = Blueprint("timeline", __name__, url_prefix="/api")


@timeline_bp.route("/cases/<int:case_id>/timeline", methods=["GET"])
def get_case_timeline(case_id):
    case = db.session.get(Case, case_id)
    if case is None:
        return jsonify({"error": "Case not found"}), 404

    events = [e.to_dict(include_evidence=True) for e in case.timeline_events]
    return jsonify({"case_id": case.id, "events": events, "count": len(events)}), 200
