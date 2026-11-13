import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import orderService from '../../../services/order.service';
import { ORDER_STATUS_NAMES } from '../../../constants/orderStatus';

const PAGE_SIZE = 10;
const STATUS_BADGE = {
  0: { background: '#6c757d', color: '#fff' },
  1: { background: '#0d6efd', color: '#fff' },
  2: { background: '#198754', color: '#fff' },
};

function Orders() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';
  const role  = employee?.employee_role ?? 1;

  const [orders, setOrders] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(0);
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    orderService
      .getAllOrders({ search, status: statusFilter, limit: PAGE_SIZE, offset: page * PAGE_SIZE }, token)
      .then((res) => {
        if (res.status === 401) { localStorage.removeItem('employee'); navigate('/login'); return null; }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data) { setOrders(data.data || []); setTotal(data.total || 0); }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, statusFilter, page, token, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); setPage(0); setSearch(inputVal.trim()); };
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side"><AdminMenu /></div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2>Orders</h2>
                {(role === 2 || role === 3) && (
                  <Link to="/admin/add-order" className="theme-btn btn-style-one">Add Order</Link>
                )}
              </div>

              {/* Search + status filter */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Search by customer name, email, phone or vehicle tag…"
                    style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <button className="theme-btn btn-style-one" type="submit" style={{ padding: '0.4rem 1rem' }}>Search</button>
                </form>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                  style={{ padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">All statuses</option>
                  <option value="0">Received</option>
                  <option value="1">In Progress</option>
                  <option value="2">Completed</option>
                </select>
              </div>

              {loading && <p>Loading…</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}

              {!loading && !error && (
                <>
                  <div className="admin-table-wrapper">
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th>Order #</th><th>Date</th><th>Customer</th>
                          <th>Vehicle</th><th>Employee</th><th>Status</th>
                          <th>Total</th><th>View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.order_id}>
                            <td>{o.order_id}</td>
                            <td>{new Date(o.order_date).toLocaleDateString()}</td>
                            <td>{o.customer_first_name} {o.customer_last_name}</td>
                            <td>{o.vehicle_make} {o.vehicle_model} ({o.vehicle_tag})</td>
                            <td>{o.employee_first_name} {o.employee_last_name}</td>
                            <td>
                              <span style={{ ...STATUS_BADGE[o.order_status], padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                {ORDER_STATUS_NAMES[o.order_status] || 'Unknown'}
                              </span>
                            </td>
                            <td>${(o.order_total_price || 0).toLocaleString()}</td>
                            <td>
                              <Link to={`/admin/order/${o.order_id}`}
                                className="theme-btn btn-style-one"
                                style={{ fontSize: '0.8rem', padding: '3px 10px' }}>
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr><td colSpan="8" style={{ textAlign: 'center' }}>No orders found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
                      <button className="theme-btn btn-style-one"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{ padding: '4px 12px', opacity: page === 0 ? 0.5 : 1 }} type="button">
                        Previous
                      </button>
                      <span>Page {page + 1} of {totalPages}</span>
                      <button className="theme-btn btn-style-one"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= totalPages - 1}
                        style={{ padding: '4px 12px', opacity: page >= totalPages - 1 ? 0.5 : 1 }} type="button">
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Orders;
