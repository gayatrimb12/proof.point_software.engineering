from backend.routes.cases import cases_bp
from backend.routes.evidence import evidence_bp
from backend.routes.timeline import timeline_bp


def register_routes(app):
    app.register_blueprint(cases_bp)
    app.register_blueprint(evidence_bp)
    app.register_blueprint(timeline_bp)
