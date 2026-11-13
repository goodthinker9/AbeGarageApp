# Progress

## Step 1 — Security cleanup + Supabase/Postgres migration (DONE ✓)
See git commit `bfd22eb`.

## Step 2 — Review fixes + Services module (DONE ✓)
See git commit `439f740`.

---

## Step 3 — Small fixes + Customers + Vehicles (DONE ✓)

### Part A — Small fixes

| # | Task | Status |
|---|------|--------|
| A1 | Added `validateIdParam` middleware; used on every `:id` route (service, customer, vehicle) | ✓ |
| A1 | `validate.js`: reject non-string service_name/description; enforce 255-char max on all text fields | ✓ |
| A1 | `validate.js`: `service_id` in PUT /api/service validated as positive integer | ✓ |
| A2 | `garage.js`: replaced invented text with `highlights` array + "TODO: confirm with client" comments | ✓ |
| A2 | `Home.js`: bullet-points now read from `garageInfo.highlights`; no more ASE/warranty/coffee claims | ✓ |
| A2 | `Header.js`: phone and hours read from `garageInfo`; removed hardcoded "Enjoy the Beso…" string | ✓ |
| A3 | Added JSON 404 handler for unknown `/api` routes in `app.js` | ✓ |

### Part B — Customers (backend)

| # | Task | Status |
|---|------|--------|
| B1 | `services/customer.service.js`: `getAllCustomers` (ILIKE search, pagination, total count), `getCustomerById` (with vehicles), `createCustomer` (transaction + `randomUUID` hash), `updateCustomer` (dynamic SET, transaction) | ✓ |
| B2 | 409 handling for duplicate email or phone on create and update | ✓ |
| B3 | `controllers/customer.controller.js`: 4 handlers with proper 404/409/next(err) | ✓ |
| B4 | `routes/customer.routes.js`: GET /api/customers, GET /api/customer/:id, POST /api/customer, PUT /api/customer — all roles 2,3 | ✓ |
| B5 | `validate.js`: `validateCreateCustomer`, `validateUpdateCustomer` added | ✓ |
| B6 | Wired into main router (`routes/index.js`) | ✓ |

### Part C — Vehicles (backend)

| # | Task | Status |
|---|------|--------|
| C1 | `services/vehicle.service.js`: `getVehiclesByCustomer`, `getVehicleById`, `createVehicle` (FK→404), `updateVehicle` (dynamic SET) | ✓ |
| C2 | `controllers/vehicle.controller.js`: 4 handlers | ✓ |
| C3 | `routes/vehicle.routes.js`: GET /api/vehicles/:customer_id, GET /api/vehicle/:id, POST /api/vehicle, PUT /api/vehicle — all roles 2,3 | ✓ |
| C4 | `validate.js`: `validateCreateVehicle` (year 1950..current+1, mileage ≥0, required text fields, max 255), `validateUpdateVehicle` | ✓ |
| C5 | Wired into main router | ✓ |

### Part D — Frontend

| # | Task | Status |
|---|------|--------|
| D1 | `src/services/customer.service.js`: 4 API call functions | ✓ |
| D2 | `src/services/vehicle.service.js`: 4 API call functions | ✓ |
| D3 | `src/hooks/useApiRequest.js`: shared 401→logout+redirect wrapper | ✓ |
| D4 | `/admin/customers` (`AdminCustomers.js`): search box, Previous/Next pagination, Active/Name/Email/Phone/View/Edit, Add Customer button | ✓ |
| D5 | `/admin/add-customer` (`AddCustomer.js`): form with client + server validation, 409 duplicate message | ✓ |
| D6 | `/admin/customer/edit/:id` (`EditCustomer.js`): pre-populated form, active toggle, 409 handling | ✓ |
| D7 | `/admin/customer/:id` (`CustomerDetail.js`): customer info + vehicles table + inline Add Vehicle form + Edit Vehicle links | ✓ |
| D8 | `/admin/vehicle/edit/:id` (`EditVehicle.js`): edit form, navigates back to customer detail | ✓ |
| D9 | `AdminMenu.js`: Customers + Add Customer links in correct order | ✓ |
| D10 | `App.js`: all new routes wired with `PrivateAuthRoute roles={[2,3]}` | ✓ |
| D11 | 401 on any admin fetch → `localStorage.removeItem` + `navigate('/login')` | ✓ |
| D12 | `garage.js` `highlights` array; `Home.js` and `Header.js` read from config | ✓ |

### Part E — Tests and docs

| # | Task | Status |
|---|------|--------|
| E1 | `__tests__/customers.test.js`: auth gates, validateIdParam (abc/0 → 400), validateCreateCustomer (missing fields, bad email), validateUpdateCustomer (missing customer_id), unknown /api route → 404 JSON | ✓ |
| E2 | `__tests__/vehicles.test.js`: auth gates, validateCreateVehicle (missing fields, year out of range, negative mileage, text >255), validateUpdateVehicle (missing vehicle_id) | ✓ |
| E3 | `npm test` result: **4 suites, 29 tests, 29 passed** (exit 0) | ✓ |
| E4 | `CI=true npm run build` result: **Compiled successfully.** (exit 0, zero warnings) | ✓ |
| E5 | README, PROGRESS.md, DECISIONS.md updated | ✓ |

---

## Step 4 — Orders + Status workflow + Public order page (NOT STARTED)

Empty stubs present: `order.routes.js`, `order.controller.js`, `order.service.js`.

Planned:
- POST /api/order, GET /api/orders, GET /api/order/:id — roles 1,2,3
- PUT /api/order/status, GET /api/order/public/:hash — public
- Frontend: order list, new order form, order detail with service checkboxes, status tracker

## Step 5 — Deployment: Render + Vercel (NOT STARTED)
