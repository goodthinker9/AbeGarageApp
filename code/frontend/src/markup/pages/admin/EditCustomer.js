import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import customerService from '../../../services/customer.service';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function EditCustomer() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  const [form, setForm] = useState({
    customer_email: '', customer_phone_number: '',
    customer_first_name: '', customer_last_name: '',
    active_customer_status: 1,
  });
  const [loading, setLoading]         = useState(true);
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    customerService.getCustomerById(id, token)
      .then((res) => {
        if (res.status === 401) { localStorage.removeItem('employee'); navigate('/login'); return null; }
        if (res.status === 404) { navigate('/admin/customers'); return null; }
        return res.json();
      })
      .then((data) => {
        if (data?.data) {
          const c = data.data;
          setForm({
            customer_email:         c.customer_email,
            customer_phone_number:  c.customer_phone_number,
            customer_first_name:    c.customer_first_name,
            customer_last_name:     c.customer_last_name,
            active_customer_status: c.active_customer_status,
          });
        }
      })
      .catch(() => setServerError('Could not load customer.'))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.customer_email.trim())                      errs.customer_email = 'Email is required.';
    else if (!EMAIL_RE.test(form.customer_email.trim()))  errs.customer_email = 'Invalid email format.';
    if (!form.customer_phone_number.trim())               errs.customer_phone_number = 'Phone number is required.';
    if (!form.customer_first_name.trim())                 errs.customer_first_name = 'First name is required.';
    if (!form.customer_last_name.trim())                  errs.customer_last_name = 'Last name is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setServerError('');

    try {
      const res  = await customerService.updateCustomer({ customer_id: Number(id), ...form }, token);
      const data = await res.json();
      if (res.status === 409) { setServerError(data.message); return; }
      if (!res.ok) {
        if (data.errors) setErrors(Object.fromEntries(data.errors.map((er) => [er.field, er.message])));
        else setServerError(data.message || 'An error occurred.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate(`/admin/customer/${id}`), 1500);
    } catch {
      setServerError('A network error occurred. Please try again.');
    }
  };

  if (loading) return (
    <div className="container-fluid admin-pages"><div className="row">
      <div className="col-md-3 admin-left-side"><AdminMenu /></div>
      <div className="col-md-9 admin-right-side"><p style={{ padding: '2rem' }}>Loading…</p></div>
    </div></div>
  );

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side"><AdminMenu /></div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title"><h2>Edit Customer</h2></div>
              {success && <div className="alert alert-success" role="alert">Customer updated! Redirecting…</div>}
              <div className="row clearfix">
                <div className="form-column col-lg-7">
                  <form onSubmit={handleSubmit}>
                    {serverError && <div className="validation-error" role="alert">{serverError}</div>}

                    {[
                      { field: 'customer_first_name',   label: 'First name *',    type: 'text'  },
                      { field: 'customer_last_name',    label: 'Last name *',     type: 'text'  },
                      { field: 'customer_email',        label: 'Email *',         type: 'email' },
                      { field: 'customer_phone_number', label: 'Phone number *',  type: 'text'  },
                    ].map(({ field, label, type }) => (
                      <div className="form-group col-md-12" key={field}>
                        <input type={type} value={form[field]} onChange={set(field)} placeholder={label} />
                        {errors[field] && <div className="validation-error" role="alert">{errors[field]}</div>}
                      </div>
                    ))}

                    <div className="form-group col-md-12">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox"
                          checked={Number(form.active_customer_status) === 1}
                          onChange={(e) => setForm((f) => ({ ...f, active_customer_status: e.target.checked ? 1 : 0 }))}
                        />
                        Active customer
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
          </section>
        </div>
      </div>
    </div>
  );
}

export default EditCustomer;
