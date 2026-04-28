from datetime import datetime
from extensions import db, bcrypt


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default="claimant")  # claimant | admin
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    claims = db.relationship("Claim", backref="owner", lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "created_at": self.created_at.isoformat(),
        }


class Claim(db.Model):
    __tablename__ = "claims"
    id = db.Column(db.Integer, primary_key=True)
    claim_number = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    claim_type = db.Column(db.String(50), nullable=False)  # Auto | Home | Health | Travel
    description = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default="Submitted")
    # Submitted → Under Review → Approved | Rejected | Additional Info Required
    priority = db.Column(db.String(20), default="Normal")  # Low | Normal | High | Urgent
    incident_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    admin_notes = db.Column(db.Text, nullable=True)
    history = db.relationship("ClaimHistory", backref="claim", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "claim_number": self.claim_number,
            "user_id": self.user_id,
            "user_name": self.owner.name if self.owner else "",
            "user_email": self.owner.email if self.owner else "",
            "claim_type": self.claim_type,
            "description": self.description,
            "amount": self.amount,
            "status": self.status,
            "priority": self.priority,
            "incident_date": self.incident_date.isoformat(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "admin_notes": self.admin_notes,
            "history": [h.to_dict() for h in self.history],
        }


class ClaimHistory(db.Model):
    __tablename__ = "claim_history"
    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey("claims.id"), nullable=False)
    changed_by = db.Column(db.String(120), nullable=False)
    old_status = db.Column(db.String(30), nullable=True)
    new_status = db.Column(db.String(30), nullable=False)
    note = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "changed_by": self.changed_by,
            "old_status": self.old_status,
            "new_status": self.new_status,
            "note": self.note,
            "timestamp": self.timestamp.isoformat(),
        }
