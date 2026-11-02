def test_list_and_get_cases(seeded_client):
    res = seeded_client.get("/api/cases")
    assert res.status_code == 200
    body = res.get_json()
    assert body["count"] == 2
    assert {c["title"] for c in body["cases"]} == {"Apartment Dispute", "Damaged Package"}

    assert seeded_client.get("/api/cases?q=apartment").get_json()["count"] == 1
    assert seeded_client.get("/api/cases?category=Product Issue").get_json()["count"] == 1

    case_id = body["cases"][0]["id"]
    detail = seeded_client.get(f"/api/cases/{case_id}").get_json()
    assert {"members", "evidence", "timeline_events"} <= detail.keys()

    missing = seeded_client.get("/api/cases/9999")
    assert missing.status_code == 404
    assert missing.get_json()["error"] == "Case not found"


def test_evidence_and_timeline_endpoints(seeded_client):
    cases = seeded_client.get("/api/cases?q=apartment").get_json()["cases"]
    case_id = cases[0]["id"]

    evidence = seeded_client.get(f"/api/cases/{case_id}/evidence").get_json()
    assert evidence["count"] == 3
    images = seeded_client.get(f"/api/cases/{case_id}/evidence?type=Image").get_json()
    assert images["count"] == 2

    one = seeded_client.get(f"/api/evidence/{evidence['evidence'][0]['id']}")
    assert one.status_code == 200
    assert one.get_json()["case_id"] == case_id
    assert seeded_client.get("/api/evidence/9999").status_code == 404

    timeline = seeded_client.get(f"/api/cases/{case_id}/timeline").get_json()
    assert [e["title"] for e in timeline["events"]] == [
        "Initial Complaint", "Property Damage", "Follow-up Request",
    ]
    assert timeline["events"][0]["evidence"][0]["title"] == "Message Screenshot"
    assert seeded_client.get("/api/cases/9999/timeline").status_code == 404
