# Architectural Decisions

## Why Supabase?

Supabase provides a managed Postgres instance with a generous free tier, built-in connection pooling (PgBouncer), automatic backups, and a Postgres-compatible wire protocol. This avoids maintaining a self-hosted database while keeping full SQL access and avoiding lock-in to a proprietary query API.

## Why pg instead of an ORM?

The existing codebase uses raw SQL. Switching to an ORM (Sequelize, Prisma) in the same step as a database migration would introduce two risk factors simultaneously. `pg` is the low-level Postgres driver for Node.js and maps 1-to-1 with the existing service layer. An ORM migration can be done in a later step once the app is stable on Postgres.

## Why transactions in createEmployee?

The original code inserted rows into four tables sequentially with no transaction. If the third or fourth insert failed, the database would be left with orphaned rows in `employee` and `employee_info` that could block re-creation of the same email. Wrapping all four inserts in `BEGIN/COMMIT/ROLLBACK` guarantees atomicity.

## Why jose instead of jsonwebtoken?

`jsonwebtoken@9.0.x` depends on `jwa` which uses `SlowBuffer`, a Node.js built-in removed in Node.js 22+. The project is running Node 26. `jose` (JavaScript Object Signing and Encryption) is the modern JOSE standard library that uses the native WebCrypto API and works on all current Node.js versions. It is maintained by the same ecosystem and produces spec-compliant JWTs that the existing frontend token decoder continues to handle without changes.

## Why keep the same column names?

Renaming columns would require updating every query in every service file, the frontend JWT decoder, and localStorage parsing logic — all in a single step, dramatically increasing the chance of introducing bugs. Keeping column names identical means the migration is a pure infrastructure change. Column renames can be done incrementally in future steps with proper frontend coordination.

## Why GENERATED ALWAYS AS IDENTITY instead of SERIAL?

`GENERATED ALWAYS AS IDENTITY` is the SQL-standard replacement for `SERIAL`. It prevents accidental overrides of the generated value and is the Postgres-recommended approach as of Postgres 10+. Supabase runs Postgres 15, so there is no compatibility concern.

## Why no hardcoded admin password?

A hardcoded password hash in the SQL schema means the same hash ships to every environment and is visible in git history forever. The `seed:admin` script reads credentials from the environment at run time, so each environment gets its own password and nothing sensitive ever touches the repository.

## Why remove the GET /install route?

An unauthenticated HTTP endpoint that runs `CREATE TABLE` statements is a significant security risk in any environment where the backend URL is reachable. A one-time CLI script provides the same functionality with zero surface area exposed over the network.

## Why strict rate-limiting on POST /api/employee/login?

The login endpoint is the primary credential brute-force target. 10 attempts per 15-minute window per IP is strict enough to stop automated attacks while accommodating legitimate use (a human with a forgotten password). The limit applies before authentication logic runs, so it cannot be bypassed by probing different emails.

## Why helmet?

`helmet` sets a sensible baseline of HTTP security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.) with one line. Without it, every header must be added manually and kept up to date.

## Why vercel.json SPA rewrite?

React Router handles navigation client-side. Without the rewrite, a user who deep-links directly to `/admin/employees` gets a 404 from Vercel's CDN because that path does not correspond to a static file. The rewrite sends all paths to `index.html` and React Router takes over from there.

## Why <Link> instead of <a href> for internal navigation?

`<a href>` causes a full page reload, losing React state and re-fetching all assets. `<Link>` from React Router performs a client-side navigation that preserves state, is faster, and is the idiomatic approach in a React SPA.
