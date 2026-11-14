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

## Step 5 — Orders (DONE ✓)

### Part A – Backend

| Task | Status |
|------|--------|
| `constants/orderStatus.js`: ORDER_STATUS 0/1/2 + names | ✓ |
| `services/order.service.js`: `createOrder` (transaction: orders + order_info + order_services + order_status), `getAllOrders` (paginated, search, status filter, role-1 sees only own), `getOrderById` (full detail), `updateOrder` (transaction, replace services), `updateOrderStatus` (completion_date on 2, clear on backtrack), `updateOrderService` | ✓ |
| `controllers/order.controller.js`: 6 handlers; ownership check for role 1 on get/status/service | ✓ |
| `routes/order.routes.js`: POST/GET/GET:id/PUT/PUT:status/PUT:service | ✓ |
| `validate.js`: `validateCreateOrder`, `validateUpdateOrder`, `validateOrderStatus`, `validateOrderServiceUpdate` | ✓ |
| `GET /api/employees` changed from isAdmin to isManagerOrAdmin (managers need it for order assignment) | ✓ |
| `__tests__/orders.test.js`: 26 tests (validation, role gating, ownership, status 0-2) | ✓ |

### Part B – Frontend

| Task | Status |
|------|--------|
| `src/constants/orderStatus.js` mirror | ✓ |
| `src/services/order.service.js`: 6 API functions | ✓ |
| `Orders.js` → admin orders list (search, status filter, pagination, status badges) | ✓ |
| `AddOrder.js` → step-by-step form (search customer → select vehicle → tick services → employee → price/notes) | ✓ |
| `OrderDetail.js` → full detail, service checkboxes, status dropdown, copy customer link | ✓ |
| `EditOrder.js` → edit form (employee, price, date, notes, services, active toggle) | ✓ |
| Dashboard Orders card works (comingSoon removed) | ✓ |
| AdminMenu: Add Order link added | ✓ |
| App.js: all new routes wired | ✓ |
| 401 handling on all order pages | ✓ |

### Part C – Docs + verification

| Task | Status |
|------|--------|
| README updated with order endpoints + curl examples | ✓ |
| PROGRESS.md updated (this section) | ✓ |
| DECISIONS.md updated (status codes, no hard delete, transaction, role-1 ownership) | ✓ |
| `npm test` result: **7 suites, 81 tests, 81 passed** (exit 0) | ✓ |
| `CI=true npm run build` result: **Compiled successfully.** (exit 0, zero warnings) | ✓ |

---

## Step 6 — Public order status page (DONE ✓)

### Part A – Backend

| Task | Status |
|------|--------|
| `services/publicOrder.service.js`: `getPublicOrderByHash` returns masked/filtered data only; `maskEmail`, `maskPhone` helpers | ✓ |
| Cancelled orders: `status_label = 'Cancelled'`, empty `services []` | ✓ |
| Forbidden fields never returned: ids, internal notes, price, employee name, full email/phone, VIN | ✓ |
| `controllers/publicOrder.controller.js`: UUID v4 regex check → 400; unknown hash → 404; `Cache-Control: no-store` | ✓ |
| `routes/publicOrder.routes.js`: `GET /api/public/order/:hash`, own rate limiter (60 req / 15 min / IP) | ✓ |
| Wired into `routes/index.js` | ✓ |
| `__tests__/publicOrder.test.js`: 10 tests (invalid hash 400, UUID v3 400, 404, success shape, Cache-Control header, forbidden keys list assertion, masked email/phone, cancelled order, maskEmail/maskPhone unit tests) | ✓ |

### Part B – Frontend

| Task | Status |
|------|--------|
| `src/services/publicOrder.service.js`: `getPublicOrder(hash)` — no token | ✓ |
| `src/markup/pages/PublicOrderPage.js`: matches order-detail.png design | ✓ |
| Page title = customer name, red dash accent, status badge (gray/yellow/green/red) | ✓ |
| Intro sentence from design | ✓ |
| Two cards with red bottom border: Customer (email masked, phone masked, active) + Car in service (make model color, tag, year, mileage) | ✓ |
| Services card: each service row with name, description, own status badge | ✓ |
| Additional request row when present | ✓ |
| Estimated/completion dates + notes_for_customer | ✓ |
| Loading, invalid/not-found, and Cancelled states | ✓ |
| Call us button (phone from `garage.js`) | ✓ |
| noindex meta injected via `useEffect` (no extra dependency) | ✓ |
| Responsive at 375px: cards stack vertically | ✓ |
| `src/assets/styles/custom.css`: all public order page styles | ✓ |
| `App.js`: `/order/:hash` route added (outside PrivateAuthRoute) | ✓ |

