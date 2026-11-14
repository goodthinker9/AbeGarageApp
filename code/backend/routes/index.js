// Main router
const express = require('express');
const router = express.Router();

const employeeRouter      = require('./employee.routes');
const loginRoutes         = require('./login.routes');
const serviceRoutes       = require('./service.routes');
const customerRoutes      = require('./customer.routes');
const vehicleRoutes       = require('./vehicle.routes');
const orderRoutes         = require('./order.routes');
const publicOrderRoutes   = require('./publicOrder.routes');

router.use(employeeRouter);
router.use(loginRoutes);
router.use(serviceRoutes);
router.use(customerRoutes);
router.use(vehicleRoutes);
router.use(orderRoutes);
router.use(publicOrderRoutes);

module.exports = router;
