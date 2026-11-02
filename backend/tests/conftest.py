import pytest

from backend.app import create_app
from backend.config import Config
from backend.extensions import db


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


@pytest.fixture
def app():
    app = create_app(TestConfig)
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
