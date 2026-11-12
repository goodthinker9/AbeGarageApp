// Load environment variables first
require('dotenv').config();

// ── Fail fast if critical env vars are missing ──────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL', 'FRONTEND_URL'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};

// ── Rate limiter for the login endpoint ──────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many login attempts. Try again later.' },
});

const port = process.env.PORT || 8000;
const router = require('./routes');

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Apply login rate limit before the router so it wraps the specific path
app.use('/api/employee/login', loginLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(router);

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ status: 'error', message: 'An internal server error occurred.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

module.exports = app;
