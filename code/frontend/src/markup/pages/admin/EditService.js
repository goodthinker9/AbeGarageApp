import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import serviceService from '../../../services/service.service';

function EditService() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  const [service_name, setName]               = useState('');
  const [service_description, setDescription] = useState('');
  const [active_service, setActive]           = useState(1);
  const [loading, setLoading]                 = useState(true);
  const [nameError, setNameError]             = useState('');
  const [serverError, setServerError]         = useState('');
  const [success, setSuccess]                 = useState(false);

  // Load existing service data
  useEffect(() => {
    serviceService
      .getServiceById(id, token)
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('employee');
          navigate('/login');
          return null;
        }
        if (res.status === 404) {
          navigate('/admin/services');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.data) {
          setName(data.data.service_name);
          setDescription(data.data.service_description || '');
          setActive(data.data.active_service);
        }
      })
      .catch(() => setServerError('Could not load service.'))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    setServerError('');

    if (!service_name.trim()) {
      setNameError('Service name is required.');
      return;
    }

    try {
      const res = await serviceService.updateService(
        { service_id: Number(id), service_name, service_description, active_service },
        token,
      );
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.errors ? data.errors.map((er) => er.message).join(', ') : (data.message || 'An error occurred.'));
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/admin/services'), 1500);
    } catch {
      setServerError('A network error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid admin-pages">
        <div className="row">
          <div className="col-md-3 admin-left-side"><AdminMenu /></div>
          <div className="col-md-9 admin-right-side"><p style={{ padding: '2rem' }}>Loading…</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side">
          <AdminMenu />
        </div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title"><h2>Edit Service</h2></div>
              {success && (
                <div className="alert alert-success" role="alert">
                  Service updated! Redirecting…
                </div>
              )}
              <div className="row clearfix">
                <div className="form-column col-lg-7">
                  <div className="inner-column">
                    <form onSubmit={handleSubmit}>
                      <div className="form-group col-md-12">
                        {serverError && (
                          <div className="validation-error" role="alert">{serverError}</div>
                        )}
                        <input
                          type="text"
                          value={service_name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Service name *"
                        />
                        {nameError && (
                          <div className="validation-error" role="alert">{nameError}</div>
                        )}
                      </div>
                      <div className="form-group col-md-12">
                        <textarea
                          value={service_description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Service description"
                          rows={4}
                          style={{ width: '100%', padding: '0.5rem' }}
                        />
                      </div>
                      <div className="form-group col-md-12">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={active_service === 1}
                            onChange={(e) => setActive(e.target.checked ? 1 : 0)}
                          />
                          Active (uncheck to deactivate without deleting)
                        </label>
                      </div>
                      <div className="form-group col-md-12">
                        <button className="theme-btn btn-style-one" type="submit">
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default EditService;
