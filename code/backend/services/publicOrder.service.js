// Public order service – no auth, returns masked/filtered data only
'use strict';

const { query } = require('../config/db.config');

/** Mask email: j***@gmail.com */
function maskEmail(email) {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

/** Mask phone: keep last 4 digits, replace rest with * groups: ***-***-5487 */
function maskPhone(phone) {
  if (!phone) return '***';
  const digits = phone.replace(/\D/g, '');
  const last4  = digits.slice(-4);
  return `***-***-${last4}`;
}

/**
 * Fetch a public-safe order view by order_hash.
 * Returns null if not found.
 * Never returns: internal notes, price, employee name, any id column, full email/phone, VIN.
 */
async function getPublicOrderByHash(hash) {
  const rows = await query(
    `SELECT
       o.active_order,
       o.order_date,
       c.customer_email,
       c.customer_phone_number,
       ci.customer_first_name,
       ci.customer_last_name,
       ci.active_customer_status,
       cvi.vehicle_make,
       cvi.vehicle_model,
       cvi.vehicle_color,
       cvi.vehicle_year,
       cvi.vehicle_tag,
       cvi.vehicle_mileage,
       oi.estimated_completion_date,
       oi.completion_date,
       oi.additional_request,
       oi.notes_for_customer,
       COALESCE(os.order_status, 0) AS order_status
     FROM orders o
     JOIN customer_identifier c   ON o.customer_id  = c.customer_id
     JOIN customer_info       ci  ON c.customer_id  = ci.customer_id
     JOIN customer_vehicle_info cvi ON o.vehicle_id = cvi.vehicle_id
     LEFT JOIN order_info     oi  ON o.order_id     = oi.order_id
     LEFT JOIN order_status   os  ON o.order_id     = os.order_id
     WHERE o.order_hash = $1`,
    [hash],
  );

  if (!rows.length) return null;

  const r = rows[0];

  const STATUS_LABELS = { 0: 'Received', 1: 'In Progress', 2: 'Completed' };
  const orderStatus   = Number(r.order_status);
  const isCancelled   = !r.active_order;

  // Services – omit rows for cancelled orders
  let services = [];
  if (!isCancelled) {
    const svcRows = await query(
      `SELECT svc_os.service_completed,
              cs.service_name,
              cs.service_description
         FROM order_services svc_os
         JOIN common_services cs ON svc_os.service_id = cs.service_id
         JOIN orders o ON svc_os.order_id = o.order_id
        WHERE o.order_hash = $1
        ORDER BY svc_os.order_service_id`,
      [hash],
    );

    services = svcRows.map((s) => {
      const status      = s.service_completed ? 2 : orderStatus;
      const status_label = s.service_completed ? 'Completed' : (STATUS_LABELS[orderStatus] || 'Received');
      return {
        name:         s.service_name,
        description:  s.service_description || null,
        status,
        status_label,
      };
    });
  }

  return {
    order_date:                r.order_date,
    status:                    isCancelled ? null : orderStatus,
    status_label:              isCancelled ? 'Cancelled' : (STATUS_LABELS[orderStatus] || 'Received'),
    estimated_completion_date: r.estimated_completion_date || null,
    completion_date:           r.completion_date || null,
    active_order:              r.active_order ? 1 : 0,
    customer: {
      first_name:    r.customer_first_name,
      last_name:     r.customer_last_name,
      email_masked:  maskEmail(r.customer_email),
      phone_masked:  maskPhone(r.customer_phone_number),
      active:        r.active_customer_status ? 'Yes' : 'No',
    },
    vehicle: {
      make:    r.vehicle_make,
      model:   r.vehicle_model,
      color:   r.vehicle_color,
      year:    r.vehicle_year,
      tag:     r.vehicle_tag,
      mileage: r.vehicle_mileage,
    },
    services,
    additional_request:  r.additional_request  || null,
    notes_for_customer:  r.notes_for_customer   || null,
  };
}

module.exports = { getPublicOrderByHash, maskEmail, maskPhone };
