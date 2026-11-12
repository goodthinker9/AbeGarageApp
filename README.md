# Abe Garage App

Full-stack garage management system.  
**Backend:** Node.js / Express / PostgreSQL (Supabase)  
**Frontend:** React (CRA)  
**Deployment target:** Render (backend) · Vercel (frontend)

---

## Project structure

```
code/
  backend/   – Express API
  frontend/  – React SPA
docs/        – PROGRESS.md, DECISIONS.md
Resources/   – DB schema copies
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22 LTS or 24 LTS (not 26 — see DECISIONS.md) |
| npm | 9+ |
| A Supabase project | with `DATABASE_URL` from the pooler settings |

---

## Environment variables

### Backend — `code/backend/.env`

Copy `code/backend/.env.example` and fill in real values.

| Variable | Description |
|----------|-------------|
| `PORT` | Port the Express server listens on (default `8000`) |
| `DATABASE_URL` | Supabase session-mode pooler URL (`pgbouncer=true`) |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `http://localhost:3000`) |
| `ADMIN_EMAIL` | Used only by `npm run seed:admin` |
| `ADMIN_PASSWORD` | Used only by `npm run seed:admin` |

### Frontend — `code/frontend/.env`

Copy `code/frontend/.env.example`.

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Full URL of the backend (e.g. `http://localhost:8000`) |

---

## First-time setup

```bash
# 1. Install backend dependencies
cd code/backend
npm install

# 2. Create .env from the example and fill in values
cp .env.example .env
# edit .env — set DATABASE_URL, JWT_SECRET, FRONTEND_URL

# 3. Create all tables in Supabase (safe to re-run)
npm run db:setup

# 4. Create the first admin account
#    Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first (or inline)
ADMIN_EMAIL=admin@garage.com ADMIN_PASSWORD=StrongPass1 npm run seed:admin

# 5. Start the API server
npm start
# or for development with auto-restart:
npm run dev
```

```bash
# 6. Install frontend dependencies
cd code/frontend
npm install

# 7. Create .env
cp .env.example .env
# edit .env — set REACT_APP_API_URL=http://localhost:8000

# 8. Start the React dev server
npm start
```

---

## Available scripts

### Backend (`code/backend`)

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start with Node `--watch` (auto-restart on file change) |
| `npm run db:setup` | Apply the Postgres schema (idempotent) |
| `npm run seed:admin` | Create the first admin employee (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD`) |

### Frontend (`code/frontend`)

| Script | Description |
|--------|-------------|
| `npm start` | CRA dev server |
| `npm run build` | Production build |

---

## Testing locally with curl / Postman

### Login
```bash
curl -s -X POST http://localhost:8000/api/employee/login \
  -H "Content-Type: application/json" \
  -d '{"employee_email":"admin@garage.com","employee_password":"StrongPass1"}' \
  | python -m json.tool
```

Expected: `{ "status": "success", "data": { "employee_token": "eyJ..." } }`

### Get all employees (admin only)
```bash
TOKEN="eyJ..."   # paste token from above

curl -s http://localhost:8000/api/employees \
  -H "x-access-token: $TOKEN" \
  | python -m json.tool
```

### Add employee (admin only)
```bash
curl -s -X POST http://localhost:8000/api/employee \
  -H "Content-Type: application/json" \
  -H "x-access-token: $TOKEN" \
  -d '{
    "employee_email": "jane@garage.com",
    "employee_first_name": "Jane",
    "employee_last_name": "Doe",
    "employee_phone": "555-123-4567",
    "employee_password": "password123",
    "active_employee": 1,
    "company_role_id": 1
  }' | python -m json.tool
```

---

## Deployment

### Backend → Render

1. Set all env vars in the Render service dashboard (do NOT commit `.env`).
2. Build command: `npm install`
3. Start command: `npm start`
4. Run `npm run db:setup` once via the Render Shell after first deploy.

### Frontend → Vercel

1. Set `REACT_APP_API_URL` to the Render backend URL in Vercel project settings.
2. The `vercel.json` SPA rewrite handles client-side routing automatically.

---

## Security notes

- `.env` and `.env.*` are git-ignored; only `.env.example` is committed.
- No passwords or secrets appear anywhere in the source code.
- Login is rate-limited to 10 requests per 15 minutes per IP.
- All responses include security headers via `helmet`.
- Employee creation is wrapped in a database transaction.
