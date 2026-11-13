# Progress

## Step 1 — Security cleanup + Supabase/Postgres migration (DONE ✓)
See git commit `bfd22eb`.

## Step 2 — Review fixes + Services module (DONE ✓)
See git commit `439f740`.

## Step 3 — Small fixes + Customers + Vehicles (DONE ✓)
See git commit `9f93f81`.

## Step 3b — validateIdParam factory + ILIKE escape (DONE ✓)
See git commit `f795d65`.

---

## Step 4 — Employee edit + Admin dashboard + Frontend polish (DONE ✓)

### 1. Backend – employee edit

| Task | Status |
|------|--------|
| `GET /api/employee/:id` (role 3) — returns employee + role, no password hash | ✓ |
| `PUT /api/employee` (role 3) — `employee_id`, `employee_first_name`, `employee_last_name`, `employee_phone`, `active_employee`, `company_role_id`; validated; in a transaction; 404 if not found | ✓ |
| Prevent admin from deactivating their own account (400) | ✓ |
| Prevent admin from demoting their own role (400) | ✓ |
| `validateUpdateEmployee` added to `middlewares/validate.js` | ✓ |
| Validation placed *before* `isAdmin` DB call in routes so bad input returns 400 without hitting the DB | ✓ |
| `req.employee_id` populated from JWT in `verifyToken` for self-action checks | ✓ |
| `__tests__/employee_edit.test.js`: 13 tests covering role gate, bad id, missing fields, out-of-range role, bad active_employee value, self-deactivation, self-demotion | ✓ |

### 2. Frontend – /admin dashboard

| Task | Status |
|------|--------|
| `AdminDashboard.js` at `/admin` (roles 1,2,3): role-filtered cards linking to accessible pages, role name in greeting | ✓ |
| AdminMenu gains a "Dashboard" link at the top | ✓ |
| App.js: `/admin` route added with `PrivateAuthRoute roles={[1,2,3]}` | ✓ |

### 3. Frontend – employee edit

| Task | Status |
|------|--------|
| `EditEmployee.js` at `/admin/employee/edit/:id` (role 3): pre-populated form, active toggle, no delete | ✓ |
| EmployeesList: "Edit" button links to `/admin/employee/edit/:id`; dead "edit \| delete" text removed | ✓ |
| `employee.service.js`: added `getEmployeeById`, `updateEmployee` | ✓ |
| App.js: `/admin/employee/edit/:id` route added with `PrivateAuthRoute roles={[3]}` | ✓ |

### 4. Frontend – Footer

| Task | Status |
|------|--------|
| Footer now reads address, phone, email, hours from `garage.js` | ✓ |
| Invented "quality auto repair you can trust" blurb replaced with `garageInfo.highlights` list | ✓ |
| Dead "Our Services" column of static links removed; replaced with Contact column | ✓ |
| `BottomBanner.js` deleted (empty, unused) | ✓ |

### 5. Responsive admin pages

| Task | Status |
|------|--------|
| `custom.css`: `admin-table-wrapper` with `overflow-x: auto` on all admin tables | ✓ |
| `@media (max-width: 767px)`: sidebar stacks above content; menu items wrap 2-per-row | ✓ |
| `@media (max-width: 480px)`: menu items full-width | ✓ |
| AdminCustomers, AdminServices, CustomerDetail, EmployeesList tables wrapped in `admin-table-wrapper` | ✓ |

### 6. Docs + verification

| Task | Status |
|------|--------|
| README updated with new endpoints + curl examples | ✓ |
| `docs/PROGRESS.md` updated (this file) | ✓ |
| `docs/DECISIONS.md` updated | ✓ |
| `npm test` result: **6 suites, 48 tests, 48 passed** (exit 0) | ✓ |
| `CI=true npm run build` result: **Compiled successfully.** (exit 0, zero warnings) | ✓ |

---

## Step 5 — Orders + Status workflow + Public order page (NOT STARTED)

Empty stubs present: `order.routes.js`, `order.controller.js`, `order.service.js`.

## Step 6 — Deployment: Render + Vercel (NOT STARTED)
