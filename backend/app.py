import os
from datetime import timedelta
from flask import Flask, jsonify
from dotenv import load_dotenv
from extensions import db, jwt, bcrypt, cors

load_dotenv()


def create_app():
    app = Flask(__name__)

    # Config
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "devsecret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwtdevsecret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///claims.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Blueprints
    from routes.auth import auth_bp
    from routes.claims import claims_bp
    from routes.users import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(claims_bp, url_prefix="/api/claims")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    # Health check - this is what you see when you open localhost:5000 in browser
    @app.route("/")
    def health():
        return jsonify({
            "status": "ok",
            "message": "ClaimPortal API is running!",
            "endpoints": {
                "login": "POST /api/auth/login",
                "register": "POST /api/auth/register",
                "claims": "GET /api/claims/",
                "stats": "GET /api/claims/stats/summary"
            }
        })

    # Create tables + seed data
    with app.app_context():
        db.create_all()
        seed_data()

    return app


def seed_data():
    from models import User, Claim, ClaimHistory
    from datetime import date
    import uuid

    if User.query.count() > 0:
        return

    admin = User(name="Admin User", email="admin@claimportal.com", role="admin", phone="9000000000")
    admin.set_password("admin123")
    db.session.add(admin)

    claimant = User(name="Chetan Rathod", email="chetan@example.com", role="claimant", phone="8919104623")
    claimant.set_password("chetan123")
    db.session.add(claimant)
    db.session.flush()

    samples = [
        {"type": "Auto",   "desc": "Car accident on NH65 highway, front bumper damage.",        "amount": 45000,  "status": "Approved",      "priority": "High",   "date": date(2025, 10, 12)},
        {"type": "Home",   "desc": "Roof damage due to cyclone Michaung.",                       "amount": 120000, "status": "Under Review",   "priority": "Urgent", "date": date(2025, 11, 5)},
        {"type": "Health", "desc": "Emergency hospitalization — dengue fever treatment.",        "amount": 32000,  "status": "Submitted",      "priority": "Normal", "date": date(2026, 1, 18)},
        {"type": "Travel", "desc": "Flight cancellation, missed connecting flight to Dubai.",    "amount": 15000,  "status": "Rejected",       "priority": "Low",    "date": date(2025, 12, 3)},
        {"type": "Auto",   "desc": "Theft of motorcycle from parking area.",                    "amount": 68000,  "status": "Under Review",   "priority": "High",   "date": date(2026, 2, 8)},
    ]

    for s in samples:
        claim = Claim(
            claim_number="CLM-" + str(uuid.uuid4())[:8].upper(),
            user_id=claimant.id,
            claim_type=s["type"],
            description=s["desc"],
            amount=s["amount"],
            status=s["status"],
            priority=s["priority"],
            incident_date=s["date"],
        )
        db.session.add(claim)
        db.session.flush()
        hist = ClaimHistory(
            claim_id=claim.id,
            changed_by="Admin User",
            old_status=None,
            new_status=s["status"],
            note="Initial status set."
        )
        db.session.add(hist)

    db.session.commit()
    print("✅ Database seeded with demo data!")


app = create_app()

if __name__ == "__main__":
    print("\n🚀 ClaimPortal Backend running at http://localhost:5000")
    print("📋 API base: http://localhost:5000/api")
    print("🔑 Admin: admin@claimportal.com / admin123")
    print("👤 User:  chetan@example.com / chetan123\n")
    app.run(debug=True, port=5000)