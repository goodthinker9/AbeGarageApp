# Progress

## Step 1 — Security cleanup + Supabase/Postgres migration (DONE ✓)

### A. Security cleanup

| # | Task | Status |
|---|------|--------|
| A1 | Removed `code/backend/.env.production` and `code/frontend/.env.production` from git tracking (`git rm --cached`) | ✓ |
| A1 | Added `.env.*` (except `.env.example`) to all three `.gitignore` files | ✓ |
| A1 | Created `code/backend/.env.example` and `code/frontend/.env.example` with placeholder values only | ✓ |
| A2 | Removed `console.log(req.body)` from `login.controller.js` | ✓ |
| A2 | Removed `console.log(requestOptions)` from `frontend/src/services/employee.service.js` | ✓ |
| A2 | Removed all sensitive `console.log` calls from `LoginForm.js` and `login.service.js` | ✓ |
| A3 | Deleted the open `GET /install` route and its controller/service | ✓ |
| A3 | Created `scripts/setup-db.js` → `npm run db:setup` (idempotent schema runner) | ✓ |
| A3 | Created `scripts/seed-admin.js` → `npm run seed:admin` (reads env, refuses if missing) | ✓ |
| A3 | No hardcoded password or hash anywhere in the repo | ✓ |
| A4 | `app.js` fails fast at startup if `JWT_SECRET`, `DATABASE_URL` or `FRONTEND_URL` is missing | ✓ |
| A4 | Added `helmet` and `express-rate-limit` (strict limit on `POST /api/employee/login`) | ✓ |
| A4 | Removed unused `sanitize` packages from both backend and frontend | ✓ |

### B. Supabase/Postgres migration

| # | Task | Status |
|---|------|--------|
| B5 | Replaced `mysql2` with `pg`; rewrote `config/db.config.js` with `Pool`, SSL, `query()` helper and `getClient()` for transactions | ✓ |
| B6 | Converted `services/sql/initial-queries.sql` to Postgres: `GENERATED ALWAYS AS IDENTITY`, `TIMESTAMPTZ DEFAULT now()`, `TEXT/VARCHAR`, foreign keys with `ON DELETE` rules, `UNIQUE` constraints, indexes on FKs, `active_service` on `common_services` | ✓ |
| B6 | Copied schema to `Resources/DB Designs/initial-queries.sql` | ✓ |
| B7 | Rewrote `employee.service.js` for pg (`$1/$2` placeholders, `RETURNING employee_id`) | ✓ |
| B7 | Wrapped `createEmployee` in a `BEGIN/COMMIT/ROLLBACK` transaction | ✓ |
| B7 | Rewrote `login.service.js` for pg | ✓ |

### C. Bug fixes

| # | Task | Status |
|---|------|--------|
| C8 | `login.controller.js`: added `return` after failure response; non-empty catch passes to `next(err)` | ✓ |
| C8 | Login rejects inactive employees (`active_employee = 0`) | ✓ |
| C9 | `login.service.js`: no longer swallows errors; throws for unexpected failures | ✓ |
| C9 | `employee.controller.js`: fixed `console.log(err)` referencing undefined `err` → `next(err)` | ✓ |
| C10 | `auth.middleware.js`: `verifyToken` and `isAdmin` wrapped so errors reach the global handler | ✓ |
| C10 | Added global error handler in `app.js` | ✓ |
| C11 | `/admin/employees` wrapped in `PrivateAuthRoute roles={[3]}` in `App.js` | ✓ |
| C11 | Removed duplicate auth logic and `console.log("Kebede")` from `Employees.js` | ✓ |
| C11 | Fixed email validation in `LoginForm.js` and `AddEmployeeForm.js` — missing `@` now sets `valid=false` | ✓ |
| C11 | Removed all sensitive `console.log` calls from frontend forms and services | ✓ |
| C12 | Added routes for `/about`, `/services`, `/contact`, and `* → 404` in `App.js` | ✓ |
| C12 | Replaced `<a href>` internal links in `Header.js` and `AdminMenu.js` with `<Link>` | ✓ |
| C12 | Fixed broken relative image path in sticky header (uses imported `logo` asset) | ✓ |
| C12 | Sticky header now shows the correct login/logout state | ✓ |
| C13 | Added `code/frontend/vercel.json` with SPA rewrite to `/index.html` | ✓ |

### D. Documentation

| # | Task | Status |
|---|------|--------|
| D14 | `README.md` — setup, env vars, scripts, curl test commands | ✓ |
| D14 | `docs/PROGRESS.md` — this file | ✓ |
| D14 | `docs/DECISIONS.md` — architectural decisions | ✓ |

---

## Step 2 — Customers, Vehicles, Orders, Services (TODO)

- Migrate remaining services (`customer.service.js`, `order.service.js`, `vehicle.service.js`, `service.service.js`) to pg.
- Rewrite their controllers and routes following the same patterns.
- Build out the frontend pages for Customers, Orders, Services.
- Add order status workflow.

## Step 3 — Deployment (TODO)

- Configure Render service (env vars, health check).
- Configure Vercel project (env vars).
- Set up CI/CD pipeline.
- Production smoke tests.
