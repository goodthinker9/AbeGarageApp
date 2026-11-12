const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller');
const { validateLogin } = require('../middlewares/validate');

// Validate first, then authenticate
router.post('/api/employee/login', validateLogin, loginController.logIn);

module.exports = router;
