import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import customerService from '../../../services/customer.service';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function AddCustomer() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  const [form, setForm] = useState({
    customer_email: '', customer_phone_number: '',
    customer_first_name: '', customer_last_name: '',
  });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]     = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.customer_email.trim())                       errs.customer_email = 'Email is required.';
    else if (!EMAIL_RE.test(form.customer_email.trim()))   errs.customer_email = 'Invalid email format.';
    if (!form.customer_phone_number.trim())                errs.customer_phone_number = 'Phone number is required.';
    if (!form.customer_first_name.trim())                  errs.customer_first_name = 'First name is required.';
    if (!form.customer_last_name.trim())                   errs.customer_last_name = 'Last name is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setServerError('');

    try {
      const res  = await customerService.createCustomer(form, token);
      const data = await res.json();
      if (res.status === 409) { setServerError(data.message); return; }
      if (!res.ok) {
        if (data.errors) setErrors(Object.fromEntries(data.errors.map((er) => [er.field, er.message])));
        else setServerError(data.message || 'An error occurred.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/admin/customers'), 1500);
    } catch {
      setServerError('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side"><AdminMenu /></div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title"><h2>Add a New Customer</h2></div>
              {success && <div className="alert alert-success" role="alert">Customer added! Redirecting…</div>}
              <div className="row clearfix">
                <div className="form-column col-lg-7">
                  <form onSubmit={handleSubmit}>
                    {serverError && <div className="validation-error" role="alert">{serverError}</div>}

                    {[
                      { field: 'customer_first_name', label: 'First name *',   type: 'text'  },
                      { field: 'customer_last_name',  label: 'Last name *',    type: 'text'  },
                      { field: 'customer_email',      label: 'Email *',        type: 'email' },
                      { field: 'customer_phone_number', label: 'Phone number *', type: 'text' },
                    ].map(({ field, label, type }) => (
                      <div className="form-group col-md-12" key={field}>
                        <input type={type} value={form[field]} onChange={set(field)} placeholder={label} />
                        {errors[field] && <div className="validation-error" role="alert">{errors[field]}</div>}
                      </div>
                    ))}

                    <div className="form-group col-md-12">
                      <button className="theme-btn btn-style-one" type="submit">
                        <span>Add Customer</span>
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

export default AddCustomer;
