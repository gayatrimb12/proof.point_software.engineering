import re

from flask import Blueprint, g, jsonify, request, session
from sqlalchemy import func

from backend.extensions import db
from backend.models import User
from backend.permissions import error, login_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

MIN_PASSWORD_LENGTH = 8
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _unique_username(base):
    base = re.sub(r"[^A-Za-z0-9_.-]", "", base)[:60] or "user"
    candidate, n = base, 1
    while db.session.scalar(db.select(User.id).where(func.lower(User.username) == candidate.lower())):
        n += 1
        candidate = f"{base}{n}"
    return candidate


def _login(user):
    session.clear()
    session["user_id"] = user.id
    session.permanent = True


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    name = str(data.get("username") or data.get("full_name") or data.get("name") or "").strip()

    if not EMAIL_RE.match(email) or len(email) > 120:
        return error("A valid email address is required", 400)
    if len(password) < MIN_PASSWORD_LENGTH:
        return error(f"Password must be at least {MIN_PASSWORD_LENGTH} characters", 400)
    if db.session.scalar(db.select(User.id).where(func.lower(User.email) == email)):
        return error("An account with that email already exists", 409)

    if name:
        if len(name) > 80:
            return error("Name must be 80 characters or fewer", 400)
        username = _unique_username(name)
    else:
        username = _unique_username(email.split("@")[0])

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    _login(user)
    return jsonify({"user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    identifier = str(data.get("email") or data.get("username") or "").strip().lower()
    password = str(data.get("password", ""))

    if not identifier or not password:
        return error("Email and password are required", 400)

    user = db.session.scalar(
        db.select(User).where(
            (func.lower(User.email) == identifier) | (func.lower(User.username) == identifier)
        )
    )
    if user is None or not user.check_password(password):
        return error("Invalid email or password", 401)
    if not user.is_active_account:
        return error("This account has been deactivated", 403)

    _login(user)
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify({"user": g.user.to_dict()}), 200