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
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many login attempts. Try again later.' },
});

const router = require('./routes');
const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/employee/login', loginLimiter);
app.use(router);

// ── JSON 404 for unknown /api routes ─────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'fail', message: `${req.method} ${req.path} not found.` });
});

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ status: 'error', message: 'An internal server error occurred.' });
});

module.exports = app;
