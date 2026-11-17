import io
import os
import pytest
from backend.extensions import db
from backend.models import Case, Evidence


def case_id(client, title):
    for c in client.get("/api/cases").get_json()["cases"]:
        if c["title"] == title:
            return c["id"]
    raise AssertionError(f"{title} not visible to this user")


def upload(client, cid, content=b"hello evidence", filename="note.txt", **fields):
    data = {"title": "My Evidence", "evidence_type": "Document", **fields}
    data["file"] = (io.BytesIO(content), filename)
    return client.post(f"/api/cases/{cid}/evidence", data=data, content_type="multipart/form-data")


@pytest.fixture
def alice(seeded_client, login):
    login(seeded_client, "alice")
    return seeded_client


@pytest.fixture
def apartment_id(alice):
    return case_id(alice, "Apartment Dispute")


def test_register_logs_in_and_me_works(client):
    res = client.post("/api/auth/register", json={
        "email": "New@Example.com", "password": "longenough1", "full_name": "New Person",
    })
    assert res.status_code == 201
    user = res.get_json()["user"]
    assert user["email"] == "new@example.com"
    assert user["username"] == "NewPerson"
    assert "password_hash" not in user

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.get_json()["user"]["email"] == "new@example.com"


def test_register_validation_and_duplicates(client):
    ok = {"email": "a@example.com", "password": "longenough1", "full_name": "Sam Smith"}
    assert client.post("/api/auth/register", json=ok).status_code == 201

    assert client.post("/api/auth/register", json={**ok, "password": "short"}).status_code == 400
    assert client.post("/api/auth/register", json={**ok, "email": "nope"}).status_code == 400
    assert client.post("/api/auth/register", json=ok).status_code == 409

    other = client.post("/api/auth/register", json={**ok, "email": "b@example.com"})
    assert other.status_code == 201
    assert other.get_json()["user"]["username"] == "SamSmith2"


def test_login_logout_flow(seeded_client):
    bad = seeded_client.post("/api/auth/login", json={"email": "alice@proofpoint.dev", "password": "wrong"})
    assert bad.status_code == 401
    assert seeded_client.post("/api/auth/login", json={"email": "ghost@x.com", "password": "x"}).status_code == 401
    assert seeded_client.post("/api/auth/login", json={}).status_code == 400

    ok = seeded_client.post("/api/auth/login", json={"username": "alice", "password": "password123"})
    assert ok.status_code == 200
    assert seeded_client.get("/api/auth/me").status_code == 200

    assert seeded_client.post("/api/auth/logout").status_code == 200
    assert seeded_client.get("/api/auth/me").status_code == 401


def test_deactivated_account_cannot_login(seeded_client):
    from backend.models import User
    User.query.filter_by(username="bob").one().is_active_account = False
    db.session.commit()
    res = seeded_client.post("/api/auth/login", json={"email": "bob@proofpoint.dev", "password": "password123"})
    assert res.status_code == 403


def test_api_requires_login(seeded_client):
    for path in ("/api/cases", "/api/cases/1", "/api/cases/1/evidence",
                 "/api/evidence/1", "/api/cases/1/timeline", "/api/cases/1/members"):
        assert seeded_client.get(path).status_code == 401, path
    assert seeded_client.post("/api/cases", json={"title": "x"}).status_code == 401
    assert seeded_client.get("/api/health").status_code == 200


def test_list_and_get_cases(alice):
    body = alice.get("/api/cases").get_json()
    assert body["count"] == 1
    assert body["cases"][0]["title"] == "Apartment Dispute"
    assert body["cases"][0]["my_role"] == "owner"

    assert alice.get("/api/cases?q=apartment").get_json()["count"] == 1
    assert alice.get("/api/cases?q=package").get_json()["count"] == 0
    assert alice.get("/api/cases?status=Closed").get_json()["count"] == 0

    detail = alice.get(f"/api/cases/{body['cases'][0]['id']}").get_json()
    assert {"members", "evidence", "timeline_events"} <= detail.keys()

    missing = alice.get("/api/cases/9999")
    assert missing.status_code == 404
    assert missing.get_json()["error"] == "Case not found"


