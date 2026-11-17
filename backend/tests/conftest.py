import pytest

from backend.app import create_app
from backend.config import Config
from backend.extensions import db


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


@pytest.fixture
def app(tmp_path):
    class PerTestConfig(TestConfig):
        UPLOAD_FOLDER = str(tmp_path / "uploads")

    app = create_app(PerTestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def seeded_app(app):
    from backend.seed import seed_database
    seed_database()
    return app


@pytest.fixture
def seeded_client(seeded_app):
    return seeded_app.test_client()


@pytest.fixture
def login():
    from backend.seed import DEMO_PASSWORD

    def _login(client, username="alice", password=DEMO_PASSWORD):
        res = client.post("/api/auth/login", json={"email": f"{username}@proofpoint.dev", "password": password})
        assert res.status_code == 200, res.get_json()
        return res

    return _login
