import jwt
from  flask import Blueprint, request, jsonify
from .models import User
from .database import db
from .utils import generate_token, decode_token

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=["POST"])
def register_user():
    data = request.get_json()
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 409

    user = User(username = data["username"], email = data["email"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"user": "User registered Successfully"}), 201


@user_bp.route('/login', methods=["POST"])
def login():
    data = request.get_json()
    user =  User.query.filter_by(username = data["username"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    token = user.generate_token(user.id)
    return jsonify({"token": token}), 200


@user_bp.route('/profile', methods=["GET"])
def get_profile():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "No token provided"}), 401

    user_id = decode_token(token)
    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    user = User.query.filter_by(id=user_id).first()
    return jsonify({"id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "created_at": user.created_at.isoformat(),
                    }), 200


@user_bp.route("/profiles", methods=["GET"])
def get_all_profiles():
    users = User.query.all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at.isoformat()
        })
    return jsonify(result)