def test_case_visibility_is_per_member(seeded_client, login):
    login(seeded_client, "bob")
    assert seeded_client.get("/api/cases").get_json()["count"] == 2
    package = case_id(seeded_client, "Damaged Package")

    login(seeded_client, "alice")
    assert seeded_client.get(f"/api/cases/{package}").status_code == 404
    assert seeded_client.get(f"/api/cases/{package}/evidence").status_code == 404
    assert seeded_client.get(f"/api/cases/{package}/timeline").status_code == 404

    login(seeded_client, "admin")
    assert seeded_client.get("/api/cases").get_json()["count"] == 2
    assert seeded_client.get(f"/api/cases/{package}").status_code == 200


def test_create_update_delete_case(alice, app):
    assert alice.post("/api/cases", json={"title": "  "}).status_code == 400
    assert alice.post("/api/cases", json={"title": "x", "status": "Nope"}).status_code == 400

    res = alice.post("/api/cases", json={
        "title": "New Case", "category": "Housing", "status": "Pending", "description": "d",
    })
    assert res.status_code == 201
    case = res.get_json()
    assert case["status"] == "Pending" and case["my_role"] == "owner"
    assert [m["role"] for m in case["members"]] == ["owner"]

    upd = alice.patch(f"/api/cases/{case['id']}", json={"status": "Closed", "title": "Renamed"})
    assert upd.status_code == 200
    assert upd.get_json()["status"] == "Closed" and upd.get_json()["title"] == "Renamed"

    assert alice.delete(f"/api/cases/{case['id']}").status_code == 200
    assert alice.get(f"/api/cases/{case['id']}").status_code == 404


def test_only_owner_can_edit_or_delete_case(seeded_client, login):
    login(seeded_client, "bob")
    cid = case_id(seeded_client, "Apartment Dispute")
    assert seeded_client.patch(f"/api/cases/{cid}", json={"title": "Hacked"}).status_code == 403
    assert seeded_client.delete(f"/api/cases/{cid}").status_code == 403


def test_delete_case_removes_uploaded_files(alice, app):
    cid = alice.post("/api/cases", json={"title": "Temp"}).get_json()["id"]
    assert upload(alice, cid).status_code == 201
    folder = app.config["UPLOAD_FOLDER"]
    assert len(os.listdir(folder)) == 1
    alice.delete(f"/api/cases/{cid}")
    assert os.listdir(folder) == []


def test_share_list_update_remove_flow(alice, seeded_app, apartment_id):
    members = alice.get(f"/api/cases/{apartment_id}/members").get_json()
    assert [m["role"] for m in members["members"]] == ["owner", "editor"]
    assert members["members"][0]["email"] == "alice@proofpoint.dev"

    res = alice.post(f"/api/cases/{apartment_id}/members",
                     json={"email": "  ADMIN@proofpoint.dev ", "role": "viewer"})
    assert res.status_code == 201
    member = res.get_json()
    assert member["role"] == "viewer" and member["email"] == "admin@proofpoint.dev"

    upd = alice.patch(f"/api/cases/{apartment_id}/members/{member['id']}", json={"role": "editor"})
    assert upd.status_code == 200 and upd.get_json()["role"] == "editor"

    assert alice.delete(f"/api/cases/{apartment_id}/members/{member['id']}").status_code == 200
    assert alice.get(f"/api/cases/{apartment_id}/members").get_json()["count"] == 2


def test_share_validation_errors(alice, apartment_id):
    url = f"/api/cases/{apartment_id}/members"
    assert alice.post(url, json={"email": "nobody@nowhere.com"}).status_code == 404
    assert alice.post(url, json={"email": "not-an-email"}).status_code == 400
    assert alice.post(url, json={"email": "admin@proofpoint.dev", "role": "owner"}).status_code == 400
    assert alice.post(url, json={"email": "bob@proofpoint.dev"}).status_code == 409
    assert alice.post(url, json={"email": "alice@proofpoint.dev"}).status_code == 409

    members = alice.get(url).get_json()["members"]
    owner = next(m for m in members if m["role"] == "owner")
    assert alice.delete(f"{url}/{owner['id']}").status_code == 400
    assert alice.patch(f"{url}/{owner['id']}", json={"role": "viewer"}).status_code == 400
    assert alice.patch(f"{url}/{members[1]['id']}", json={"role": "boss"}).status_code == 400
    assert alice.delete(f"{url}/9999").status_code == 404


