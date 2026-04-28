import uuid
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Claim, ClaimHistory, User

claims_bp = Blueprint("claims", __name__)

VALID_STATUSES = ["Submitted", "Under Review", "Additional Info Required", "Approved", "Rejected"]
VALID_TYPES = ["Auto", "Home", "Health", "Travel", "Life", "Commercial"]
VALID_PRIORITIES = ["Low", "Normal", "High", "Urgent"]


def generate_claim_number():
    return "CLM-" + str(uuid.uuid4())[:8].upper()


def current_user():
    return User.query.get(int(get_jwt_identity()))


# ─── Claimant: submit a claim ─────────────────────────────────────────────────
@claims_bp.route("/", methods=["POST"])
@jwt_required()
def submit_claim():
    user = current_user()
    data = request.get_json()

    required = ["claim_type", "description", "amount", "incident_date"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"{f} is required"}), 400

    if data["claim_type"] not in VALID_TYPES:
        return jsonify({"error": "Invalid claim type"}), 400

    try:
        inc_date = date.fromisoformat(data["incident_date"])
    except ValueError:
        return jsonify({"error": "incident_date must be YYYY-MM-DD"}), 400

    claim = Claim(
        claim_number=generate_claim_number(),
        user_id=user.id,
        claim_type=data["claim_type"],
        description=data["description"],
        amount=float(data["amount"]),
        priority=data.get("priority", "Normal"),
        incident_date=inc_date,
        status="Submitted",
    )
    db.session.add(claim)
    db.session.flush()

    history = ClaimHistory(
        claim_id=claim.id,
        changed_by=user.name,
        old_status=None,
        new_status="Submitted",
        note="Claim submitted by claimant.",
    )
    db.session.add(history)
    db.session.commit()
    return jsonify(claim.to_dict()), 201


# ─── Get claims (admin: all, claimant: own) ───────────────────────────────────
@claims_bp.route("/", methods=["GET"])
@jwt_required()
def get_claims():
    user = current_user()
    status = request.args.get("status")
    claim_type = request.args.get("type")
    search = request.args.get("search", "")

    query = Claim.query if user.role == "admin" else Claim.query.filter_by(user_id=user.id)

    if status:
        query = query.filter_by(status=status)
    if claim_type:
        query = query.filter_by(claim_type=claim_type)
    if search:
        query = query.filter(
            Claim.claim_number.ilike(f"%{search}%") | Claim.description.ilike(f"%{search}%")
        )

    claims = query.order_by(Claim.created_at.desc()).all()
    return jsonify([c.to_dict() for c in claims]), 200


# ─── Get single claim ─────────────────────────────────────────────────────────
@claims_bp.route("/<int:claim_id>", methods=["GET"])
@jwt_required()
def get_claim(claim_id):
    user = current_user()
    claim = Claim.query.get_or_404(claim_id)
    if user.role != "admin" and claim.user_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify(claim.to_dict()), 200


# ─── Update claim status (admin only) ────────────────────────────────────────
@claims_bp.route("/<int:claim_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(claim_id):
    user = current_user()
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    new_status = data.get("status")
    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {VALID_STATUSES}"}), 400

    claim = Claim.query.get_or_404(claim_id)
    old_status = claim.status
    claim.status = new_status
    claim.admin_notes = data.get("admin_notes", claim.admin_notes)
    claim.updated_at = datetime.utcnow()

    history = ClaimHistory(
        claim_id=claim.id,
        changed_by=user.name,
        old_status=old_status,
        new_status=new_status,
        note=data.get("note", ""),
    )
    db.session.add(history)
    db.session.commit()
    return jsonify(claim.to_dict()), 200


# ─── Update priority (admin only) ────────────────────────────────────────────
@claims_bp.route("/<int:claim_id>/priority", methods=["PATCH"])
@jwt_required()
def update_priority(claim_id):
    user = current_user()
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    priority = data.get("priority")
    if priority not in VALID_PRIORITIES:
        return jsonify({"error": "Invalid priority"}), 400

    claim = Claim.query.get_or_404(claim_id)
    claim.priority = priority
    db.session.commit()
    return jsonify(claim.to_dict()), 200


# ─── Delete claim (admin only) ────────────────────────────────────────────────
@claims_bp.route("/<int:claim_id>", methods=["DELETE"])
@jwt_required()
def delete_claim(claim_id):
    user = current_user()
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403
    claim = Claim.query.get_or_404(claim_id)
    db.session.delete(claim)
    db.session.commit()
    return jsonify({"message": "Claim deleted"}), 200


# ─── Dashboard stats (admin) ──────────────────────────────────────────────────
@claims_bp.route("/stats/summary", methods=["GET"])
@jwt_required()
def stats():
    user = current_user()
    if user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    total = Claim.query.count()
    by_status = {}
    for s in VALID_STATUSES:
        by_status[s] = Claim.query.filter_by(status=s).count()

    by_type = {}
    for t in VALID_TYPES:
        by_type[t] = Claim.query.filter_by(claim_type=t).count()

    total_amount = db.session.query(db.func.sum(Claim.amount)).scalar() or 0
    approved_amount = (
        db.session.query(db.func.sum(Claim.amount)).filter_by(status="Approved").scalar() or 0
    )

    return jsonify(
        {
            "total_claims": total,
            "total_users": User.query.filter_by(role="claimant").count(),
            "by_status": by_status,
            "by_type": by_type,
            "total_amount": round(total_amount, 2),
            "approved_amount": round(approved_amount, 2),
        }
    ), 200
