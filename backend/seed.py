import argparse
import hashlib
from datetime import datetime
from backend.app import create_app
from backend.extensions import db
from backend.models import Case, CaseMember, Evidence, TimelineEvent, User

DEMO_PASSWORD = "password123"


def _hash(text):
    return hashlib.sha256(text.encode()).hexdigest()


def seed_database(reset=False):
    if reset:
        db.drop_all()
        db.create_all()
    else:
        db.create_all()
        if db.session.scalar(db.select(db.func.count(User.id))):
            return None

    admin = User(username="admin", email="admin@proofpoint.dev", role="admin")
    alice = User(username="alice", email="alice@proofpoint.dev")
    bob = User(username="bob", email="bob@proofpoint.dev")
    for user in (admin, alice, bob):
        user.set_password(DEMO_PASSWORD)
    db.session.add_all([admin, alice, bob])
    db.session.flush()

    apartment = Case(
        title="Apartment Dispute",
        category="Housing",
        description="Evidence related to an apartment maintenance issue.",
    )
    package = Case(
        title="Damaged Package",
        category="Product Issue",
        description="Evidence related to a damaged package delivery.",
    )
    db.session.add_all([apartment, package])
    db.session.flush()

    db.session.add_all([
        CaseMember(case_id=apartment.id, user_id=alice.id, role="owner"),
        CaseMember(case_id=apartment.id, user_id=bob.id, role="collaborator"),
        CaseMember(case_id=package.id, user_id=bob.id, role="owner"),
    ])

    screenshot = Evidence(
        case_id=apartment.id, uploaded_by=alice.id,
        title="Message Screenshot", evidence_type="Image",
        description="Screenshot of the initial complaint sent to the landlord.",
        file_path="uploads/message_screenshot.png",
        file_hash=_hash("message_screenshot.png"),
        linked_person="Landlord", date_assigned=datetime(2026, 8, 3),
    )
    damage_photo = Evidence(
        case_id=apartment.id, uploaded_by=alice.id,
        title="Damage Photo", evidence_type="Image",
        description="Photo showing the water damage on the ceiling.",
        file_path="uploads/damage_photo.jpg",
        file_hash=_hash("damage_photo.jpg"),
        date_assigned=datetime(2026, 8, 6),
    )
    email = Evidence(
        case_id=apartment.id, uploaded_by=bob.id,
        title="Follow-up Email", evidence_type="Document",
        description="Email requesting repairs a second time.",
        file_path="uploads/followup_email.pdf",
        file_hash=_hash("followup_email.pdf"),
        linked_person="Landlord", date_assigned=datetime(2026, 8, 8),
    )
    receipt = Evidence(
        case_id=package.id, uploaded_by=bob.id,
        title="Order Receipt", evidence_type="Document",
        description="Receipt showing the item was paid for.",
        file_path="uploads/order_receipt.pdf",
        file_hash=_hash("order_receipt.pdf"),
        date_assigned=datetime(2026, 10, 1),
    )
    box_photo = Evidence(
        case_id=package.id, uploaded_by=bob.id,
        title="Damaged Box Photo", evidence_type="Image",
        description="Photo of the crushed box on delivery.",
        file_path="uploads/damaged_box.jpg",
        file_hash=_hash("damaged_box.jpg"),
        date_assigned=datetime(2026, 10, 5),
    )
    db.session.add_all([screenshot, damage_photo, email, receipt, box_photo])

    db.session.add_all([
        TimelineEvent(
            case_id=apartment.id, order_index=0, event_date=datetime(2026, 8, 3),
            title="Initial Complaint",
            description="Sent a message about the apartment issue.",
            evidence_links=[screenshot],
        ),
        TimelineEvent(
            case_id=apartment.id, order_index=1, event_date=datetime(2026, 8, 6),
            title="Property Damage",
            description="Uploaded a photo showing the damage.",
            evidence_links=[damage_photo],
        ),
        TimelineEvent(
            case_id=apartment.id, order_index=2, event_date=datetime(2026, 8, 8),
            title="Follow-up Request",
            description="Sent another email requesting help.",
            evidence_links=[email],
        ),
        TimelineEvent(
            case_id=package.id, order_index=0, event_date=datetime(2026, 10, 1),
            title="Order Placed",
            description="Ordered the item online.",
            evidence_links=[receipt],
        ),
        TimelineEvent(
            case_id=package.id, order_index=1, event_date=datetime(2026, 10, 5),
            title="Package Delivered Damaged",
            description="Package arrived with a crushed box.",
            evidence_links=[box_photo],
        ),
    ])

    db.session.commit()

    return {
        "users": db.session.scalar(db.select(db.func.count(User.id))),
        "cases": db.session.scalar(db.select(db.func.count(Case.id))),
        "case_members": db.session.scalar(db.select(db.func.count(CaseMember.id))),
        "evidence": db.session.scalar(db.select(db.func.count(Evidence.id))),
        "timeline_events": db.session.scalar(db.select(db.func.count(TimelineEvent.id))),
    }


def main():
    parser = argparse.ArgumentParser(description="Seed the ProofPoint database.")
    parser.add_argument("--reset", action="store_true",
                        help="drop and recreate all tables before seeding")
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        counts = seed_database(reset=args.reset)

    if counts is None:
        print("Database already has data. Use --reset to wipe and re-seed.")
    else:
        print("Seeded:", ", ".join(f"{n} {k}" for k, n in counts.items()))
        print(f"Demo login: alice / bob / admin, password '{DEMO_PASSWORD}'")


if __name__ == "__main__":
    main()