def test_member_ids_from_other_cases_are_rejected(alice, seeded_client, login, apartment_id):
    login(seeded_client, "bob")
    package = case_id(seeded_client, "Damaged Package")
    package_member = seeded_client.get(f"/api/cases/{package}/members").get_json()["members"][0]
    login(seeded_client, "alice")
    assert alice.delete(f"/api/cases/{apartment_id}/members/{package_member['id']}").status_code == 404


def test_non_owners_cannot_share(seeded_client, login):
    login(seeded_client, "bob")
    cid = case_id(seeded_client, "Apartment Dispute")
    res = seeded_client.post(f"/api/cases/{cid}/members", json={"email": "admin@proofpoint.dev"})
    assert res.status_code == 403
    assert seeded_client.get(f"/api/cases/{cid}/members").status_code == 200


def test_shared_user_gains_and_loses_access(alice, seeded_client, apartment_id, app):
    from backend.models import User
    new = app.test_client()
    new.post("/api/auth/register", json={"email": "carol@example.com", "password": "longenough1"})
    assert new.get(f"/api/cases/{apartment_id}").status_code == 404

    res = alice.post(f"/api/cases/{apartment_id}/members", json={"email": "carol@example.com", "role": "viewer"})
    assert new.get(f"/api/cases/{apartment_id}").status_code == 200
    assert new.get("/api/cases").get_json()["count"] == 1
    assert upload(new, apartment_id).status_code == 403
    assert new.post(f"/api/cases/{apartment_id}/timeline",
                    json={"title": "x", "event_date": "2026-01-01"}).status_code == 403

    alice.delete(f"/api/cases/{apartment_id}/members/{res.get_json()['id']}")
    assert new.get(f"/api/cases/{apartment_id}").status_code == 404


def test_evidence_listing_and_detail(alice, apartment_id):
    evidence = alice.get(f"/api/cases/{apartment_id}/evidence").get_json()
    assert evidence["count"] == 3
    assert alice.get(f"/api/cases/{apartment_id}/evidence?type=Image").get_json()["count"] == 2

    one = alice.get(f"/api/evidence/{evidence['evidence'][0]['id']}")
    assert one.status_code == 200
    assert one.get_json()["case_id"] == apartment_id
    assert alice.get("/api/evidence/9999").status_code == 404


def test_upload_saves_file_and_metadata(alice, apartment_id, app):
    res = upload(alice, apartment_id, content=b"%PDF-fake", filename="My Lease (1).pdf",
                 description="lease", linked_person="Landlord", date_assigned="2026-08-09")
    assert res.status_code == 201
    body = res.get_json()
    assert body["title"] == "My Evidence" and body["linked_person"] == "Landlord"
    assert body["original_filename"] == "My_Lease_1.pdf"
    assert body["mime_type"] == "application/pdf"
    assert body["date_assigned"].startswith("2026-08-09")
    assert len(body["file_hash"]) == 64
    assert body["duplicate_of"] == []
    assert body["file_url"] == f"/api/evidence/{body['id']}/file"

    stored = os.path.join(app.config["UPLOAD_FOLDER"], body["file_path"])
    assert os.path.isfile(stored)
    assert open(stored, "rb").read() == b"%PDF-fake"
    assert body["file_path"] != "My_Lease_1.pdf"

    case = alice.get(f"/api/cases/{apartment_id}").get_json()
    assert case["evidence_count"] == 4


def test_upload_validation(alice, apartment_id, app):
    bad_ext = upload(alice, apartment_id, filename="evil.html")
    assert bad_ext.status_code == 400 and "not allowed" in bad_ext.get_json()["error"]
    assert upload(alice, apartment_id, filename="noext").status_code == 400
    assert upload(alice, apartment_id, content=b"", filename="empty.txt").status_code == 400
    assert alice.post(f"/api/cases/{apartment_id}/evidence",
                      data={"evidence_type": "x"}, content_type="multipart/form-data").status_code == 400
    assert upload(alice, apartment_id, date_assigned="not a date").status_code == 400
    assert upload(alice, apartment_id, event_ids="9999").status_code == 400
    assert os.listdir(app.config["UPLOAD_FOLDER"]) == []


def test_upload_too_large(alice, apartment_id, app):
    app.config["MAX_CONTENT_LENGTH"] = 100
    res = upload(alice, apartment_id, content=b"x" * 5000)
    assert res.status_code == 413
    assert res.get_json()["error"].startswith("File too large")


