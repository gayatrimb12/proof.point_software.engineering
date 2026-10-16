import os
from flask import Flask, jsonify
from config import Config
from extensions import db, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)

    import models

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
