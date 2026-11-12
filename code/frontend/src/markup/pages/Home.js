import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bannerImg from '../../assets/images/banner/banner.jpg';
import garageInfo from '../../config/garage';

function Home() {
  const [services, setServices]   = useState([]);
  const [loadingSvc, setLoadingSvc] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/services`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') setServices(data.data.slice(0, 6));
      })
      .catch(() => { /* silently ignore – services section just stays hidden */ })
      .finally(() => setLoadingSvc(false));
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="banner-section"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="auto-container" style={{ width: '100%' }}>
          <div style={{ maxWidth: '600px', color: '#fff' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
              Your Trusted Auto Repair Experts
            </h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Certified technicians, honest pricing, and repairs done right the first time.
              Serving the community with pride.
            </p>
            <Link to="/contact" className="theme-btn btn-style-one" style={{ marginRight: '1rem' }}>
              Schedule Appointment
            </Link>
            <Link to="/services" className="theme-btn btn-style-two">
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="contact-section" style={{ background: '#f9f9f9' }}>
        <div className="auto-container">
          <div className="row clearfix" style={{ alignItems: 'center' }}>
            <div className="col-lg-6">
              <h2>Why Choose {garageInfo.name}?</h2>
              <p>
                We've been keeping cars on the road for years. Whether it's a quick oil change
                or a full engine rebuild, we bring the same care and skill to every job.
              </p>
              <ul style={{ paddingLeft: '1.2rem', lineHeight: '2' }}>
                <li>ASE-certified mechanics</li>
                <li>Transparent, upfront pricing</li>
                <li>12-month / 12,000-mile warranty on repairs</li>
                <li>Comfortable waiting lounge with complimentary coffee (Beso!)</li>
              </ul>
            </div>
            <div className="col-lg-6" style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <div style={{ background: '#e8f0fe', padding: '2rem', borderRadius: '8px' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {garageInfo.hours}
                </p>
                <p style={{ fontSize: '1.1rem' }}>
                  <strong>{garageInfo.phone}</strong>
                </p>
                <p>{garageInfo.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services highlights ───────────────────────────────────────────── */}
      {!loadingSvc && services.length > 0 && (
        <section className="contact-section">
          <div className="auto-container">
            <div className="contact-title">
              <h2>What We Offer</h2>
            </div>
            <div className="row clearfix">
              {services.map((svc) => (
                <div key={svc.service_id} className="col-md-4" style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      padding: '1.25rem',
                      height: '100%',
                    }}
                  >
                    <h5 style={{ marginBottom: '0.5rem' }}>{svc.service_name}</h5>
                    {svc.service_description && (
                      <p style={{ color: '#666', fontSize: '0.95rem' }}>
                        {svc.service_description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/services" className="theme-btn btn-style-one">
                View All Services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: '#1a1a2e', color: '#fff',
          padding: '3rem 0', textAlign: 'center',
        }}
      >
        <div className="auto-container">
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>
            Ready to get your car fixed?
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Call us on <strong>{garageInfo.phone}</strong> or use the link below.
          </p>
          <Link to="/contact" className="theme-btn btn-style-one">
            Contact Us Today
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