def test_json_metadata_only_evidence_and_event_links(alice, apartment_id):
    event_id = alice.get(f"/api/cases/{apartment_id}/timeline").get_json()["events"][0]["id"]
    res = alice.post(f"/api/cases/{apartment_id}/evidence", json={
        "title": "Phone call", "evidence_type": "Other", "event_ids": [event_id],
    })
    assert res.status_code == 201
    body = res.get_json()
    assert body["file_url"] is None and body["event_ids"] == [event_id]
    assert alice.get(f"/api/evidence/{body['id']}/file").status_code == 404


def test_event_links_must_belong_to_same_case(seeded_client, login, apartment_id=None):
    login(seeded_client, "bob")
    apartment = case_id(seeded_client, "Apartment Dispute")
    package = case_id(seeded_client, "Damaged Package")
    foreign_event = seeded_client.get(f"/api/cases/{package}/timeline").get_json()["events"][0]["id"]
    res = seeded_client.post(f"/api/cases/{apartment}/evidence",
                             json={"title": "x", "event_ids": [foreign_event]})
    assert res.status_code == 400


def test_duplicate_detection(alice, apartment_id):
    first = upload(alice, apartment_id, content=b"same bytes", filename="a.txt").get_json()
    second = upload(alice, apartment_id, content=b"same bytes", filename="renamed.txt")
    assert second.status_code == 201
    assert second.get_json()["duplicate_of"] == [first["id"]]

    check = alice.post(f"/api/cases/{apartment_id}/evidence/check-duplicate",
                       data={"file": (io.BytesIO(b"same bytes"), "x.txt")}, content_type="multipart/form-data")
    assert check.get_json()["duplicate"] is True
    assert len(check.get_json()["matches"]) == 2

    fresh = alice.post(f"/api/cases/{apartment_id}/evidence/check-duplicate",
                       data={"file": (io.BytesIO(b"different"), "x.txt")}, content_type="multipart/form-data")
    assert fresh.get_json() == {"duplicate": False, "matches": []}
    assert alice.post(f"/api/cases/{apartment_id}/evidence/check-duplicate").status_code == 400


def test_download_and_preview(alice, apartment_id):
    created = upload(alice, apartment_id, content=b"line one\n", filename="notes.txt").get_json()
    url = created["file_url"]

    inline = alice.get(url)
    assert inline.status_code == 200
    assert inline.data == b"line one\n"
    assert inline.headers["Content-Type"].startswith("text/plain")
    assert inline.headers["X-Content-Type-Options"] == "nosniff"
    assert "attachment" not in inline.headers.get("Content-Disposition", "")

    download = alice.get(url + "?download=1")
    assert "attachment" in download.headers["Content-Disposition"]
    assert "notes.txt" in download.headers["Content-Disposition"]


def test_seeded_evidence_without_real_file_returns_404(alice, apartment_id):
    seeded = alice.get(f"/api/cases/{apartment_id}/evidence").get_json()["evidence"][0]
    assert alice.get(f"/api/evidence/{seeded['id']}/file").status_code == 404


def test_files_are_only_visible_to_case_members(seeded_client, alice, apartment_id, login):
    created = upload(alice, apartment_id).get_json()
    login(seeded_client, "bob")
    assert seeded_client.get(created["file_url"]).status_code == 200

    anon = seeded_client.application.test_client()
    assert anon.get(created["file_url"]).status_code == 401

    from backend.models import User, Case, CaseMember
    anon.post("/api/auth/register", json={"email": "eve@example.com", "password": "longenough1"})
    assert anon.get(created["file_url"]).status_code == 404
    assert anon.get(f"/api/evidence/{created['id']}").status_code == 404


def test_update_and_delete_evidence(alice, apartment_id, app):
    created = upload(alice, apartment_id).get_json()
    event_id = alice.get(f"/api/cases/{apartment_id}/timeline").get_json()["events"][1]["id"]

    upd = alice.patch(f"/api/evidence/{created['id']}", json={
        "title": "Renamed", "linked_person": "", "event_ids": [event_id], "date_assigned": "2026-09-01",
    })
    assert upd.status_code == 200
    body = upd.get_json()
    assert body["title"] == "Renamed" and body["linked_person"] is None
    assert body["event_ids"] == [event_id] and body["date_assigned"].startswith("2026-09-01")
    assert alice.patch(f"/api/evidence/{created['id']}", json={"title": ""}).status_code == 400

    stored = os.path.join(app.config["UPLOAD_FOLDER"], created["file_path"])
    assert os.path.isfile(stored)
    assert alice.delete(f"/api/evidence/{created['id']}").status_code == 200
    assert not os.path.exists(stored)
    assert alice.get(f"/api/evidence/{created['id']}").status_code == 404


