import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import serviceService from '../../../services/service.service';

function AdminServices() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    serviceService
      .getAllServices(token)
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('employee');
          navigate('/login');
          return null;
        }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => { if (data) setServices(data.data || []); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side">
          <AdminMenu />
        </div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Services</h2>
                <Link to="/admin/add-service" className="theme-btn btn-style-one">
                  Add Service
                </Link>
              </div>

              {loading && <p>Loading…</p>}
              {error   && <p style={{ color: 'red' }}>{error}</p>}

              {!loading && !error && (
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Active</th>
                      <th>Service Name</th>
                      <th>Description</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((svc) => (
                      <tr key={svc.service_id}>
                        <td>{svc.active_service ? 'Yes' : 'No'}</td>
                        <td>{svc.service_name}</td>
                        <td>{svc.service_description || '—'}</td>
                        <td>
                          <Link
                            to={`/admin/service/edit/${svc.service_id}`}
                            className="theme-btn btn-style-one"
                            style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>No services found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminServices;
