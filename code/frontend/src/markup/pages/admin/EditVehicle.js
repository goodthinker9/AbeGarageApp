import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import { useAuth } from '../../../Contexts/AuthContext';
import vehicleService from '../../../services/vehicle.service';

const CURRENT_YEAR = new Date().getFullYear();

function EditVehicle() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const token = employee?.employee_token ?? '';

  const [form, setForm] = useState({
    vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_type: '',
    vehicle_mileage: '', vehicle_tag: '', vehicle_serial: '', vehicle_color: '',
  });
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    vehicleService.getVehicleById(id, token)
      .then((res) => {
        if (res.status === 401) { localStorage.removeItem('employee'); navigate('/login'); return null; }
        if (res.status === 404) { navigate('/admin/customers'); return null; }
        return res.json();
      })
      .then((data) => {
        if (data?.data) {
          const v = data.data;
          setCustomerId(v.customer_id);
          setForm({
            vehicle_year:    v.vehicle_year,
            vehicle_make:    v.vehicle_make,
            vehicle_model:   v.vehicle_model,
            vehicle_type:    v.vehicle_type,
            vehicle_mileage: v.vehicle_mileage,
            vehicle_tag:     v.vehicle_tag,
            vehicle_serial:  v.vehicle_serial,
            vehicle_color:   v.vehicle_color,
          });
        }
      })
      .catch(() => setServerError('Could not load vehicle.'))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    const yr = Number(form.vehicle_year);
    if (!form.vehicle_year)                                  errs.vehicle_year    = 'Year is required.';
    else if (!Number.isInteger(yr) || yr < 1950 || yr > CURRENT_YEAR + 1)
                                                             errs.vehicle_year    = `Year must be 1950–${CURRENT_YEAR + 1}.`;
    const mi = Number(form.vehicle_mileage);
    if (form.vehicle_mileage === '' || form.vehicle_mileage === undefined)
                                                             errs.vehicle_mileage = 'Mileage is required.';
    else if (!Number.isInteger(mi) || mi < 0)                errs.vehicle_mileage = 'Mileage must be ≥ 0.';
    if (!form.vehicle_make.trim())                           errs.vehicle_make    = 'Make is required.';
    if (!form.vehicle_model.trim())                          errs.vehicle_model   = 'Model is required.';
    if (!form.vehicle_type.trim())                           errs.vehicle_type    = 'Type is required.';
    if (!form.vehicle_tag.trim())                            errs.vehicle_tag     = 'Tag is required.';
    if (!form.vehicle_serial.trim())                         errs.vehicle_serial  = 'Serial/VIN is required.';
    if (!form.vehicle_color.trim())                          errs.vehicle_color   = 'Color is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setServerError('');

    try {
      const res  = await vehicleService.updateVehicle({ vehicle_id: Number(id), ...form }, token);
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(Object.fromEntries(data.errors.map((er) => [er.field, er.message])));
        else setServerError(data.message || 'An error occurred.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate(customerId ? `/admin/customer/${customerId}` : '/admin/customers'), 1500);
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
              <div className="contact-title"><h2>Edit Vehicle</h2></div>
              {success && <div className="alert alert-success" role="alert">Vehicle updated! Redirecting…</div>}
              <div className="row clearfix">
                <div className="form-column col-lg-8">
                  <form onSubmit={handleSubmit}>
                    {serverError && <div className="validation-error" role="alert">{serverError}</div>}
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
                          <input type={type} value={form[field]} onChange={set(field)} placeholder={label} min={type === 'number' ? 0 : undefined} />
                          {errors[field] && <div className="validation-error" role="alert">{errors[field]}</div>}
                        </div>
                      ))}
                    </div>
                    <div className="form-group col-md-12">
                      <button className="theme-btn btn-style-one" type="submit"><span>Save Changes</span></button>
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

export default EditVehicle;
