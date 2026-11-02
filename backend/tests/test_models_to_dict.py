from backend.models import Case, Evidence, User


def test_user_to_dict_hides_password_hash(seeded_app):
    user = User.query.filter_by(username="alice").one()
    data = user.to_dict()

    assert data["username"] == "alice"
    assert data["email"] == "alice@proofpoint.dev"
    assert data["role"] == "user"
    assert "password_hash" not in data
    assert "password" not in data


def test_case_and_evidence_to_dict_shape(seeded_app):
    case = Case.query.filter_by(title="Apartment Dispute").one()

    data = case.to_dict(include_members=True, include_timeline=True)
    assert data["evidence_count"] == 3
    assert data["timeline_event_count"] == 3
    assert data["member_count"] == 2
    assert {m["role"] for m in data["members"]} == {"owner", "collaborator"}
    assert [t["order_index"] for t in data["timeline_events"]] == [0, 1, 2]
    assert isinstance(data["created_at"], str)

    evidence = Evidence.query.filter_by(title="Damage Photo").one()
    ev = evidence.to_dict()
    assert ev["case_id"] == case.id
    assert ev["linked_person"] is None
    assert ev["date_assigned"].startswith("2026-08-06")
    assert len(ev["event_ids"]) == 1
