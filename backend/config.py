import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_DIR = os.path.join(BASE_DIR, 'instance')


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'proofpoint-dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join(DB_DIR, 'proofpoint.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DB_DIR = DB_DIR

    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', '0') == '1'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    CORS_ORIGINS = [
        o.strip()
        for o in os.environ.get(
            'CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173'
        ).split(',')
        if o.strip()
    ]

    # --- file uploads ---
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(BASE_DIR, 'uploads'))
    MAX_CONTENT_LENGTH = 25 * 1024 * 1024
    ALLOWED_UPLOAD_EXTENSIONS = {
        'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic',
        'pdf', 'txt', 'csv', 'doc', 'docx', 'eml', 'msg',
        'mp3', 'wav', 'm4a', 'mp4', 'mov',
    }
