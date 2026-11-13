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

> **Node version note:** `jsonwebtoken` is incompatible with Node 22+. This project uses `jose` instead, which works on all current Node versions. Use `.nvmrc` in `code/backend/` to pin your local version with nvm.

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

```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/<database>
```

- Host: `*.pooler.supabase.com`
- User: `postgres.<project-ref>`
- Port: `5432` (session mode)
- Do **not** append `?pgbouncer=true`

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
ADMIN_EMAIL=admin@garage.com ADMIN_PASSWORD=StrongPass1! npm run seed:admin

# 5. Start the API server
npm start          # production
npm run dev        # auto-restart during development
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
| `npm test` | Run Jest test suite (55 tests across 6 suites) |

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
| GET  | `/api/employees` | Admin (3) | List employees; supports `?limit=&offset=` (default 20, max 100); returns `{data, total}` |
| GET  | `/api/employee/:id` | Admin (3) | Single employee (no password hash) |
| PUT  | `/api/employee` | Admin (3) | Update employee; 400 if admin tries to deactivate/demote self |

### Services

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/services`       | Public          | Active services only |
| GET  | `/api/services/all`   | Manager/Admin   | All including inactive |
| GET  | `/api/service/:id`    | Manager/Admin   | Single service |
| POST | `/api/service`        | Manager/Admin   | Create service |
| PUT  | `/api/service`        | Manager/Admin   | Update / deactivate (`active_service: 0`) |

### Customers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/customers?search=&limit=&offset=` | Manager/Admin | List with ILIKE search + pagination; returns `{data, total}` |
| GET  | `/api/customer/:id`  | Manager/Admin | Customer + their vehicles |
| POST | `/api/customer`      | Manager/Admin | Create customer (transaction); 409 on duplicate email/phone |
| PUT  | `/api/customer`      | Manager/Admin | Update customer; 409 on duplicate email/phone |

### Vehicles

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/vehicles/:customer_id` | Manager/Admin | All vehicles for a customer |
| GET  | `/api/vehicle/:id`           | Manager/Admin | Single vehicle |
| POST | `/api/vehicle`               | Manager/Admin | Create vehicle; 404 if customer not found |
| PUT  | `/api/vehicle`               | Manager/Admin | Update vehicle |

---

## Testing locally with curl

```bash
# Login
curl -s -X POST http://localhost:8000/api/employee/login \
  -H "Content-Type: application/json" \
  -d '{"employee_email":"admin@garage.com","employee_password":"StrongPass1!"}' \
  | python -m json.tool

# Save the token
TOKEN="eyJ..."

# --- Customers ---

# List customers (search + pagination)
curl -s "http://localhost:8000/api/customers?search=john&limit=10&offset=0" \
  -H "x-access-token: $TOKEN" | python -m json.tool

# Create customer
curl -s -X POST http://localhost:8000/api/customer \
  -H "Content-Type: application/json" -H "x-access-token: $TOKEN" \
  -d '{
    "customer_email": "john@example.com",
    "customer_phone_number": "555-123-4567",
    "customer_first_name": "John",
    "customer_last_name": "Doe"
  }' | python -m json.tool

# Get customer + vehicles
curl -s http://localhost:8000/api/customer/1 \
  -H "x-access-token: $TOKEN" | python -m json.tool

# Update customer (deactivate)
curl -s -X PUT http://localhost:8000/api/customer \
  -H "Content-Type: application/json" -H "x-access-token: $TOKEN" \
  -d '{"customer_id":1,"active_customer_status":0}' | python -m json.tool

# --- Vehicles ---

# Add a vehicle
curl -s -X POST http://localhost:8000/api/vehicle \
  -H "Content-Type: application/json" -H "x-access-token: $TOKEN" \
  -d '{
    "customer_id": 1,
    "vehicle_year": 2019,
    "vehicle_make": "Toyota",
    "vehicle_model": "Camry",
    "vehicle_type": "Sedan",
    "vehicle_mileage": 45000,
    "vehicle_tag": "ABC-1234",
    "vehicle_serial": "1HGBH41JXMN109186",
    "vehicle_color": "Silver"
  }' | python -m json.tool

# Update a vehicle
curl -s -X PUT http://localhost:8000/api/vehicle \
  -H "Content-Type: application/json" -H "x-access-token: $TOKEN" \
  -d '{"vehicle_id":1,"vehicle_mileage":48000}' | python -m json.tool

# --- Services ---

# List active services (public)
curl -s http://localhost:8000/api/services | python -m json.tool

# Create a service
curl -s -X POST http://localhost:8000/api/service \
  -H "Content-Type: application/json" -H "x-access-token: $TOKEN" \
  -d '{"service_name":"Oil Change","service_description":"Full synthetic oil change."}' \
  | python -m json.tool

# Unknown API route → 404 JSON
curl -s http://localhost:8000/api/does-not-exist | python -m json.tool
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
- `app.set('trust proxy', 1)` ensures the correct client IP behind Render/Vercel.
- All responses include security headers via `helmet`.
- Employee and customer creation wrapped in database transactions.
- Row Level Security (RLS) enabled on all 13 tables.
- Input validated before reaching service/DB code; bad input returns 400, never 500.
- Unknown `/api` routes return 404 JSON (not an HTML error page).
- JWT `exp` checked client-side; expired tokens cleared from localStorage automatically.
