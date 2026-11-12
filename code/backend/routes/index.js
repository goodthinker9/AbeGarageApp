// Main router – install route removed (use npm run db:setup instead)
const express = require('express');
const router = express.Router();

const employeeRouter = require('./employee.routes');
const loginRoutes = require('./login.routes');

router.use(employeeRouter);
router.use(loginRoutes);

module.exports = router;
