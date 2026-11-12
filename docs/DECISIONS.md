# Architectural Decisions

## Why Supabase?

Supabase provides a managed Postgres instance with a generous free tier, built-in connection pooling (PgBouncer), automatic backups, and a Postgres-compatible wire protocol. This avoids maintaining a self-hosted database while keeping full SQL access and avoiding lock-in to a proprietary query API.

## Why pg instead of an ORM?

The existing codebase uses raw SQL. Switching to an ORM (Sequelize, Prisma) in the same step as a database migration would introduce two risk factors simultaneously. `pg` is the low-level Postgres driver for Node.js and maps 1-to-1 with the existing service layer. An ORM migration can be done in a later step once the app is stable on Postgres.

## Why transactions in createEmployee?

The original code inserted rows into four tables sequentially with no transaction. If the third or fourth insert failed, the database would be left with orphaned rows in `employee` and `employee_info` that could block re-creation of the same email. Wrapping all four inserts in `BEGIN/COMMIT/ROLLBACK` guarantees atomicity.

## Why jose instead of jsonwebtoken?

`jsonwebtoken@9.0.x` depends on `jwa` which uses `SlowBuffer`, a Node.js built-in removed in Node.js 22+. `jose` (JavaScript Object Signing and Encryption) is the modern JOSE standard library that uses the native WebCrypto API and works on Node 20+. It produces spec-compliant JWTs that the existing frontend token decoder handles without changes.

## Why keep the same column names?

Renaming columns would require updating every query in every service file, the frontend JWT decoder, and localStorage parsing logic — all in a single step, dramatically increasing the chance of introducing bugs. Keeping column names identical means the migration is a pure infrastructure change. Column renames can be done incrementally in future steps.

## Why GENERATED ALWAYS AS IDENTITY instead of SERIAL?

`GENERATED ALWAYS AS IDENTITY` is the SQL-standard replacement for `SERIAL`. It prevents accidental overrides of the generated value and is the Postgres-recommended approach as of Postgres 10+. Supabase runs Postgres 15, so there is no compatibility concern.

## Why no hardcoded admin password?

A hardcoded password hash in the SQL schema means the same hash ships to every environment and is visible in git history forever. The `seed:admin` script reads credentials from the environment at run time, so each environment gets its own password and nothing sensitive ever touches the repository.

## Why remove the GET /install route?

An unauthenticated HTTP endpoint that runs `CREATE TABLE` statements is a significant security risk in any environment where the backend URL is reachable. A one-time CLI script provides the same functionality with zero surface area exposed over the network.

## Why strict rate-limiting on POST /api/employee/login?

The login endpoint is the primary credential brute-force target. 10 attempts per 15-minute window per IP (`skipSuccessfulRequests: true`) is strict enough to stop automated attacks while accommodating legitimate use. `skipSuccessfulRequests: true` means successful logins don't count toward the limit, so an admin who logs in multiple times per day is never locked out.

## Why app.set('trust proxy', 1)?

Without this, Express uses the server's internal IP as the client IP for rate-limiting. Behind Render's load balancer or Vercel's edge network, every request appears to come from the same proxy IP, making rate-limiting per-IP completely ineffective. `trust proxy 1` tells Express to read the real client IP from the `X-Forwarded-For` header set by the first trusted proxy.

## Why Row Level Security (RLS)?

Supabase's dashboard and direct Postgres connections can read and modify data if RLS is not enabled. Enabling RLS with no policies means: the backend (connecting as the DB owner / superuser) is exempt from RLS and all queries work normally, while any connection using a Supabase `anon` or `service_role` JWT cannot read or write rows unless explicit policies are added. This is defense-in-depth: even if the Supabase anon key is accidentally exposed, it cannot access application data.

## Why no DELETE on services?

Orders reference services via `order_services.service_id`. Deleting a service would either cascade-delete historical order records (data loss) or fail with a foreign key violation. Deactivating with `active_service = 0` preserves history, hides the service from the public list, and prevents new orders from referencing it. The same pattern will be applied to customers and employees.

## Why hand-written validation middleware instead of express-validator?

The validation requirements are simple (required fields, email regex, enum check, min length). Introducing a third-party library for straightforward string checks adds a dependency and learning curve without meaningful benefit at this scale. The `middlewares/validate.js` module is easy to read, easy to extend, and returns consistent `{ status, errors }` responses that the frontend already knows how to display.

## Why split app.js into app.js + server.js?

Jest/supertest needs to `require('./app')` to get the Express instance without binding a port. If `app.listen()` is called at module level, every test file that imports `app` causes an `EADDRINUSE` error when two tests happen to be in-process simultaneously. Separating the Express app config from the HTTP server startup is a standard Node.js pattern for testability.

## Why helmet?

`helmet` sets a sensible baseline of HTTP security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.) with one line.

## Why vercel.json SPA rewrite?

React Router handles navigation client-side. Without the rewrite, a user who deep-links directly to `/admin/employees` gets a 404 from Vercel's CDN. The rewrite sends all paths to `index.html` and React Router takes over.

## Why <Link> instead of <a href> for internal navigation?

`<a href>` causes a full page reload, losing React state and re-fetching all assets. `<Link>` from React Router performs a client-side navigation that preserves state.

## Why check JWT exp client-side in util/auth.js?

The server validates the JWT signature on every protected request. But if a token expires between page loads, the user will see a confusing "Unauthorized" error on the next API call rather than being smoothly redirected to login. Checking `exp` in `getAuth()` catches this case at app startup and silently clears the stale session.
