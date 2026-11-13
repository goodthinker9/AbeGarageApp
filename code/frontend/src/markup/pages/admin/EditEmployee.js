import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import employeeService from '../../../services/employee.service';

function EditEmployee() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { employee: loggedIn } = useAuth();
  const token = loggedIn?.employee_token ?? '';

  const [form, setForm] = useState({
    employee_first_name: '',
    employee_last_name:  '',
    employee_phone:      '',
    active_employee:     1,
    company_role_id:     1,
    employee_email:      '',   // display only, not sent in PUT
  });
  const [loading, setLoading]         = useState(true);
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    employeeService.getEmployeeById(id, token)
      .then((res) => {
        if (res.status === 401) { localStorage.removeItem('employee'); navigate('/login'); return null; }
        if (res.status === 404) { navigate('/admin/employees'); return null; }
        return res.json();
      })
      .then((data) => {
        if (data?.data) {
          const e = data.data;
          setForm({
            employee_first_name: e.employee_first_name,
            employee_last_name:  e.employee_last_name,
            employee_phone:      e.employee_phone,
            active_employee:     e.active_employee,
            company_role_id:     e.company_role_id,
            employee_email:      e.employee_email,
          });
        }
      })
      .catch(() => setServerError('Could not load employee.'))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.employee_first_name.trim()) errs.employee_first_name = 'First name is required.';
    else if (form.employee_first_name.length > 255) errs.employee_first_name = 'Max 255 characters.';
    if (!form.employee_last_name.trim())  errs.employee_last_name  = 'Last name is required.';
    else if (form.employee_last_name.length > 255)  errs.employee_last_name  = 'Max 255 characters.';
    if (!form.employee_phone.trim())      errs.employee_phone      = 'Phone is required.';
    else if (form.employee_phone.length > 255)       errs.employee_phone      = 'Max 255 characters.';
    if (![1, 2, 3].includes(Number(form.company_role_id))) errs.company_role_id = 'Invalid role.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setServerError('');

    try {
      const res = await employeeService.updateEmployee(
        {
          employee_id:         Number(id),
          employee_first_name: form.employee_first_name,
          employee_last_name:  form.employee_last_name,
          employee_phone:      form.employee_phone,
          active_employee:     Number(form.active_employee),
          company_role_id:     Number(form.company_role_id),
        },
        token,
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(Object.fromEntries(data.errors.map((er) => [er.field, er.message])));
        } else {
          setServerError(data.message || 'An error occurred.');
        }
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/admin/employees'), 1500);
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
              <div className="contact-title">
                <h2>Edit Employee</h2>
                <p style={{ color: '#666', marginTop: '-0.5rem' }}>{form.employee_email}</p>
              </div>
              {success && <div className="alert alert-success" role="alert">Employee updated! Redirecting…</div>}
              <div className="row clearfix">
                <div className="form-column col-lg-7">
                  <form onSubmit={handleSubmit}>
                    {serverError && <div className="validation-error" role="alert">{serverError}</div>}

                    {[
                      { field: 'employee_first_name', label: 'First name *', type: 'text' },
                      { field: 'employee_last_name',  label: 'Last name *',  type: 'text' },
                      { field: 'employee_phone',      label: 'Phone *',      type: 'text' },
                    ].map(({ field, label, type }) => (
                      <div className="form-group col-md-12" key={field}>
                        <input
                          type={type}
                          value={form[field]}
                          onChange={set(field)}
                          placeholder={label}
                        />
                        {errors[field] && <div className="validation-error" role="alert">{errors[field]}</div>}
                      </div>
                    ))}

                    <div className="form-group col-md-12">
                      <select
                        value={form.company_role_id}
                        onChange={set('company_role_id')}
                        className="custom-select-box"
                      >
                        <option value={1}>Employee</option>
                        <option value={2}>Manager</option>
                        <option value={3}>Admin</option>
                      </select>
                      {errors.company_role_id && <div className="validation-error" role="alert">{errors.company_role_id}</div>}
                    </div>

                    <div className="form-group col-md-12">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Number(form.active_employee) === 1}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, active_employee: e.target.checked ? 1 : 0 }))
                          }
                        />
                        Active employee
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

export default EditEmployee;
