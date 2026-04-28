# 🛡️ ClaimPortal — Insurance Claim Management System

A full-stack P&C Insurance Claim Management web application built with **Python Flask** (backend) and **React + Vite** (frontend). Designed as an internship portfolio project for ValueMomentum.

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-CORS |
| Frontend | React 18, React Router v6, Recharts, Axios, Vite |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## ✨ Features

- **Role-based auth**: Admin and Claimant roles with JWT
- **5-stage claim lifecycle**: Submitted → Under Review → Additional Info Required → Approved / Rejected
- **6 claim types**: Auto, Home, Health, Travel, Life, Commercial
- **Admin dashboard**: Charts (bar + pie via Recharts), KPI stats, status management
- **Claimant dashboard**: Pipeline view, recent claims, amounts
- **Audit trail**: Full history log for every status change with timestamps
- **REST API**: 10+ endpoints covering full CRUD
- **OOP design**: Clean model classes with inheritance patterns

---

## 🚀 Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/insurance-claim-app.git
cd insurance-claim-app
```

### 2. Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Edit .env and set your SECRET_KEY and JWT_SECRET_KEY

# Run the backend
python app.py
# Runs on http://localhost:5000
# DB is auto-created + seeded on first run
```

### 3. Frontend setup
```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# For local dev, VITE_API_URL can stay as /api (proxied by Vite)

# Run the frontend
npm run dev
# Runs on http://localhost:3000
```

### 4. Demo login credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@claimportal.com | admin123 |
| Claimant | chetan@example.com | chetan123 |

---

## 📁 Project Structure

```
insurance-claim-app/
├── backend/
│   ├── app.py              # Flask app factory + seeding
│   ├── extensions.py       # db, jwt, bcrypt, cors
│   ├── models.py           # User, Claim, ClaimHistory (OOP)
│   ├── requirements.txt
│   ├── .env.example
│   └── routes/
│       ├── auth.py         # /api/auth/register, login, me
│       ├── claims.py       # /api/claims/ (CRUD + stats)
│       └── users.py        # /api/users/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css       # Full design system
│   │   ├── components/
│   │   │   └── Layout.jsx  # Sidebar navigation
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ClaimantDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── MyClaims.jsx
│   │   │   ├── SubmitClaim.jsx
│   │   │   ├── ClaimDetail.jsx
│   │   │   ├── AdminClaims.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   └── Profile.jsx
│   │   └── utils/
│   │       ├── api.js      # Axios instance
│   │       └── helpers.js  # formatters, badge mappers
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example
└── README.md
```

---

## 🌐 Deployment Guide

### Step 1 — Push to GitHub

```bash
# In the project root
git init
git add .
git commit -m "Initial commit: Insurance Claim Management System"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/insurance-claim-app.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Deploy Backend on Render (Free)

1. Go to **https://render.com** → Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → Select `insurance-claim-app` repo
4. Configure:
   - **Name**: `claimportal-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Under **Environment Variables**, add:
   - `SECRET_KEY` → any random string (e.g. use https://randomkeygen.com)
   - `JWT_SECRET_KEY` → another random string
   - `DATABASE_URL` → `sqlite:///claims.db`
   - `FLASK_ENV` → `production`
6. Click **"Create Web Service"**
7. Wait ~2 min → Copy your URL: `https://claimportal-backend.onrender.com`

---

### Step 3 — Deploy Frontend on Vercel (Free)

1. Go to **https://vercel.com** → Sign up / Log in with GitHub
2. Click **"Add New Project"** → Import `insurance-claim-app`
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` → `https://claimportal-backend.onrender.com/api`
     *(Replace with your actual Render URL from Step 2)*
5. Click **"Deploy"**
6. Your app is live at: `https://claimportal-xyz.vercel.app`

---

### Step 4 — Enable CORS for production

After deploying, update `backend/app.py` CORS line if needed:
```python
cors.init_app(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000",
    "https://YOUR-VERCEL-URL.vercel.app"
]}})
```
Then redeploy backend.

---

## 📊 REST API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | None | Register new user |
| POST | /api/auth/login | None | Login, get JWT |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/claims/ | JWT | List claims |
| POST | /api/claims/ | JWT | Submit claim |
| GET | /api/claims/:id | JWT | Get single claim |
| PATCH | /api/claims/:id/status | Admin | Update status |
| PATCH | /api/claims/:id/priority | Admin | Update priority |
| DELETE | /api/claims/:id | Admin | Delete claim |
| GET | /api/claims/stats/summary | Admin | Dashboard stats |

---

## 👨‍💻 Developer

**Chetan Rathod** — B.Tech CSE, Malla Reddy Engineering College, Hyderabad (2027)

- GitHub: github.com/RathodChetan1122
- Email: chetanrathodmrec@gmail.com
