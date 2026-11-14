const express   = require('express');
const rateLimit = require('express-rate-limit');
const router    = express.Router();
const publicOrderController = require('../controllers/publicOrder.controller');

const publicOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many requests. Please try again later.' },
});

// No auth – public customer-facing endpoint
router.get(
  '/api/public/order/:hash',
  publicOrderLimiter,
  publicOrderController.getPublicOrder,
);

module.exports = router;
