# Abe Garage App

Full-stack garage management system.  
**Backend:** Node.js / Express / PostgreSQL (Supabase)  
**Frontend:** React (CRA)  
**Deployment target:** Render (backend) · Vercel (frontend)

---

## Project structure

```
code/
  backend/   – Express API (routes → controllers → services)
  frontend/  – React SPA
docs/        – PROGRESS.md, DECISIONS.md
Resources/   – DB schema copies
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 LTS or 22 LTS (engines: `>=20 <25`) |
| npm | 9+ |
| A Supabase project | with the SESSION pooler `DATABASE_URL` |

> **Node version note:** `jsonwebtoken` is incompatible with Node 22+. This project uses `jose` instead, which works on all current Node versions. The backend `package.json` enforces `>=20 <25`. Use the `.nvmrc` in `code/backend/` to pin your local version with nvm.

---

## Environment variables

### Backend — `code/backend/.env`

Copy `code/backend/.env.example` and fill in real values.

| Variable | Description |
|----------|-------------|
| `PORT` | Port the Express server listens on (default `8000`) |
| `DATABASE_URL` | Supabase **session-mode pooler** connection string (see below) |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `http://localhost:3000`) |
| `ADMIN_EMAIL` | Used only by `npm run seed:admin` |
| `ADMIN_PASSWORD` | Used only by `npm run seed:admin` |

#### Supabase SESSION pooler URL format

Use the **Session mode** pooler (not Transaction mode) so `SET` commands work:

```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/<database>
```

- Host: `*.pooler.supabase.com`  
- User: `postgres.<project-ref>`  
- Port: `5432` (session mode)  
- Do **not** append `?pgbouncer=true` — that is for transaction mode

### Frontend — `code/frontend/.env`

Copy `code/frontend/.env.example`.

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Full URL of the backend (e.g. `http://localhost:8000`) |
| `GENERATE_SOURCEMAP` | Set to `false` to suppress third-party CSS source-map warnings |

---

## First-time setup

```bash
# 1. Install backend dependencies
cd code/backend
npm install

# 2. Create .env from the example and fill in values
cp .env.example .env

# 3. Create all tables in Supabase (safe to re-run)
npm run db:setup

# 4. Create the first admin account
#    Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first (or inline)
ADMIN_EMAIL=admin@garage.com ADMIN_PASSWORD=StrongPass1! npm run seed:admin

# 5. Start the API server
npm start
# or for auto-restart during development:
npm run dev
```

```bash
# 6. Install frontend dependencies
cd code/frontend
npm install

# 7. Create .env
cp .env.example .env

# 8. Start the React dev server
npm start

# 9. Production build (CI-safe, zero warnings)
CI=true npm run build
```

---

## Available scripts

### Backend (`code/backend`)

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server (`server.js`) |
| `npm run dev` | Start with Node `--watch` |
| `npm run db:setup` | Apply the Postgres schema (idempotent) |
| `npm run seed:admin` | Create the first admin employee |
| `npm test` | Run Jest test suite (11 tests) |

### Frontend (`code/frontend`)

| Script | Description |
|--------|-------------|
| `npm start` | CRA dev server |
| `npm run build` | Production build |

---

## API reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/employee/login` | Public | Login; returns JWT |

### Employees

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/employee` | Admin (3) | Create employee |
| GET  | `/api/employees` | Admin (3) | List employees |

### Services

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/services`      | Public       | Active services only |
| GET  | `/api/services/all`  | Manager/Admin (2,3) | All services including inactive |
| GET  | `/api/service/:id`   | Manager/Admin (2,3) | Single service |
| POST | `/api/service`       | Manager/Admin (2,3) | Create service |
| PUT  | `/api/service`       | Manager/Admin (2,3) | Update service (deactivate with `active_service: 0`) |

---

## Testing locally with curl

### Login
```bash
curl -s -X POST http://localhost:8000/api/employee/login \
  -H "Content-Type: application/json" \
  -d '{"employee_email":"admin@garage.com","employee_password":"StrongPass1!"}' \
  | python -m json.tool
```

### Get active services (public)
```bash
curl -s http://localhost:8000/api/services | python -m json.tool
```

### Create a service (manager/admin)
```bash
TOKEN="eyJ..."
curl -s -X POST http://localhost:8000/api/service \
  -H "Content-Type: application/json" \
  -H "x-access-token: $TOKEN" \
  -d '{"service_name":"Oil Change","service_description":"Full synthetic oil change with filter."}' \
  | python -m json.tool
```

### Update a service (deactivate)
```bash
curl -s -X PUT http://localhost:8000/api/service \
  -H "Content-Type: application/json" \
  -H "x-access-token: $TOKEN" \
  -d '{"service_id":1,"active_service":0}' \
  | python -m json.tool
```

### Get all services including inactive (manager/admin)
```bash
curl -s http://localhost:8000/api/services/all \
  -H "x-access-token: $TOKEN" | python -m json.tool
```

### Get all employees (admin)
```bash
curl -s http://localhost:8000/api/employees \
  -H "x-access-token: $TOKEN" | python -m json.tool
```

### Add employee (admin)
```bash
curl -s -X POST http://localhost:8000/api/employee \
  -H "Content-Type: application/json" \
  -H "x-access-token: $TOKEN" \
  -d '{
    "employee_email": "jane@garage.com",
    "employee_first_name": "Jane",
    "employee_last_name": "Doe",
    "employee_phone": "555-123-4567",
    "employee_password": "password12345",
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
5. Run `npm run seed:admin` via the Render Shell with real credentials.

### Frontend → Vercel

1. Set `REACT_APP_API_URL` to the Render backend URL.
2. Set `GENERATE_SOURCEMAP=false`.
3. The `vercel.json` SPA rewrite handles client-side routing.

---

## Security notes

- `.env` and `.env.*` are git-ignored; only `.env.example` is committed.
- No passwords or secrets in source code or git history.
- Login rate-limited to 10 failed attempts per 15 minutes per IP (`skipSuccessfulRequests: true`).
- `app.set('trust proxy', 1)` ensures the correct client IP is used for rate-limiting behind Render/Vercel.
- All responses include security headers via `helmet`.
- Employee creation is wrapped in a database transaction.
- Row Level Security (RLS) is enabled on all tables (backend connects as DB owner, so queries are unaffected).
- Input is validated before reaching service/DB code; bad input returns 400, never 500.
- JWT `exp` is checked client-side in `util/auth.js`; expired tokens are cleared from localStorage automatically.
