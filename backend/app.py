import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.extensions import db, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)


    os.makedirs(app.config['DB_DIR'], exist_ok=True)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}},
        supports_credentials=True,
    )

    import backend.models as models
    from backend.routes import register_routes

    register_routes(app)

    @app.errorhandler(400)
    def bad_request(_err):
        return jsonify({'error': 'Bad request'}), 400

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(_err):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(413)
    def too_large(_err):
        return jsonify({'error': 'File too large (max 25 MB)'}), 413

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'ProofPoint API'
        }), 200

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
