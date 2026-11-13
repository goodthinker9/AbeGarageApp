'use strict';

/** Order status codes — single source of truth for the backend. */
const ORDER_STATUS = {
  RECEIVED:    0,
  IN_PROGRESS: 1,
  COMPLETED:   2,
};

const ORDER_STATUS_NAMES = {
  0: 'Received',
  1: 'In Progress',
  2: 'Completed',
};

module.exports = { ORDER_STATUS, ORDER_STATUS_NAMES };
