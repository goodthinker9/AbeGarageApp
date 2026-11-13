const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { verifyToken, isManagerOrAdmin } = require('../middlewares/auth.middleware');
const {
  validateIdParam,
  validateCreateService,
  validateUpdateService,
} = require('../middlewares/validate');

// PUBLIC – active services only
router.get('/api/services', serviceController.getActiveServices);

// STAFF (roles 2,3) – all services including inactive
router.get('/api/services/all', [verifyToken, isManagerOrAdmin], serviceController.getAllServices);

// STAFF – single service by id
router.get('/api/service/:id', [verifyToken, isManagerOrAdmin, validateIdParam()], serviceController.getServiceById);

// STAFF – create service
router.post('/api/service', [verifyToken, isManagerOrAdmin, validateCreateService], serviceController.createService);

// STAFF – update service (no DELETE — deactivate with active_service=0)
router.put('/api/service', [verifyToken, isManagerOrAdmin, validateUpdateService], serviceController.updateService);

module.exports = router;
