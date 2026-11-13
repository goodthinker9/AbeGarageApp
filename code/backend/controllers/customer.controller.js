// Customer controller
'use strict';

const customerService = require('../services/customer.service');

/** GET /api/customers?search=&limit=&offset= */
async function getAllCustomers(req, res, next) {
  try {
    const result = await customerService.getAllCustomers(req.query);
    return res.status(200).json({ status: 'success', data: result.data, total: result.total });
  } catch (err) {
    next(err);
  }
}

/** GET /api/customer/:id */
async function getCustomerById(req, res, next) {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ status: 'fail', message: 'Customer not found.' });
    return res.status(200).json({ status: 'success', data: customer });
  } catch (err) {
    next(err);
  }
}

/** POST /api/customer */
async function createCustomer(req, res, next) {
  try {
    const created = await customerService.createCustomer(req.body);
    return res.status(201).json({ status: 'success', data: created });
  } catch (err) {
    if (err.code === 'DUPLICATE') {
      return res.status(409).json({ status: 'fail', message: err.message, field: err.field });
    }
    next(err);
  }
}

/** PUT /api/customer */
async function updateCustomer(req, res, next) {
  try {
    const updated = await customerService.updateCustomer(req.body);
    if (!updated) return res.status(404).json({ status: 'fail', message: 'Customer not found.' });
    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    if (err.code === 'DUPLICATE') {
      return res.status(409).json({ status: 'fail', message: err.message, field: err.field });
    }
    next(err);
  }
}

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer };
