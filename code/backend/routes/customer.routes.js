const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { verifyToken, isManagerOrAdmin } = require('../middlewares/auth.middleware');
const {
  validateIdParam,
  validateCreateCustomer,
  validateUpdateCustomer,
} = require('../middlewares/validate');

// All customer routes require Manager or Admin
router.get(  '/api/customers',      [verifyToken, isManagerOrAdmin], customerController.getAllCustomers);
router.get(  '/api/customer/:id',   [verifyToken, isManagerOrAdmin, validateIdParam()], customerController.getCustomerById);
router.post( '/api/customer',       [verifyToken, isManagerOrAdmin, validateCreateCustomer], customerController.createCustomer);
router.put(  '/api/customer',       [verifyToken, isManagerOrAdmin, validateUpdateCustomer], customerController.updateCustomer);

module.exports = router;
