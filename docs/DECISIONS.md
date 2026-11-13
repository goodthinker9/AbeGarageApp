# Architectural Decisions

## Why Supabase?

Supabase provides a managed Postgres instance with a generous free tier, built-in connection pooling (PgBouncer), automatic backups, and a Postgres-compatible wire protocol. This avoids maintaining a self-hosted database while keeping full SQL access and avoiding lock-in to a proprietary query API.

## Why pg instead of an ORM?

The existing codebase uses raw SQL. Switching to an ORM in the same step as a database migration would introduce two risk factors simultaneously. `pg` maps 1-to-1 with the existing service layer. An ORM migration can be done in a later step once the app is stable on Postgres.

## Why transactions in createEmployee and createCustomer?

Both operations insert into multiple tables. Without a transaction, a failure partway through leaves orphaned rows that block re-creation of the same email or phone. `BEGIN/COMMIT/ROLLBACK` guarantees atomicity.

## Why jose instead of jsonwebtoken?

`jsonwebtoken@9.0.x` depends on `jwa` which uses `SlowBuffer`, removed in Node.js 22+. `jose` uses the native WebCrypto API, works on Node 20+, and produces spec-compliant JWTs the existing frontend decoder handles without changes.

## Why keep the same column names?

Renaming columns would require updating every query, the frontend JWT decoder, and localStorage parsing in a single step. Keeping column names identical means the migration is a pure infrastructure change.

## Why GENERATED ALWAYS AS IDENTITY instead of SERIAL?

SQL-standard replacement for `SERIAL`, prevents accidental overrides, recommended by Postgres 10+.

## Why no hardcoded admin password?

A hardcoded hash ships to every environment and lives in git history forever. `seed:admin` reads credentials from the environment at run time.

## Why remove the GET /install route?

An unauthenticated endpoint that runs `CREATE TABLE` is a security risk. A CLI script provides the same functionality with zero HTTP surface area.

## Why strict rate-limiting on POST /api/employee/login?

Protects against credential brute-force. `skipSuccessfulRequests: true` means successful logins don't consume the quota.

## Why app.set('trust proxy', 1)?

Without this, Express uses the server's internal IP for rate-limiting. Behind Render's load balancer, all requests appear to come from the same proxy IP, making per-IP rate-limiting ineffective.

## Why Row Level Security (RLS)?

RLS ensures that even if the Supabase `anon` key is exposed, it cannot read or write application data. The backend connects as the DB owner (exempt from RLS) so queries are unaffected. No policies are needed now; they can be added per-table when direct-client access is required.

## Why no DELETE on services, customers, or employees?

Orders reference all three via foreign keys. Hard-deleting a service, customer, or employee would either cascade-delete historical order records (data loss) or fail with a FK violation. Deactivation (`active_service = 0`, `active_customer_status = 0`, `active_employee = 0`) preserves history and prevents new activity without destroying existing records.

## Why hand-written validation middleware?

Simple requirements (required fields, email regex, enum check, min/max length, integer range). A third-party library adds a dependency and learning curve without meaningful benefit. `middlewares/validate.js` is easy to read, easy to extend, and returns consistent `{ status, errors }` responses the frontend already knows how to display.

## Why split app.js into app.js + server.js?

Jest/supertest needs to `require('./app')` without binding a port. Separating app config from HTTP server startup is a standard Node.js pattern for testability.

## Why validateIdParam?

A route with `:id` that passes a non-integer to the service layer will generate a Postgres error or unexpected behaviour. Catching it at the middleware boundary returns a clear 400 instead of a confusing 500.

## Why validateIdParam uses `req.params.id` and not a named param?

All current `:id` routes use the generic name `id` (`:customer_id` is a different param name in `/api/vehicles/:customer_id`). `validateIdParam` is reused on that route too — the check is against `req.params.id` which works because the param is extracted positionally. Vehicles uses `:customer_id` which is validated separately in `validateCreateVehicle`.

## Why crypto.randomUUID() for customer_hash?

`randomUUID()` is built into Node.js ≥14.17 (no external dependency), generates a standards-compliant v4 UUID, and is cryptographically random. The hash is used for public order-status links in Step 4.

## Why helmet?

Sets a sensible baseline of HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.) with one line.

## Why vercel.json SPA rewrite?

React Router handles navigation client-side. Without the rewrite, deep links to `/admin/customers` get a Vercel CDN 404.

## Why <Link> instead of <a href> for internal navigation?

`<a href>` causes a full page reload, losing React state. `<Link>` from React Router performs client-side navigation.

## Why check JWT exp client-side in util/auth.js?

The server validates the JWT signature on every protected request. But if a token expires between page loads, the user sees a confusing "Unauthorized" error. Checking `exp` in `getAuth()` catches this silently and redirects to login.

## Why a shared useApiRequest hook?

The 401→logout+redirect pattern was duplicated in every admin page. Extracting it into one hook keeps each page focused on its own data while ensuring consistent session-expiry handling everywhere. The hook is defined but pages can also handle 401 inline (as AdminCustomers does directly) — the hook is available for future use.

## Why put validation before isAdmin in employee edit routes?

`isAdmin` calls `getEmployeeByEmail` which hits the database. If the validation middleware runs after `isAdmin`, a request with a malformed body would receive a 500 (DB connection error in test/CI environments without a real DB) instead of a 400. Moving `validateUpdateEmployee` and `validateIdParam` before `isAdmin` ensures that bad client input is caught immediately, before any DB round-trip, returning a clear 400. The token verification (`verifyToken`) still runs first so unauthenticated requests still get 401/403.

## Why populate req.employee_id in verifyToken?

The JWT payload already contains `employee_id` from the sign step. Storing it on `req` in `verifyToken` (alongside `req.employee_role` and `req.employee_email`) makes it available to all downstream middleware and controllers without an extra DB lookup. The employee edit controller uses it to implement the self-protection check (an admin cannot deactivate or demote their own account).

## Why prevent an admin from deactivating or demoting their own account?

If the last admin deactivates or demotes their own account, there is no way to log in and restore access through the application — the system would need direct DB intervention to recover. This check is a simple guard against accidental lockout. It is enforced in the controller (after auth and validation) using the `req.employee_id` populated from the JWT.

## Why delete BottomBanner.js?

The file was empty and not imported anywhere. Keeping empty placeholder files in the repository creates confusion about whether they are "done", "in progress", or simply dead code.

The values in `src/config/garage.js` (address, phone, hours, highlights) are placeholders marked with "TODO: confirm with client" comments. They will be updated once the client provides the real information. Fabricated marketing claims (certifications, warranties) have been removed to avoid misrepresenting the business.