### Part C – Docs + verification

| Task | Status |
|------|--------|
| README updated: new endpoint + curl example | ✓ |
| `docs/PROGRESS.md` updated (this section) | ✓ |
| `docs/DECISIONS.md`: masked fields, rate limit, UUID check, same 404 message, noindex, no-store | ✓ |
| `npm test` result: **8 suites, 98 tests, 98 passed** (exit 0) | ✓ |
| `CI=true npm run build` result: **Compiled successfully.** (exit 0, zero warnings) | ✓ |

---

## Step 7 — Deployment: Render + Vercel (NOT STARTED)

---

## Step 4b — verifyToken DB check + mocked tests + employee pagination (DONE ✓)

### 1. Backend – verifyToken security

| Task | Status |
|------|--------|
| `verifyToken` loads the employee from the DB on every request (one indexed PK query + role join) | ✓ |
| Returns 401 if employee not found | ✓ |
| Returns 401 if `active_employee = 0` (immediate effect on deactivated accounts) | ✓ |
| `req.employee_role` and `req.employee_id` set from **DB values**, not token claims | ✓ |
| `isAdmin` simplified to synchronous role check on `req.employee_role` (no extra DB call) | ✓ |
| `isManagerOrAdmin` unchanged (was already synchronous) | ✓ |
| `getEmployeeForAuth(employee_id)` added to `employee.service.js` — single indexed query | ✓ |

### 2. Backend – tests (mocked, no real DB required)

| Task | Status |
|------|--------|
| `jest.mock('../services/employee.service')` added to all test files that use `verifyToken` | ✓ |
| `beforeEach` sets default `getEmployeeForAuth` mock (active, role 2 or 3) in each file | ✓ |
| `employee_edit.test.js` rewritten: inactive employee → 401, demoted employee → 403, deleted employee → 401, self-deactivation → 400, self-demotion → 400, pagination params passed to service | ✓ |
| All existing tests pass with mocked service (no real DB needed in CI) | ✓ |
| `npm test` result: **6 suites, 55 tests, 55 passed** (exit 0) | ✓ |

### 3. Backend – GET /api/employees pagination

| Task | Status |
|------|--------|
| `getAllEmployees` accepts `{limit, offset}`, default 20, max 100; returns `{data, total}` | ✓ |
| `GET /api/employees?limit=&offset=` passes query params to service | ✓ |

### 4. Frontend – EmployeesList pagination

| Task | Status |
|------|--------|
| `EmployeesList` has Previous / Next pagination using `limit=10&offset=` | ✓ |
| Pagination controls only shown when there is more than one page | ✓ |
| `employee.service.js` `getAllEmployees` accepts `{limit, offset}` and appends to URL | ✓ |

### 5. Frontend – Dashboard + Orders

| Task | Status |
|------|--------|
| Orders card on dashboard shows "coming soon" label and is non-clickable (grey) | ✓ |
| `Orders.js` page shows a "coming soon" message with AdminMenu layout | ✓ |

### 6. Docs

| Task | Status |
|------|--------|
| `docs/DECISIONS.md`: why verifyToken checks the DB, why jest.mock, why Orders is coming soon | ✓ |
| `docs/PROGRESS.md` updated (this section) | ✓ |
| `CI=true npm run build` result: **Compiled successfully.** (exit 0, zero warnings) | ✓ |

---

## Step 7 — Full UI redesign to match design images (DONE ✓)

### Part A — Global Header and Footer

