import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import publicOrderService from '../../services/publicOrder.service';
import garageInfo from '../../config/garage';

/** Inject a noindex meta tag and clean it up on unmount. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name    = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
}

/** Map status_label to CSS modifier class. */
function badgeClass(label) {
  switch ((label || '').toLowerCase()) {
    case 'in progress': return 'order-badge order-badge--in-progress';
    case 'completed':   return 'order-badge order-badge--completed';
    case 'cancelled':   return 'order-badge order-badge--cancelled';
    default:            return 'order-badge order-badge--received';
  }
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function PublicOrderPage() {
  const { hash } = useParams();
  useNoIndex();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicOrderService.getPublicOrder(hash)
      .then(async (res) => {
        if (res.status === 400) { setInvalid(true);  return; }
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) { setNotFound(true); return; }
        const json = await res.json();
        setOrder(json.data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [hash]);

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <section className="contact-section">
        <div className="auto-container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <p>Loading order details…</p>
        </div>
      </section>
    );
  }

  /* ── Invalid link ────────────────────────────────────────────────────────── */
  if (invalid || notFound) {
    return (
      <section className="contact-section">
        <div className="auto-container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h2 style={{ color: '#0a1436', marginBottom: '1rem' }}>This link is not valid</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            The order link you followed doesn't match any order in our system.
            Please check the link or contact us for assistance.
          </p>
          <a href={`tel:${garageInfo.phone}`} className="order-call-btn">
            Call us: {garageInfo.phone}
          </a>
        </div>
      </section>
    );
  }

  const isCancelled = !order.active_order;
  const customerName = `${order.customer.first_name} ${order.customer.last_name}`;

  return (
    <section className="contact-section order-status-page">
        <div className="auto-container">

          {/* ── Page heading with status badge ─────────────────────────────── */}
          <div className="order-heading">
            <h2>{customerName}</h2>
            <span className={badgeClass(order.status_label)}>
              {order.status_label}
            </span>
          </div>

          {/* ── Intro sentence ─────────────────────────────────────────────── */}
          {!isCancelled && (
            <p className="order-intro">
              You can track the progress of your order using this page. We will constantly
              update this page to let you know how we are progressing. As soon as we are done
              with the order, the status will turn green. That means, your car is ready for pickup.
            </p>
          )}

          {isCancelled && (
            <p className="order-intro">
              This order has been cancelled. Please call us if you have any questions.
            </p>
          )}

          {/* ── Customer + Vehicle cards ────────────────────────────────────── */}
          <div className="order-info-cards">

            {/* Customer card */}
            <div className="order-info-card">
              <div className="card-label">Customer</div>
              <h3>{customerName}</h3>
              <p className="info-line">Email: <span>{order.customer.email_masked}</span></p>
              <p className="info-line">Phone Number: <span>{order.customer.phone_masked}</span></p>
              <p className="info-line">Active Customer: <span>{order.customer.active}</span></p>
            </div>

            {/* Vehicle card */}
            <div className="order-info-card">
              <div className="card-label">Car in service</div>
              <h3>
                {order.vehicle.make} {order.vehicle.model}
                {order.vehicle.color ? ` (${order.vehicle.color})` : ''}
              </h3>
              <p className="info-line">Vehicle tag: <span>{order.vehicle.tag}</span></p>
              <p className="info-line">Vehicle year: <span>{order.vehicle.year}</span></p>
              <p className="info-line">
                Vehicle mileage: <span>{Number(order.vehicle.mileage).toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* ── Services card ───────────────────────────────────────────────── */}
          <div className="order-services-card">
            <div className="card-label">{order.vehicle.make} {order.vehicle.model}</div>
            <h3>Requested service</h3>

            {!isCancelled && order.services && order.services.length > 0 ? (
              <>
                {order.services.map((s, i) => (
                  <div className="service-row" key={i}>
                    <div className="service-text">
                      <h5>{s.name}</h5>
                      {s.description && <p>{s.description}</p>}
                    </div>
                    <span className={badgeClass(s.status_label)} style={{ flexShrink: 0 }}>
                      {s.status_label}
                    </span>
                  </div>
                ))}

                {/* Additional request row */}
                {order.additional_request && (
                  <div className="service-row">
                    <div className="service-text">
                      <h5>Additional request</h5>
                      <p>{order.additional_request}</p>
                    </div>
                    <span className={badgeClass(order.status_label)} style={{ flexShrink: 0 }}>
                      {order.status_label}
                    </span>
                  </div>
                )}
              </>
            ) : isCancelled ? (
              <p style={{ color: '#666' }}>No service details available for a cancelled order.</p>
            ) : (
              <p style={{ color: '#666' }}>No services on record for this order.</p>
            )}

            {/* Dates + customer notes */}
            {(order.estimated_completion_date || order.completion_date || order.notes_for_customer) && (
              <div style={{ padding: '1rem 0 0.5rem', borderTop: '1px solid #f0f0f0', marginTop: '0.5rem' }}>
                {order.estimated_completion_date && (
                  <p className="info-line" style={{ fontSize: '0.9rem', color: '#444' }}>
                    <strong>Estimated completion:</strong> {formatDate(order.estimated_completion_date)}
                  </p>
                )}
                {order.completion_date && (
                  <p className="info-line" style={{ fontSize: '0.9rem', color: '#444' }}>
                    <strong>Completed:</strong> {formatDate(order.completion_date)}
                  </p>
                )}
                {order.notes_for_customer && (
                  <p className="info-line" style={{ fontSize: '0.9rem', color: '#444', marginTop: '0.5rem' }}>
                    <strong>Message from us:</strong> {order.notes_for_customer}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Divider + Call us ────────────────────────────────────────────── */}
          <hr className="order-section-divider" />
          <div style={{ textAlign: 'center' }}>
            <a href={`tel:${garageInfo.phone}`} className="order-call-btn">
              Call us: {garageInfo.phone}
            </a>
          </div>

        </div>
      </section>
  );
}
