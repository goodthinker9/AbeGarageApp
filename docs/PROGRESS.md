# Progress

## Step 1 — Security cleanup + Supabase/Postgres migration (DONE ✓)

See git commit `bfd22eb` for full details. All items from the original Step 1 spec are complete.

---

## Step 2 — Review fixes + Services module (DONE ✓)

### Part A — Fixes

| # | Task | Status |
|---|------|--------|
| A1 | Removed unused `Button` import from `EmployeesList.js` | ✓ |
| A1 | Removed unused `setActiveEmployee` from `AddEmployeeForm.js` | ✓ |
| A1 | Fixed `useEffect` dependency array in `EmployeesList.js` — added `token` and `navigate` | ✓ |
| A1 | Fixed all `href="#"` and `.html` anchors in `Footer.js` — replaced with `<Link>` and real external URLs | ✓ |
| A1 | `CI=true npm run build` passes with zero ESLint warnings | ✓ |
| A2 | Added `ALTER TABLE … ENABLE ROW LEVEL SECURITY` for all 13 tables in `initial-queries.sql` with explanatory comment | ✓ |
| A2 | Copied updated schema to `Resources/DB Designs/` | ✓ |
| A2 | Applied RLS to existing Supabase tables via `npm run db:setup` | ✓ |
| A3 | Added `app.set('trust proxy', 1)` to `app.js` | ✓ |
| A3 | Added `skipSuccessfulRequests: true` to `loginLimiter` | ✓ |
| A4 | Created `middlewares/validate.js` with hand-written validators for login, create-employee, create-service, update-service | ✓ |
| A4 | Wired `validateLogin` into `login.routes.js` | ✓ |
| A4 | Wired `validateCreateEmployee` into `employee.routes.js` | ✓ |
| A4 | Password minimum raised to 8 chars in both backend validators and both frontend forms | ✓ |
| A5 | Deleted `install.controller.js`, `install.routes.js`, `install.service.js` (dead stubs) | ✓ |
| A5 | Other stub files (`customer.*`, `order.*`, `vehicle.*`) left in place — listed as "not started" in Step 3 below | ✓ |
| A6 | Added `"engines": {"node": ">=20 <25"}` to `backend/package.json` | ✓ |
| A6 | Created `code/backend/.nvmrc` pinned to Node 22 | ✓ |
| A6 | Fixed README and DECISIONS so Node version statements agree | ✓ |
| A6 | Replaced `pgbouncer=true` reference in README with the correct SESSION pooler string format | ✓ |
| A7 | Replaced broken relative icon path in Header with imported `icon-bar.png` asset | ✓ |
| A7 | Implemented React-state hamburger menu (open/close toggle) with same links as desktop nav, plus Admin links when logged in | ✓ |
| A8 | `util/auth.js`: checks JWT `exp` claim; clears `localStorage` and returns `{}` if token is expired or malformed | ✓ |
| A8 | `EmployeesList.js`: on 401 response, clears `localStorage` and navigates to `/login` | ✓ |
| A9 | Built real landing page in `Home.js` (hero, intro, services highlights from API, CTA) | ✓ |
| A9 | Created `src/config/garage.js` with address, phone, email, hours as single-source constants | ✓ |
| A9 | Updated `Contact.js` to use `garage.js` config | ✓ |

### Part B — Services module

| # | Task | Status |
|---|------|--------|
| B1 | `services/service.service.js` — `getAllActiveServices`, `getAllServices`, `getServiceById`, `createService`, `updateService` (dynamic SET) | ✓ |
| B2 | `controllers/service.controller.js` — 5 handlers, all with `next(err)` | ✓ |
| B3 | `routes/service.routes.js` — GET /api/services (public), /api/services/all, /api/service/:id, POST /api/service, PUT /api/service (all wired with validation) | ✓ |
| B4 | Added `isManagerOrAdmin` to `auth.middleware.js` (uses JWT role, no extra DB hit) | ✓ |
| B5 | `app.js` split into `app.js` (config) + `server.js` (listen) so tests don't bind a port | ✓ |
| B6 | `src/services/service.service.js` frontend — 5 API call functions | ✓ |
| B7 | Public `/services` page — loading state, error state, API-driven list | ✓ |
| B8 | `/admin/services` — table with Active, Name, Description, Edit button (roles 2,3) | ✓ |
| B9 | `/admin/add-service` — form with validation (roles 2,3) | ✓ |
| B10 | `/admin/service/edit/:id` — edit form with active toggle (roles 2,3) | ✓ |
| B11 | Services link added to `AdminMenu.js` | ✓ |
| B12 | All new routes wired in `App.js` with `PrivateAuthRoute` | ✓ |

### Part C — Tests and docs

| # | Task | Status |
|---|------|--------|
| C1 | `__tests__/login.test.js` — 4 validation tests + 1 integration test (skipped without real DB) | ✓ |
| C2 | `__tests__/services.test.js` — auth gate tests + public endpoint test | ✓ |
| C3 | All 11 tests pass: `npm test` → `Tests: 11 passed, 11 total` | ✓ |
| C4 | `README.md` updated — new endpoints, curl examples, corrected Node/pooler notes | ✓ |
| C5 | `docs/PROGRESS.md` updated (this file) | ✓ |
| C6 | `docs/DECISIONS.md` updated — RLS, trust proxy, validation, no hard delete | ✓ |
| C7 | `CI=true npm run build` result: **Compiled successfully.** (exit 0, zero warnings) | ✓ |

---

## Step 3 — Customers + Vehicles (NOT STARTED)

Files present as empty stubs:
- `backend/routes/customer.routes.js`
- `backend/controllers/customer.controller.js`
- `backend/services/customer.service.js`
- `backend/routes/vehicle.routes.js`
- `backend/controllers/vehicle.controller.js`
- `backend/services/vehicle.service.js`

Planned work:
- GET /api/customers, POST /api/customer, PUT /api/customer — roles 2,3
- GET /api/customer/:id — roles 2,3
- GET /api/vehicles/:customer_id, POST /api/vehicle, PUT /api/vehicle — roles 2,3
- Frontend admin pages: CustomersList, AddCustomerForm, EditCustomer, VehiclesList

---

## Step 4 — Orders + Status workflow + Public order page (NOT STARTED)

Files present as empty stubs:
- `backend/routes/order.routes.js`
- `backend/controllers/order.controller.js`
- `backend/services/order.service.js`

---

## Step 5 — Deployment: Render + Vercel (NOT STARTED)

---
