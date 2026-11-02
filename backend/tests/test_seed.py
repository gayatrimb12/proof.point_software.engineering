from backend.extensions import db
from backend.models import Case, Evidence, TimelineEvent, User
from backend.seed import DEMO_PASSWORD, seed_database


def test_seed_creates_expected_data(app):
    counts = seed_database()

    assert counts == {
        "users": 3,
        "cases": 2,
        "case_members": 3,
        "evidence": 5,
        "timeline_events": 5,
    }

    alice = db.session.scalar(db.select(User).where(User.username == "alice"))
    assert alice.check_password(DEMO_PASSWORD)
    assert alice.password_hash != DEMO_PASSWORD

    apartment = db.session.scalar(db.select(Case).where(Case.title == "Apartment Dispute"))
    assert apartment.user_role(alice) == "owner"
    assert len(apartment.evidence_items) == 3
    assert all(len(e.evidence_links) == 1 for e in apartment.timeline_events)


def test_seed_is_idempotent_and_reset_rebuilds(app):
    assert seed_database() is not None

    assert seed_database() is None
    assert db.session.scalar(db.select(db.func.count(User.id))) == 3

    counts = seed_database(reset=True)
    assert counts["users"] == 3
    assert db.session.scalar(db.select(db.func.count(Evidence.id))) == 5
    assert db.session.scalar(db.select(db.func.count(TimelineEvent.id))) == 5
