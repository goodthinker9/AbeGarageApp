// Public order controller – no auth
'use strict';

const publicOrderService = require('../services/publicOrder.service');

// UUID v4 pattern
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Apply no-store to every response from this controller
function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
}

/**
 * GET /api/public/order/:hash
 * No auth. Returns masked order data for the customer-facing status page.
 */
async function getPublicOrder(req, res, next) {
  try {
    const { hash } = req.params;

    if (!UUID_RE.test(hash)) {
      noStore(res);
      return res.status(400).json({ status: 'fail', message: 'Invalid order link.' });
    }

    const order = await publicOrderService.getPublicOrderByHash(hash);
    if (!order) {
      noStore(res);
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    noStore(res);
    return res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPublicOrder };
