# Financing App

Personal finance app for income allocation, savings tracking, and insights.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: FastAPI
- **Database**: PostgreSQL
- **Containers**: Podman + Podman Compose

## Quick Start

```bash
podman compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Local Development (without containers)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://financing:financing@localhost:5432/financing"
uvicorn main:app --reload
```

**Database:** Run Postgres (Podman: `podman compose up db -d`)

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/           # FastAPI
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── database.py
│   │   └── config.py
│   └── main.py
├── frontend/          # React + Vite
├── docs/
│   └── ARCHITECTURE.md
└── docker-compose.yml
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial scaffold"
git remote add origin https://github.com/YOUR_USERNAME/financing-app.git
git branch -M main
git push -u origin main
```
