// Service controller
'use strict';

const serviceService = require('../services/service.service');

/** GET /api/services — public, active only */
async function getActiveServices(req, res, next) {
  try {
    const services = await serviceService.getAllActiveServices();
    return res.status(200).json({ status: 'success', data: services });
  } catch (err) {
    next(err);
  }
}

/** GET /api/services/all — staff (roles 2,3), all including inactive */
async function getAllServices(req, res, next) {
  try {
    const services = await serviceService.getAllServices();
    return res.status(200).json({ status: 'success', data: services });
  } catch (err) {
    next(err);
  }
}

/** GET /api/service/:id — staff (roles 2,3) */
async function getServiceById(req, res, next) {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ status: 'fail', message: 'Service not found.' });
    }
    return res.status(200).json({ status: 'success', data: service });
  } catch (err) {
    next(err);
  }
}

/** POST /api/service — staff (roles 2,3), validated */
async function createService(req, res, next) {
  try {
    const created = await serviceService.createService(req.body);
    return res.status(201).json({ status: 'success', data: created });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/service — staff (roles 2,3), validated */
async function updateService(req, res, next) {
  try {
    const updated = await serviceService.updateService(req.body);
    if (!updated) {
      return res.status(404).json({ status: 'fail', message: 'Service not found.' });
    }
    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getActiveServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
};
