// Vehicle controller
'use strict';

const vehicleService = require('../services/vehicle.service');

/** GET /api/vehicles/:customer_id */
async function getVehiclesByCustomer(req, res, next) {
  try {
    const vehicles = await vehicleService.getVehiclesByCustomer(req.params.customer_id);
    return res.status(200).json({ status: 'success', data: vehicles });
  } catch (err) {
    next(err);
  }
}

/** GET /api/vehicle/:id */
async function getVehicleById(req, res, next) {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ status: 'fail', message: 'Vehicle not found.' });
    return res.status(200).json({ status: 'success', data: vehicle });
  } catch (err) {
    next(err);
  }
}

/** POST /api/vehicle */
async function createVehicle(req, res, next) {
  try {
    const created = await vehicleService.createVehicle(req.body);
    return res.status(201).json({ status: 'success', data: created });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: err.message });
    }
    next(err);
  }
}

/** PUT /api/vehicle */
async function updateVehicle(req, res, next) {
  try {
    const updated = await vehicleService.updateVehicle(req.body);
    if (!updated) return res.status(404).json({ status: 'fail', message: 'Vehicle not found.' });
    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { getVehiclesByCustomer, getVehicleById, createVehicle, updateVehicle };
