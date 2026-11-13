// Order controller
'use strict';

const orderService = require('../services/order.service');

/** POST /api/order — roles 2,3 */
async function createOrder(req, res, next) {
  try {
    const created = await orderService.createOrder(req.body);
    return res.status(201).json({ status: 'success', data: created });
  } catch (err) {
    if (err.code === 'VALIDATION') {
      return res.status(400).json({ status: 'fail', message: err.message, field: err.field });
    }
    next(err);
  }
}

/** GET /api/orders — roles 1,2,3 (role 1 sees only own) */
async function getAllOrders(req, res, next) {
  try {
    const result = await orderService.getAllOrders({
      ...req.query,
      employee_id:   req.employee_id,
      employee_role: req.employee_role,
    });
    return res.status(200).json({ status: 'success', data: result.data, total: result.total });
  } catch (err) {
    next(err);
  }
}

/** GET /api/order/:id — roles 1,2,3 (role 1 only if assigned to them) */
async function getOrderById(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }
    if (Number(req.employee_role) === 1 && order.employee_id !== req.employee_id) {
      return res.status(403).json({ status: 'fail', message: 'You can only view orders assigned to you.' });
    }
    return res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/order — roles 2,3 */
async function updateOrder(req, res, next) {
  try {
    const updated = await orderService.updateOrder(req.body);
    if (!updated) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }
    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    if (err.code === 'VALIDATION') {
      return res.status(400).json({ status: 'fail', message: err.message, field: err.field });
    }
    next(err);
  }
}

/** PUT /api/order/:id/status — roles 1,2,3 (role 1 only own) */
async function updateOrderStatus(req, res, next) {
  try {
    // Ownership check for role 1
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }
    if (Number(req.employee_role) === 1 && order.employee_id !== req.employee_id) {
      return res.status(403).json({ status: 'fail', message: 'You can only update orders assigned to you.' });
    }
    const updated = await orderService.updateOrderStatus(req.params.id, req.body.order_status);
    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/order/:id/service — roles 1,2,3 (role 1 only own) */
async function updateOrderService(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }
    if (Number(req.employee_role) === 1 && order.employee_id !== req.employee_id) {
      return res.status(403).json({ status: 'fail', message: 'You can only update orders assigned to you.' });
    }
    const updated = await orderService.updateOrderService(
      req.params.id, req.body.service_id, req.body.service_completed,
    );
    if (!updated) {
      return res.status(404).json({ status: 'fail', message: 'Service not found on this order.' });
    }
    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  updateOrderService,
};
