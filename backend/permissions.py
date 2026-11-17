from datetime import datetime, timezone
from functools import wraps

from flask import g, jsonify, session

from backend.extensions import db
from backend.models import Case, utcnow, User

ROLE_RANK = {"viewer": 1, "editor": 2, "owner": 3}


def error(message, status):
    return jsonify({"error": message}), status


def current_user():
    user_id = session.get("user_id")
    if user_id is None:
        return None
    user = db.session.get(User, user_id)
    if user is None or not user.is_active_account:
        session.pop("user_id", None)
        return None
    return user


def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        user = current_user()
        if user is None:
            return error("Authentication required", 401)
        g.user = user
        return view(*args, **kwargs)
    return wrapper


def role_in_case(case, user):
    if user.is_admin:
        return "owner"
    return case.user_role(user)


def get_case_for_user(case_id, min_role="viewer"):
    case = db.session.get(Case, case_id)
    if case is None:
        return None, error("Case not found", 404)
    role = role_in_case(case, g.user)
    if role is None:
        return None, error("Case not found", 404)
    if ROLE_RANK[role] < ROLE_RANK[min_role]:
        return None, error("You do not have permission to do that", 403)
    return case, None


def touch(case):
    case.updated_at = utcnow()


def parse_datetime(value):
    if isinstance(value, datetime):
        dt = value
    else:
        text = str(value).strip()
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        dt = datetime.fromisoformat(text)
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt
