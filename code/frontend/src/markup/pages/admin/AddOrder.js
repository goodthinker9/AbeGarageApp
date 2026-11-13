import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import customerService from '../../../services/customer.service';
import vehicleService from '../../../services/vehicle.service';
import serviceService from '../../../services/service.service';
import employeeService from '../../../services/employee.service';
import orderService from '../../../services/order.service';

function AddOrder() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  // Step state
  const [customers, setCustomers]     = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [vehicles, setVehicles]                 = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const [services, setServices]                 = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  const [employees, setEmployees]               = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const [order_total_price, setPrice]           = useState('');
  const [estimated_completion_date, setEstDate]  = useState('');
  const [additional_request, setAddReq]          = useState('');
  const [notes_for_internal_use, setIntNotes]    = useState('');
  const [notes_for_customer, setCustNotes]      = useState('');

  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]          = useState(false);
  const [loadingMeta, setLoadingMeta]  = useState(true);

  // Load active services + employees on mount
  useEffect(() => {
    Promise.all([
      serviceService.getActiveServices(),
      employeeService.getAllEmployees(token, { limit: 100, offset: 0 }),
    ]).then(async ([svcRes, empRes]) => {
      if (svcRes.ok) {
        const svcData = await svcRes.json();
        if (svcData.status === 'success') setServices(svcData.data.filter((s) => s.active_service));
      }
      if (empRes.ok) {
        const empData = await empRes.json();
        if (empData.data) setEmployees(empData.data.filter((e) => e.active_employee));
      }
    }).catch(() => {}).finally(() => setLoadingMeta(false));
  }, [token]);

  const searchCustomers = (e) => {
    e.preventDefault();
    setHasSearched(true);
    customerService.getAllCustomers({ search: searchTerm, limit: 20, offset: 0 }, token)
      .then((res) => res.json())
      .then((data) => setCustomers(data.data || []))
      .catch(() => setCustomers([]));
  };

  const selectCustomer = (c) => {
    setSelectedCustomer(c);
    setSelectedVehicleId('');
    vehicleService.getVehiclesByCustomer(c.customer_id, token)
      .then((res) => res.json())
      .then((data) => setVehicles(data.data || []))
      .catch(() => setVehicles([]));
  };

  const toggleService = (id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const validate = () => {
    const errs = {};
    if (!selectedCustomer) errs.customer = 'Select a customer.';
    if (!selectedVehicleId) errs.vehicle = 'Select a vehicle.';
    if (selectedServiceIds.length === 0) errs.services = 'Select at least one service.';
    if (!selectedEmployeeId) errs.employee = 'Select an employee.';
    if (!order_total_price || Number(order_total_price) < 0) errs.price = 'Total price is required (≥ 0).';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setServerError('');

    try {
      const res = await orderService.createOrder({
        customer_id: selectedCustomer.customer_id,
        vehicle_id: Number(selectedVehicleId),
        employee_id: Number(selectedEmployeeId),
        service_ids: selectedServiceIds,
        order_total_price: Number(order_total_price),
        estimated_completion_date: estimated_completion_date || undefined,
        additional_request: additional_request || undefined,
        notes_for_internal_use: notes_for_internal_use || undefined,
        notes_for_customer: notes_for_customer || undefined,
      }, token);
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || 'An error occurred.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/admin/orders'), 1500);
    } catch {
      setServerError('A network error occurred. Please try again.');
    }
  };

  if (loadingMeta) return (
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
              <div className="contact-title"><h2>Add New Order</h2></div>
              {success && <div className="alert alert-success" role="alert">Order created! Redirecting…</div>}

              <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
                {serverError && <div className="validation-error" role="alert" style={{ marginBottom: '1rem' }}>{serverError}</div>}

                {/* Step 1: Customer */}
                <h4 style={{ marginTop: '1rem' }}>1. Select Customer</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email or phone…" style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <button className="theme-btn btn-style-one" type="button" onClick={searchCustomers} style={{ padding: '0.4rem 1rem' }}>Search</button>
                </div>
                {errors.customer && <div className="validation-error" role="alert">{errors.customer}</div>}
                {hasSearched && !selectedCustomer && (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.5rem' }}>
                    {customers.length === 0 ? <p style={{ padding: '0.75rem' }}>No customers found.</p> :
                      customers.map((c) => (
                        <button key={c.customer_id} type="button" onClick={() => selectCustomer(c)}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                          {c.customer_first_name} {c.customer_last_name} — {c.customer_email}
                        </button>
                      ))}
                  </div>
                )}
                {selectedCustomer && (
                  <p style={{ background: '#e8f0fe', padding: '0.5rem 0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                    <strong>Selected:</strong> {selectedCustomer.customer_first_name} {selectedCustomer.customer_last_name}
                    <button type="button" onClick={() => { setSelectedCustomer(null); setVehicles([]); setSelectedVehicleId(''); }}
                      style={{ marginLeft: '0.75rem', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
                  </p>
                )}

                {/* Step 2: Vehicle */}
                {selectedCustomer && (
                  <>
                    <h4>2. Select Vehicle</h4>
                    <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="custom-select-box" style={{ width: '100%', marginBottom: '0.5rem' }}>
                      <option value="">Choose a vehicle…</option>
                      {vehicles.map((v) => (
                        <option key={v.vehicle_id} value={v.vehicle_id}>
                          {v.vehicle_year} {v.vehicle_make} {v.vehicle_model} — {v.vehicle_tag}
                        </option>
                      ))}
                    </select>
                    {errors.vehicle && <div className="validation-error" role="alert">{errors.vehicle}</div>}
                  </>
                )}

                {/* Step 3: Services */}
                {selectedVehicleId && (
                  <>
                    <h4 style={{ marginTop: '1rem' }}>3. Select Services</h4>
                    {errors.services && <div className="validation-error" role="alert">{errors.services}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                      {services.map((s) => (
                        <label key={s.service_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedServiceIds.includes(s.service_id)}
                            onChange={() => toggleService(s.service_id)} />
                          <span>{s.service_name}</span>
                        </label>
                      ))}
                      {services.length === 0 && <p>No active services available.</p>}
                    </div>
                  </>
                )}

                {/* Step 4: Employee + price + notes */}
                {selectedServiceIds.length > 0 && (
                  <>
                    <h4 style={{ marginTop: '1rem' }}>4. Assign Employee</h4>
                    <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="custom-select-box" style={{ width: '100%', marginBottom: '0.5rem' }}>
                      <option value="">Choose an employee…</option>
                      {employees.map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                          {emp.employee_first_name} {emp.employee_last_name} ({emp.company_role_name})
                        </option>
                      ))}
                    </select>
                    {errors.employee && <div className="validation-error" role="alert">{errors.employee}</div>}

                    <h4 style={{ marginTop: '1rem' }}>5. Price, Date & Notes</h4>
                    <div className="form-group col-md-12" style={{ marginBottom: '0.5rem' }}>
                      <input type="number" value={order_total_price} onChange={(e) => setPrice(e.target.value)}
                        placeholder="Total price *" min="0" style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                      {errors.price && <div className="validation-error" role="alert">{errors.price}</div>}
                    </div>
                    <div className="form-group col-md-12" style={{ marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#666' }}>Estimated completion date</label>
                      <input type="date" value={estimated_completion_date} onChange={(e) => setEstDate(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div className="form-group col-md-12" style={{ marginBottom: '0.5rem' }}>
                      <textarea value={additional_request} onChange={(e) => setAddReq(e.target.value)}
                        placeholder="Additional request" rows={2}
                        style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div className="form-group col-md-12" style={{ marginBottom: '0.5rem' }}>
                      <textarea value={notes_for_internal_use} onChange={(e) => setIntNotes(e.target.value)}
                        placeholder="Internal notes" rows={2}
                        style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div className="form-group col-md-12" style={{ marginBottom: '0.5rem' }}>
                      <textarea value={notes_for_customer} onChange={(e) => setCustNotes(e.target.value)}
                        placeholder="Customer notes" rows={2}
                        style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>

                    <div className="form-group col-md-12">
                      <button className="theme-btn btn-style-one" type="submit"><span>Create Order</span></button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AddOrder;
