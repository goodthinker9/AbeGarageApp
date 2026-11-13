const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isManagerOrAdmin } = require('../middlewares/auth.middleware');
const {
  validateIdParam,
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderStatus,
  validateOrderServiceUpdate,
} = require('../middlewares/validate');

// Create order – roles 2,3
router.post(
  '/api/order',
  [verifyToken, isManagerOrAdmin, validateCreateOrder],
  orderController.createOrder,
);

// List orders – roles 1,2,3 (role 1 filtered in service)
router.get(
  '/api/orders',
  [verifyToken],
  orderController.getAllOrders,
);

// Single order – roles 1,2,3 (ownership checked in controller)
router.get(
  '/api/order/:id',
  [verifyToken, validateIdParam()],
  orderController.getOrderById,
);

// Edit order – roles 2,3
router.put(
  '/api/order',
  [verifyToken, isManagerOrAdmin, validateUpdateOrder],
  orderController.updateOrder,
);

// Update status – roles 1,2,3 (ownership for role 1 in controller)
router.put(
  '/api/order/:id/status',
  [verifyToken, validateIdParam(), validateOrderStatus],
  orderController.updateOrderStatus,
);

// Toggle service completed – roles 1,2,3 (ownership for role 1 in controller)
router.put(
  '/api/order/:id/service',
  [verifyToken, validateIdParam(), validateOrderServiceUpdate],
  orderController.updateOrderService,
);

module.exports = router;
