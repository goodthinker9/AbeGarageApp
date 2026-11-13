import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import orderService from '../../../services/order.service';
import employeeService from '../../../services/employee.service';
import serviceService from '../../../services/service.service';

function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  const [employees, setEmployees] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  const [form, setForm] = useState({
    employee_id: '', order_total_price: '', estimated_completion_date: '',
    additional_request: '', notes_for_internal_use: '', notes_for_customer: '', active_order: 1,
  });

  const [loading, setLoading]     = useState(true);
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    Promise.all([
      orderService.getOrderById(id, token),
      employeeService.getAllEmployees(token, { limit: 100, offset: 0 }),
      serviceService.getActiveServices(),
    ]).then(async ([ordRes, empRes, svcRes]) => {
      if (ordRes.status === 401) { localStorage.removeItem('employee'); navigate('/login'); return; }
      if (ordRes.status === 404) { navigate('/admin/orders'); return; }
      const ordData = await ordRes.json();
      if (ordData.data) {
        const o = ordData.data;
        setForm({
          employee_id: o.employee_id || '',
          order_total_price: o.order_total_price || '',
          estimated_completion_date: o.estimated_completion_date ? o.estimated_completion_date.substring(0, 10) : '',
          additional_request: o.additional_request || '',
          notes_for_internal_use: o.notes_for_internal_use || '',
          notes_for_customer: o.notes_for_customer || '',
          active_order: o.active_order,
        });
        setSelectedServiceIds((o.services || []).map((s) => s.service_id));
      }
      if (empRes.ok) {
        const empData = await empRes.json();
        if (empData.data) setEmployees(empData.data.filter((e) => e.active_employee));
      }
      if (svcRes.ok) {
        const svcData = await svcRes.json();
        if (svcData.status === 'success') setAllServices(svcData.data);
      }
    }).catch(() => setServerError('Could not load order.'))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const toggleService = (sid) => setSelectedServiceIds((prev) =>
    prev.includes(sid) ? prev.filter((s) => s !== sid) : [...prev, sid],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setErrors({});

    if (!form.employee_id) errors.employee_id = 'Employee is required.';
    if (form.order_total_price === '' || Number(form.order_total_price) < 0) errors.order_total_price = 'Price must be ≥ 0.';
    if (Object.keys(errors).length) { setErrors(errors); return; }

    try {
      const res = await orderService.updateOrder({
        order_id: Number(id),
        employee_id: Number(form.employee_id),
        order_total_price: Number(form.order_total_price),
        estimated_completion_date: form.estimated_completion_date || undefined,
        additional_request: form.additional_request || undefined,
        notes_for_internal_use: form.notes_for_internal_use || undefined,
        notes_for_customer: form.notes_for_customer || undefined,
        active_order: Number(form.active_order),
        service_ids: selectedServiceIds,
      }, token);
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(Object.fromEntries(data.errors.map((er) => [er.field, er.message])));
        else setServerError(data.message || 'An error occurred.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate(`/admin/order/${id}`), 1500);
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
              <div className="contact-title"><h2>Edit Order #{id}</h2></div>
              {success && <div className="alert alert-success" role="alert">Order updated! Redirecting…</div>}
              <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
                {serverError && <div className="validation-error" role="alert" style={{ marginBottom: '1rem' }}>{serverError}</div>}

                {/* Assigned employee */}
                <div className="form-group col-md-12" style={{ marginBottom: '0.75rem' }}>
                  <label><strong>Assigned Employee</strong></label>
                  <select value={form.employee_id} onChange={set('employee_id')} className="custom-select-box" style={{ width: '100%' }}>
                    <option value="">Choose an employee…</option>
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_first_name} {emp.employee_last_name}
                      </option>
                    ))}
                  </select>
                  {errors.employee_id && <div className="validation-error" role="alert">{errors.employee_id}</div>}
                </div>

                {/* Price */}
                <div className="form-group col-md-12" style={{ marginBottom: '0.75rem' }}>
                  <label><strong>Total Price</strong></label>
                  <input type="number" value={form.order_total_price} onChange={set('order_total_price')}
                    min="0" style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                  {errors.order_total_price && <div className="validation-error" role="alert">{errors.order_total_price}</div>}
                </div>

                {/* Estimated date */}
                <div className="form-group col-md-12" style={{ marginBottom: '0.75rem' }}>
                  <label><strong>Estimated Completion Date</strong></label>
                  <input type="date" value={form.estimated_completion_date} onChange={set('estimated_completion_date')}
                    style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>

                {/* Notes */}
                <div className="form-group col-md-12" style={{ marginBottom: '0.75rem' }}>
                  <textarea value={form.additional_request} onChange={set('additional_request')}
                    placeholder="Additional request" rows={2} style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div className="form-group col-md-12" style={{ marginBottom: '0.75rem' }}>
                  <textarea value={form.notes_for_internal_use} onChange={set('notes_for_internal_use')}
                    placeholder="Internal notes" rows={2} style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div className="form-group col-md-12" style={{ marginBottom: '0.75rem' }}>
                  <textarea value={form.notes_for_customer} onChange={set('notes_for_customer')}
                    placeholder="Customer notes" rows={2} style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>

                {/* Active toggle */}
                <div className="form-group col-md-12" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={Number(form.active_order) === 1}
                      onChange={(e) => setForm((f) => ({ ...f, active_order: e.target.checked ? 1 : 0 }))} />
                    Active order (uncheck to cancel)
                  </label>
                </div>

                {/* Services */}
                <h4 style={{ marginTop: '1rem' }}>Services</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                  {allServices.map((s) => (
                    <label key={s.service_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedServiceIds.includes(s.service_id)}
                        onChange={() => toggleService(s.service_id)} />
                      <span>{s.service_name}</span>
                    </label>
                  ))}
                </div>

                <div className="form-group col-md-12">
                  <button className="theme-btn btn-style-one" type="submit"><span>Save Changes</span></button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default EditOrder;
