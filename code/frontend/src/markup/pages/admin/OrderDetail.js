import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import orderService from '../../../services/order.service';
import { ORDER_STATUS, ORDER_STATUS_NAMES } from '../../../constants/orderStatus';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';
  const role  = employee?.employee_role ?? 1;

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [msg, setMsg]         = useState('');

  const load = useCallback(() => {
    orderService.getOrderById(id, token)
      .then((res) => {
        if (res.status === 401) { localStorage.removeItem('employee'); navigate('/login'); return null; }
        if (res.status === 403) { navigate('/admin/orders'); return null; }
        if (res.status === 404) { navigate('/admin/orders'); return null; }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => { if (data?.data) setOrder(data.data); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (e) => {
    const newStatus = Number(e.target.value);
    setMsg('');
    try {
      const res = await orderService.updateOrderStatus(id, newStatus, token);
      if (!res.ok) { const d = await res.json(); setMsg(d.message || 'Error'); return; }
      setMsg('Status updated.');
      load();
    } catch { setMsg('Network error.'); }
  };

  const toggleService = async (serviceId, current) => {
    setMsg('');
    try {
      const res = await orderService.updateOrderService(id, serviceId, current ? 0 : 1, token);
      if (!res.ok) { const d = await res.json(); setMsg(d.message || 'Error'); return; }
      load();
    } catch { setMsg('Network error.'); }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/order/${order?.order_hash}`;
    navigator.clipboard.writeText(link).then(() => setMsg('Customer link copied!'));
  };

  if (loading) return (
    <div className="container-fluid admin-pages"><div className="row">
      <div className="col-md-3 admin-left-side"><AdminMenu /></div>
      <div className="col-md-9 admin-right-side"><p style={{ padding: '2rem' }}>Loading…</p></div>
    </div></div>
  );
  if (error) return (
    <div className="container-fluid admin-pages"><div className="row">
      <div className="col-md-3 admin-left-side"><AdminMenu /></div>
      <div className="col-md-9 admin-right-side"><p style={{ padding: '2rem', color: 'red' }}>{error}</p></div>
    </div></div>
  );

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side"><AdminMenu /></div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2>Order #{order.order_id}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(role === 2 || role === 3) && (
                    <Link to={`/admin/order/edit/${id}`} className="theme-btn btn-style-one" style={{ fontSize: '0.85rem' }}>Edit</Link>
                  )}
                  <button onClick={copyLink} className="theme-btn btn-style-one" style={{ fontSize: '0.85rem' }} type="button">
                    Copy Customer Link
                  </button>
                </div>
              </div>

              {msg && <p style={{ color: msg.includes('error') || msg.includes('Error') ? 'red' : 'green', marginBottom: '0.75rem' }}>{msg}</p>}

              {/* Order hash */}
              <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.5rem' }}>
                Hash: <code>{order.order_hash}</code>
              </p>

              {/* Status */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label><strong>Status</strong></label>
                <select value={order.order_status} onChange={handleStatusChange}
                  className="custom-select-box" style={{ width: '200px', marginLeft: '0.75rem' }}>
                  <option value={ORDER_STATUS.RECEIVED}>{ORDER_STATUS_NAMES[0]}</option>
                  <option value={ORDER_STATUS.IN_PROGRESS}>{ORDER_STATUS_NAMES[1]}</option>
                  <option value={ORDER_STATUS.COMPLETED}>{ORDER_STATUS_NAMES[2]}</option>
                </select>
              </div>

              {/* Customer & Vehicle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
                  <h4>Customer</h4>
                  <p>{order.customer_first_name} {order.customer_last_name}<br />
                     {order.customer_email}<br />
                     {order.customer_phone_number}</p>
                </div>
                <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
                  <h4>Vehicle</h4>
                  <p>{order.vehicle_year} {order.vehicle_make} {order.vehicle_model}<br />
                     Tag: {order.vehicle_tag} | VIN: {order.vehicle_serial}<br />
                     {order.vehicle_color}, {Number(order.vehicle_mileage).toLocaleString()} mi</p>
                </div>
              </div>

              {/* Assigned employee */}
              <p style={{ marginBottom: '1.5rem' }}>
                <strong>Assigned to:</strong> {order.employee_first_name} {order.employee_last_name}
              </p>

              {/* Order info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4>Order Info</h4>
                <p><strong>Total:</strong> ${(Number(order.order_total_price) || 0).toLocaleString()}</p>
                {order.estimated_completion_date && (
                  <p><strong>Est. completion:</strong> {new Date(order.estimated_completion_date).toLocaleDateString()}</p>
                )}
                {order.completion_date && (
                  <p><strong>Completed:</strong> {new Date(order.completion_date).toLocaleDateString()}</p>
                )}
                {order.additional_request && <p><strong>Additional request:</strong> {order.additional_request}</p>}
                {order.notes_for_internal_use && <p><strong>Internal notes:</strong> {order.notes_for_internal_use}</p>}
                {order.notes_for_customer && <p><strong>Customer notes:</strong> {order.notes_for_customer}</p>}
              </div>

              {/* Services */}
              <h4 style={{ marginBottom: '0.75rem' }}>Services</h4>
              <div className="admin-table-wrapper">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr><th>Service</th><th>Description</th><th>Completed</th></tr>
                  </thead>
                  <tbody>
                    {order.services && order.services.map((s) => (
                      <tr key={s.order_service_id}>
                        <td>{s.service_name}</td>
                        <td>{s.service_description || '—'}</td>
                        <td>
                          <input type="checkbox" checked={!!s.service_completed}
                            onChange={() => toggleService(s.service_id, s.service_completed)} />
                        </td>
                      </tr>
                    ))}
                    {(!order.services || order.services.length === 0) && (
                      <tr><td colSpan="3" style={{ textAlign: 'center' }}>No services on this order.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
