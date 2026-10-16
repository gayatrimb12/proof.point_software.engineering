from datetime import datetime, timezone
from werkzeug.security import check_password_hash, generate_password_hash
from extensions import db


def utcnow():
    return datetime.now(timezone.utc)


event_evidence = db.Table(
    "event_evidence",
    db.Column("event_id", db.Integer, db.ForeignKey("timeline_events.id", ondelete="CASCADE"), primary_key=True),
    db.Column("evidence_id", db.Integer, db.ForeignKey("evidence.id", ondelete="CASCADE"), primary_key=True),
)


class User(db.Model):
    __tablename__ = "users"
    __table_args__ = (
        db.CheckConstraint("role IN ('user', 'admin')", name="ck_users_role"),
    )

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    is_active_account = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    memberships = db.relationship(
        "CaseMember", back_populates="user", cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        return self.role == "admin"

    def __repr__(self):
        return f"<User {self.username}>"


class Case(db.Model):
    __tablename__ = "cases"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False, default="General")
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    members = db.relationship(
        "CaseMember", back_populates="case", cascade="all, delete-orphan"
    )
    evidence_items = db.relationship(
        "Evidence", back_populates="case", cascade="all, delete-orphan"
    )
    timeline_events = db.relationship(
        "TimelineEvent",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="TimelineEvent.order_index",
    )

    @property
    def owners(self):
        return [m.user for m in self.members if m.role == "owner"]

    @property
    def collaborators(self):
        return [m.user for m in self.members if m.role == "collaborator"]

    def user_role(self, user):
        for m in self.members:
            if m.user_id == user.id:
                return m.role
        return None

    def __repr__(self):
        return f"<Case {self.title}>"


class CaseMember(db.Model):

    __tablename__ = "case_members"
    __table_args__ = (
        db.UniqueConstraint("case_id", "user_id", name="uq_case_members_case_user"),
        db.CheckConstraint("role IN ('owner', 'collaborator')", name="ck_case_members_role"),
    )

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False, default="collaborator")
    added_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    case = db.relationship("Case", back_populates="members")
    user = db.relationship("User", back_populates="memberships")


class Evidence(db.Model):
    __tablename__ = "evidence"

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    evidence_type = db.Column(db.String(50), nullable=False)
    file_path = db.Column(db.String(255))
    file_hash = db.Column(db.String(64), index=True)
    linked_person = db.Column(db.String(120))
    date_assigned = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    case = db.relationship("Case", back_populates="evidence_items")
    uploader = db.relationship("User")
    linked_events = db.relationship(
        "TimelineEvent", secondary=event_evidence, back_populates="evidence_links"
    )

    def __repr__(self):
        return f"<Evidence {self.title}>"


class TimelineEvent(db.Model):
    __tablename__ = "timeline_events"

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.DateTime, nullable=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    case = db.relationship("Case", back_populates="timeline_events")
    evidence_links = db.relationship(
        "Evidence", secondary=event_evidence, back_populates="linked_events"
    )

    def __repr__(self):
        return f"<TimelineEvent {self.title}>"