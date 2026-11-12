// Main router
const express = require('express');
const router = express.Router();

const employeeRouter = require('./employee.routes');
const loginRoutes    = require('./login.routes');
const serviceRoutes  = require('./service.routes');

router.use(employeeRouter);
router.use(loginRoutes);
router.use(serviceRoutes);

module.exports = router;
