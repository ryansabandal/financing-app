# Personal Finance App — Architecture & Tech Stack

## Proposed Architecture Diagram

```
┌─────────────────────────────┐
│      User / Browser         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Frontend (React + Vite)   │
│ • Income allocation config  │
│ • Transaction entry         │
│ • Dashboard & insights      │
└──────────────┬──────────────┘
               │ REST API
               ▼
┌─────────────────────────────┐
│   Backend API (FastAPI)     │
│ • Income segregation logic  │
│ • CRUD operations           │
│ • Insights aggregation      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      PostgreSQL             │
│ • allocation_config         │
│ • transactions              │
│ • income_entries            │
└─────────────────────────────┘

        ┌──────────────────────┐
        │  GCP (Optional)      │
        │  Cloud Run → API     │
        │  Cloud SQL → DB      │
        └──────────────────────┘
```

## Tech Stack

| Layer | Technology | Reasoning |
|-------|------------|-----------|
| **Frontend** | React + Vite | Minimal config, fast HMR, industry standard. No framework lock-in. Simpler than Next.js for a decoupled API app. |
| **Backend** | Python FastAPI | Sync/async support, automatic OpenAPI docs, type hints, low boilerplate. Easy to extend for insights logic. |
| **Database** | PostgreSQL | ACID, relational model fits allocations + transactions. Same SQL skills apply to Cloud SQL on GCP. |
| **Containers** | Podman + Podman Compose | Reproducible dev environment, rootless, Docker-compatible. Same compose format, straightforward path to Cloud Run. |
| **GCP (optional)** | Cloud Run + Cloud SQL | Serverless containers, managed Postgres. Aligns with GCP cert topics. |

## Containerization Rationale

**Why containerize:**
- Consistent dev setup (no "works on my machine")
- Single `podman compose up` to run app + DB
- Same images can run locally and on Cloud Run
- Good learning for GCP deployment

**Structure:**
```
financing-app/
├── frontend/          # React SPA (nginx in prod)
├── backend/           # FastAPI
├── docker-compose.yml  # frontend, backend, postgres (Podman-compatible)
└── docs/
```

Three services: `frontend`, `backend`, `postgres`. No extra layers (e.g. Redis, queue) until needed.

## Data Model (Minimal)

- **allocation_config**: `category` (savings, investments, emergency, expenses), `percentage`, `user_id` (for future multi-user)
- **transactions**: `amount`, `date`, `category`, `type` (income | expense), `description`
- **income_entries**: `amount`, `date` — raw income for segregation

From this, you derive:
- Allocated amounts per category for each income
- Historical aggregates for insights

## GCP Usage (Learning Path)

1. **Local**: Podman Compose only — no cloud required.
2. **Deploy**: Push images to Artifact Registry → deploy to Cloud Run.
3. **Database**: Keep Postgres in container for dev; migrate to Cloud SQL for production if desired.

Cloud Run fits this app well: stateless API, low traffic, pay-per-use.

## What This Stack Avoids

- **Next.js**: Extra complexity for a split frontend/backend setup. Use when you want SSR or unified routing.
- **Firestore**: Document DB; finance data is relational. Postgres is a better fit.
- **Kubernetes**: Overkill. Cloud Run handles scaling.
- **Redis/caching**: Add only if performance demands it.
