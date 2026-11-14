import React, { useState, useEffect } from 'react';
import serviceService from '../../services/service.service';
import garageInfo from '../../config/garage';

function Services() {
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    serviceService
      .getActiveServices()
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => setServices(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="contact-section">
        <div className="auto-container">
          <p>Loading services…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="contact-section">
        <div className="auto-container">
          <p style={{ color: 'red' }}>Could not load services. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Our Services</h2>
        </div>
        {services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Our service list is coming soon.
            </p>
            <p>
              Call us at <strong>{garageInfo.phone}</strong> for more information.
            </p>
          </div>
        ) : (
          <div className="row clearfix">
            {services.map((svc) => (
              <div key={svc.service_id} className="col-md-6 col-lg-4" style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    border: '1px solid #e0e0e0', borderRadius: '6px',
                    padding: '1.25rem', height: '100%',
                  }}
                >
                  <h5 style={{ marginBottom: '0.5rem' }}>{svc.service_name}</h5>
                  {svc.service_description && (
                    <p style={{ color: '#555', fontSize: '0.95rem' }}>
                      {svc.service_description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Services;
