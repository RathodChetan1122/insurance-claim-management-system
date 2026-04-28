from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
@jwt_required()
def get_users():
    uid = int(get_jwt_identity())
    me = User.query.get(uid)
    if not me or me.role != "admin":
        return jsonify({"error": "Admin only"}), 403
    users = User.query.filter_by(role="claimant").all()
    return jsonify([u.to_dict() for u in users]), 200
