import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import customerService from '../../../services/customer.service';

const PAGE_SIZE = 10;

function AdminCustomers() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  const [customers, setCustomers] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);       // 0-based
  const [search,    setSearch]    = useState('');
  const [inputVal,  setInputVal]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    customerService
      .getAllCustomers({ search, limit: PAGE_SIZE, offset: page * PAGE_SIZE }, token)
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('employee');
          navigate('/login');
          return null;
        }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCustomers(data.data || []);
          setTotal(data.total || 0);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, page, token, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(inputVal.trim());
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side"><AdminMenu /></div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2>Customers</h2>
                <Link to="/admin/add-customer" className="theme-btn btn-style-one">Add Customer</Link>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Search by name, email or phone…"
                  style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button className="theme-btn btn-style-one" type="submit" style={{ padding: '0.4rem 1rem' }}>
                  Search
                </button>
                {search && (
                  <button type="button" onClick={() => { setInputVal(''); setSearch(''); setPage(0); }}
                    style={{ padding: '0.4rem 0.75rem', cursor: 'pointer' }}>
                    Clear
                  </button>
                )}
              </form>

              {loading && <p>Loading…</p>}
              {error   && <p style={{ color: 'red' }}>{error}</p>}

              {!loading && !error && (
                <>
                  <div className="admin-table-wrapper">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>Active</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>View</th>
                        <th>Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.customer_id}>
                          <td>{c.active_customer_status ? 'Yes' : 'No'}</td>
                          <td>{c.customer_first_name}</td>
                          <td>{c.customer_last_name}</td>
                          <td>{c.customer_email}</td>
                          <td>{c.customer_phone_number}</td>
                          <td>
                            <Link to={`/admin/customer/${c.customer_id}`}
                              className="theme-btn btn-style-one"
                              style={{ fontSize: '0.8rem', padding: '3px 10px' }}>
                              View
                            </Link>
                          </td>
                          <td>
                            <Link to={`/admin/customer/edit/${c.customer_id}`}
                              className="theme-btn btn-style-one"
                              style={{ fontSize: '0.8rem', padding: '3px 10px' }}>
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {customers.length === 0 && (
                        <tr><td colSpan="7" style={{ textAlign: 'center' }}>No customers found.</td></tr>
                      )}
                    </tbody>
                  </table>

                  </div>
                  {/* Pagination */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button className="theme-btn btn-style-one"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      style={{ padding: '4px 12px', opacity: page === 0 ? 0.5 : 1 }}>
                      Previous
                    </button>
                    <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
                    <button className="theme-btn btn-style-one"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages - 1}
                      style={{ padding: '4px 12px', opacity: page >= totalPages - 1 ? 0.5 : 1 }}>
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminCustomers;