| Task | Status |
|------|--------|
| Header top bar: red tagline block (`garageInfo.tagline`), hours, "Welcome {name}" when logged in, "Call Abe: phone" when not | ✓ |
| Desktop nav: HOME, ABOUT US, SERVICES, CONTACT US, ADMIN (logged in only) → "Dashboard" button removed and replaced by ADMIN link in nav | ✓ |
| Separate LOG OUT / SIGN IN button with divider (matches design) | ✓ |
| Sticky header mirrors the same nav + button | ✓ |
| Mobile menu: same public links + Admin section with Dashboard/Orders/Customers/Services/Employees | ✓ |
| Footer: 3 contact boxes (address, email, phone with flaticon icons) | ✓ |
| Footer 4 columns: about blurb, Useful Links, Our Services (live from API, fallback to `additionalServices`), Newsletter + social icons (hidden when URL empty) | ✓ |
| `garage.js`: added `tagline`, `phoneTel`, `heroTitle`, `aboutIntro`, `whyUsText`, `additionalServices`, `ctaTitle`, `ctaSubtitle`, `social`, `footerBlurb` | ✓ |

### Part B — Admin pages

| Task | Status |
|------|--------|
| Orders list: columns = Order Id, Customer (name + email + phone on 3 lines), Vehicle (make model + year/tag), Order Date, Received by, Status badge, View/Edit icons; Total column removed | ✓ |
| Backend `getAllOrders` SELECT: added `customer_email`, `customer_phone_number`, `vehicle_year` | ✓ |
| CustomerDetail: Info / Cars / Orders tab strip; "Orders of {first_name}" order list (id, date, status dot, View link) | ✓ |
| Backend `getCustomerById`: now returns `orders` array (order_id, order_date, active_order, order_status) | ✓ |
| "Add new vehicle" button at top of Cars section | ✓ |

### Part C — Root pages

| Task | Status |
|------|--------|
| Home: hero with template slider image, about intro, Our Services (API cards with icons), red quality CTA banner, Why Choose Us (icon circles), Additional Services checklist, dark tire banner, red schedule CTA bar | ✓ |
| About: page title banner, intro + image, "professional mechanics" block, Why Choose Us, Additional Services, dark tire banner, schedule CTA | ✓ |
| Services: page title banner, service cards with icons, Why Choose Us, Additional Services, dark tire banner, schedule CTA | ✓ |
| Contact: page title banner, map placeholder (links to Google Maps), address/email/phone with icons, schedule CTA | ✓ |
| Login: centred form, red "LOGIN" button, no sidebar | ✓ |
| All invented claims removed; real-world text in `garage.js` with "TODO: confirm with client" comments | ✓ |
| PublicOrderPage: added "Couldn't load, please try again" state for network/500 errors (distinct from 400/404 "This link is not valid") | ✓ |
| Backend: `Cache-Control: no-store` added to 400 and 404 responses of public order endpoint | ✓ |

### Docs + verification

| Task | Status |
|------|--------|
| `docs/PROGRESS.md` updated (this section) | ✓ |
| `docs/DECISIONS.md` updated | ✓ |
| `README.md` updated | ✓ |
| `npm test` result: **8 suites, 98 tests, 98 passed** (exit 0) | ✓ |
| `CI=true npm run build` result: **Compiled successfully.** (exit 0, zero warnings) | ✓ |

### Design image match status

| PNG | Match level |
|-----|------------|
| `Root Level pages/home.png` | Partial — hero, service cards, Why Choose Us, additional services, CTA bars all present; image content differs from mock (template assets used instead of real photos) |
| `Root Level pages/about.png` | Partial — all sections present (intro, experience block, Why Choose Us, additional services, tire banner, CTA); image placeholders |
| `Root Level pages/services.png` | Partial — service cards with icons, Why Choose Us, additional services, CTA all present; card icon images are flaticon classes not the exact PNGs |
| `Root Level pages/contact.png` | Partial — page title banner, address/email/phone with icons, map placeholder, CTA bar; real Google Maps embed requires an API key |
| `Root Level pages/login.png` | Matches — centred form, Email + Password fields, red LOGIN button |
| `Root Level pages/order-detail.png` | Matches — customer name heading with red dash, status badge, intro text, two-card grid, services with badges, Call us button (Step 6) |
| Admin pages | Not compared against PNGs in this step — functional but styling not yet matched to Admin PNGs |
