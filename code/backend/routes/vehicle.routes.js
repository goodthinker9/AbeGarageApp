const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { verifyToken, isManagerOrAdmin } = require('../middlewares/auth.middleware');
const {
  validateIdParam,
  validateCreateVehicle,
  validateUpdateVehicle,
} = require('../middlewares/validate');

// All vehicle routes require Manager or Admin
router.get( '/api/vehicles/:customer_id', [verifyToken, isManagerOrAdmin, validateIdParam('customer_id')], vehicleController.getVehiclesByCustomer);
router.get( '/api/vehicle/:id',           [verifyToken, isManagerOrAdmin, validateIdParam()], vehicleController.getVehicleById);
router.post('/api/vehicle',               [verifyToken, isManagerOrAdmin, validateCreateVehicle], vehicleController.createVehicle);
router.put( '/api/vehicle',               [verifyToken, isManagerOrAdmin, validateUpdateVehicle], vehicleController.updateVehicle);

module.exports = router;
