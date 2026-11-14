import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import customerService from '../../../services/customer.service';
import vehicleService from '../../../services/vehicle.service';
import { ORDER_STATUS_NAMES } from '../../../constants/orderStatus';

const CURRENT_YEAR = new Date().getFullYear();
const emptyVehicle = {
  vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_type: '',
  vehicle_mileage: '', vehicle_tag: '', vehicle_serial: '', vehicle_color: '',
};

const STATUS_DOT = {
  0: '#6c757d',
  1: '#e6a817',
  2: '#198754',
};

function CustomerDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  const [customer, setCustomer]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [pageError, setPageError] = useState(null);

  // Add vehicle form state
  const [showAdd, setShowAdd]       = useState(false);
  const [vForm, setVForm]           = useState(emptyVehicle);
  const [vErrors, setVErrors]       = useState({});
  const [vServerErr, setVServerErr] = useState('');
  const [vSuccess, setVSuccess]     = useState(false);

  const loadCustomer = useCallback(() => {
    customerService.getCustomerById(id, token)
      .then((res) => {
        if (res.status === 401) { localStorage.removeItem('employee'); navigate('/login'); return null; }
        if (res.status === 404) { navigate('/admin/customers'); return null; }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => { if (data?.data) setCustomer(data.data); })
      .catch((err) => setPageError(err.message))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  useEffect(() => { loadCustomer(); }, [loadCustomer]);

  const setV = (field) => (e) => setVForm((f) => ({ ...f, [field]: e.target.value }));

  const validateVehicle = () => {
    const errs = {};
    const yr = Number(vForm.vehicle_year);
    if (!vForm.vehicle_year)                               errs.vehicle_year    = 'Year is required.';
    else if (!Number.isInteger(yr) || yr < 1950 || yr > CURRENT_YEAR + 1)
                                                           errs.vehicle_year    = `Year must be 1950–${CURRENT_YEAR + 1}.`;
    const mi = Number(vForm.vehicle_mileage);
    if (vForm.vehicle_mileage === '')                      errs.vehicle_mileage = 'Mileage is required.';
    else if (!Number.isInteger(mi) || mi < 0)              errs.vehicle_mileage = 'Mileage must be ≥ 0.';
    if (!vForm.vehicle_make.trim())    errs.vehicle_make   = 'Make is required.';
    if (!vForm.vehicle_model.trim())   errs.vehicle_model  = 'Model is required.';
    if (!vForm.vehicle_type.trim())    errs.vehicle_type   = 'Type is required.';
    if (!vForm.vehicle_tag.trim())     errs.vehicle_tag    = 'Tag is required.';
    if (!vForm.vehicle_serial.trim())  errs.vehicle_serial = 'Serial/VIN is required.';
    if (!vForm.vehicle_color.trim())   errs.vehicle_color  = 'Color is required.';
    return errs;
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const errs = validateVehicle();
    setVErrors(errs);
    if (Object.keys(errs).length) return;
    setVServerErr('');
    try {
      const res  = await vehicleService.createVehicle({ ...vForm, customer_id: Number(id) }, token);
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setVErrors(Object.fromEntries(data.errors.map((er) => [er.field, er.message])));
        else setVServerErr(data.message || 'An error occurred.');
        return;
      }
      setVSuccess(true);
      setVForm(emptyVehicle);
      setShowAdd(false);
      loadCustomer();
      setTimeout(() => setVSuccess(false), 3000);
    } catch {
      setVServerErr('A network error occurred. Please try again.');
    }
  };

  if (loading) return (
    <div className="container-fluid admin-pages"><div className="row">
      <div className="col-md-3 admin-left-side"><AdminMenu /></div>
      <div className="col-md-9 admin-right-side"><p style={{ padding: '2rem' }}>Loading…</p></div>
    </div></div>
  );
  if (pageError) return (
    <div className="container-fluid admin-pages"><div className="row">
      <div className="col-md-3 admin-left-side"><AdminMenu /></div>
      <div className="col-md-9 admin-right-side"><p style={{ padding: '2rem', color: 'red' }}>{pageError}</p></div>
    </div></div>
  );

  const orders = customer.orders || [];

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side"><AdminMenu /></div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">

              {/* Title + edit button */}
              <div className="sec-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2>
                  {customer.customer_first_name} {customer.customer_last_name}
                  <span className="decor" />
                </h2>
                <Link to={`/admin/customer/edit/${id}`} className="theme-btn btn-style-one" style={{ fontSize: '0.85rem' }}>
                  Edit Customer
                </Link>
              </div>

              {/* Three-section tab strip (Info / Cars / Orders) */}
              <div className="customer-profile-tabs" style={{ display: 'flex', gap: 0, marginBottom: '1.75rem', borderBottom: '2px solid #eee' }}>
                {['Info', 'Cars', 'Orders'].map((tab) => (
                  <div key={tab} style={{
                    padding: '0.6rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#0a1436',
                    borderBottom: '3px solid #ee0c0a',
                    cursor: 'default',
                    marginBottom: '-2px',
                  }}>
                    {tab}
                  </div>
                ))}
              </div>

              {/* Info section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#0a1436', fontWeight: 700, marginBottom: '0.75rem' }}>Info</h4>
                <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '0.3rem 0.5rem' }}>
                  <dt style={{ color: '#888' }}>Status</dt>
                  <dd>{customer.active_customer_status ? 'Active' : 'Inactive'}</dd>
                  <dt style={{ color: '#888' }}>Email</dt>
                  <dd>{customer.customer_email}</dd>
                  <dt style={{ color: '#888' }}>Phone</dt>
                  <dd>{customer.customer_phone_number}</dd>
                  <dt style={{ color: '#888' }}>Member since</dt>
                  <dd>{customer.customer_added_date ? new Date(customer.customer_added_date).toLocaleDateString() : '—'}</dd>
                </dl>
              </div>

              <hr style={{ borderColor: '#eee', margin: '1.5rem 0' }} />

              {/* Cars section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ color: '#0a1436', fontWeight: 700, margin: 0 }}>Cars</h4>
                  <button className="theme-btn btn-style-one" type="button"
                    onClick={() => setShowAdd((s) => !s)} style={{ fontSize: '0.85rem' }}>
                    {showAdd ? 'Cancel' : 'Add new vehicle'}
                  </button>
                </div>

                {vSuccess && <div className="alert alert-success" role="alert">Vehicle added successfully.</div>}

                {showAdd && (
                  <form onSubmit={handleAddVehicle} style={{ background: '#f9f9f9', padding: '1rem', marginBottom: '1.25rem', borderRadius: '6px' }}>
                    <h5 style={{ marginBottom: '1rem' }}>New Vehicle</h5>
                    {vServerErr && <div className="validation-error" role="alert">{vServerErr}</div>}
                    <div className="row clearfix">
                      {[
                        { field: 'vehicle_year',    label: 'Year *',       type: 'number' },
                        { field: 'vehicle_make',    label: 'Make *',       type: 'text'   },
                        { field: 'vehicle_model',   label: 'Model *',      type: 'text'   },
                        { field: 'vehicle_type',    label: 'Type *',       type: 'text'   },
                        { field: 'vehicle_mileage', label: 'Mileage *',    type: 'number' },
                        { field: 'vehicle_tag',     label: 'Plate/Tag *',  type: 'text'   },
                        { field: 'vehicle_serial',  label: 'VIN/Serial *', type: 'text'   },
                        { field: 'vehicle_color',   label: 'Color *',      type: 'text'   },
                      ].map(({ field, label, type }) => (
                        <div className="form-group col-md-6" key={field}>
                          <input type={type} value={vForm[field]} onChange={setV(field)} placeholder={label} min={type === 'number' ? 0 : undefined} />
                          {vErrors[field] && <div className="validation-error" role="alert">{vErrors[field]}</div>}
                        </div>
                      ))}
                    </div>
                    <button className="theme-btn btn-style-one" type="submit"><span>Save Vehicle</span></button>
                  </form>
                )}

                {customer.vehicles && customer.vehicles.length > 0 ? (
                  <div className="admin-table-wrapper">
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th>Year</th><th>Make</th><th>Model</th><th>Type</th>
                          <th>Mileage</th><th>Color</th><th>Tag</th><th>Edit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.vehicles.map((v) => (
                          <tr key={v.vehicle_id}>
                            <td>{v.vehicle_year}</td>
                            <td>{v.vehicle_make}</td>
                            <td>{v.vehicle_model}</td>
                            <td>{v.vehicle_type}</td>
                            <td>{v.vehicle_mileage.toLocaleString()}</td>
                            <td>{v.vehicle_color}</td>
                            <td>{v.vehicle_tag}</td>
                            <td>
                              <Link to={`/admin/vehicle/edit/${v.vehicle_id}`}
                                className="theme-btn btn-style-one"
                                style={{ fontSize: '0.8rem', padding: '3px 10px' }}>
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>No vehicles on record for this customer.</p>
                )}
              </div>

              <hr style={{ borderColor: '#eee', margin: '1.5rem 0' }} />

              {/* Orders section */}
              <div>
                <h4 style={{ color: '#0a1436', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Orders of {customer.customer_first_name}
                </h4>
                {orders.length > 0 ? (
                  <div className="admin-table-wrapper">
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => {
                          const statusLabel = !o.active_order
                            ? 'Cancelled'
                            : (ORDER_STATUS_NAMES[o.order_status] || 'Received');
                          const dotColor = !o.active_order
                            ? '#dc3545'
                            : (STATUS_DOT[o.order_status] || '#6c757d');
                          return (
                            <tr key={o.order_id}>
                              <td>{o.order_id}</td>
                              <td>{new Date(o.order_date).toLocaleDateString()}</td>
                              <td>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                                  {statusLabel}
                                </span>
                              </td>
                              <td>
                                <Link to={`/admin/order/${o.order_id}`}
                                  className="theme-btn btn-style-one"
                                  style={{ fontSize: '0.8rem', padding: '3px 10px' }}>
                                  View
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>No orders for this customer yet.</p>
                )}
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