def test_evidence_write_permissions(seeded_client, login):
    login(seeded_client, "bob")
    package = case_id(seeded_client, "Damaged Package")
    login(seeded_client, "alice")
    assert upload(seeded_client, package).status_code == 404
    ev = Evidence.query.filter_by(title="Order Receipt").one()
    assert seeded_client.patch(f"/api/evidence/{ev.id}", json={"title": "x"}).status_code == 404
    assert seeded_client.delete(f"/api/evidence/{ev.id}").status_code == 404


def test_timeline_read(alice, apartment_id):
    timeline = alice.get(f"/api/cases/{apartment_id}/timeline").get_json()
    assert [e["title"] for e in timeline["events"]] == [
        "Initial Complaint", "Property Damage", "Follow-up Request",
    ]
    assert timeline["events"][0]["evidence"][0]["title"] == "Message Screenshot"
    assert alice.get("/api/cases/9999/timeline").status_code == 404


def test_timeline_create_update_delete(alice, apartment_id):
    evidence_id = alice.get(f"/api/cases/{apartment_id}/evidence").get_json()["evidence"][0]["id"]
    url = f"/api/cases/{apartment_id}/timeline"

    assert alice.post(url, json={"title": "No date"}).status_code == 400
    assert alice.post(url, json={"title": "x", "event_date": "garbage"}).status_code == 400
    assert alice.post(url, json={"title": "x", "event_date": "2026-08-10", "evidence_ids": [9999]}).status_code == 400

    res = alice.post(url, json={
        "title": "Landlord replied", "event_date": "2026-08-10T09:30:00Z",
        "description": "Finally", "evidence_ids": [evidence_id],
    })
    assert res.status_code == 201
    event = res.get_json()
    assert event["order_index"] == 3
    assert event["evidence_ids"] == [evidence_id]
    assert event["event_date"].startswith("2026-08-10T09:30")

    upd = alice.patch(f"{url}/{event['id']}", json={"title": "Edited", "evidence_ids": [], "order_index": 0})
    assert upd.status_code == 200
    assert upd.get_json()["title"] == "Edited" and upd.get_json()["evidence_ids"] == []
    assert alice.get(f"{url}/{event['id']}").status_code == 200

    assert alice.delete(f"{url}/{event['id']}").status_code == 200
    assert alice.get(f"{url}/{event['id']}").status_code == 404
    assert alice.get(url).get_json()["count"] == 3


def test_timeline_events_are_scoped_to_their_case(seeded_client, login):
    login(seeded_client, "bob")
    apartment = case_id(seeded_client, "Apartment Dispute")
    package = case_id(seeded_client, "Damaged Package")
    package_event = seeded_client.get(f"/api/cases/{package}/timeline").get_json()["events"][0]["id"]
    assert seeded_client.patch(f"/api/cases/{apartment}/timeline/{package_event}", json={"title": "x"}).status_code == 404
    assert seeded_client.delete(f"/api/cases/{apartment}/timeline/{package_event}").status_code == 404


def test_deleting_evidence_keeps_timeline_events(alice, apartment_id):
    timeline = alice.get(f"/api/cases/{apartment_id}/timeline").get_json()["events"]
    evidence_id = timeline[0]["evidence_ids"][0]
    alice.delete(f"/api/evidence/{evidence_id}")
    after = alice.get(f"/api/cases/{apartment_id}/timeline").get_json()["events"]
    assert len(after) == 3 and after[0]["evidence_ids"] == []


def test_cors_allows_vite_origin_with_credentials(client):
    res = client.options("/api/auth/login", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert res.headers["Access-Control-Allow-Origin"] == "http://localhost:5173"
    assert res.headers["Access-Control-Allow-Credentials"] == "true"


def test_cors_rejects_unknown_origin(client):
    res = client.get("/api/health", headers={"Origin": "http://evil.example"})
    assert "Access-Control-Allow-Origin" not in res.headers