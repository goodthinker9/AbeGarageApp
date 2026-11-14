import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import serviceService from '../../services/service.service';
import garageInfo from '../../config/garage';

const pageTitle = `${process.env.PUBLIC_URL}/assets/images/background/bg-3.jpg`;
const addSvcImg = `${process.env.PUBLIC_URL}/assets/images/resource/image-3.jpg`;
const tireBg    = `${process.env.PUBLIC_URL}/assets/images/background/bg-2.jpg`;

const SERVICE_ICONS = [
  'flaticon-car', 'flaticon-gearbox', 'flaticon-brake',
  'flaticon-engine', 'flaticon-tyre', 'flaticon-painting',
];

const WHY_ICONS = [
  'flaticon-mechanic', 'flaticon-tools-and-utensils',
  'flaticon-price-tag', 'flaticon-award',
];

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    serviceService.getActiveServices()
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => setServices(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── Page title banner ──────────────────────────────────────────────── */}
      <section
        className="page-title"
        style={{
          backgroundImage: `url(${pageTitle})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          padding: '60px 0', position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,54,0.72)' }} />
        <div className="auto-container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Our Services</h1>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ color: '#ee0c0a' }}>Home</Link></li>
            <li style={{ color: '#ccc' }}>&gt;</li>
            <li style={{ color: '#ccc' }}>Services</li>
          </ul>
        </div>
      </section>

      {/* ── Services grid ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#f5f5f5', padding: '60px 0' }}>
        <div className="auto-container">
          <div className="sec-title">
            <h2>Our Services <span className="decor" /></h2>
            <div className="lower-text">{garageInfo.aboutIntro}</div>
          </div>

          {loading && <p>Loading services…</p>}
          {error   && <p style={{ color: 'red' }}>Could not load services. Please try again later.</p>}

          {!loading && !error && (
            services.length > 0 ? (
              <div className="row clearfix">
                {services.map((svc, i) => (
                  <div key={svc.service_id} className="col-lg-4 col-md-6 col-sm-12" style={{ marginBottom: '1.5rem' }}>
                    <div className="service-block-one">
                      <div className="inner-box" style={{
                        background: '#fff', padding: '1.5rem', borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderBottom: '2px solid #ee0c0a',
                        height: '100%',
                      }}>
                        <div className="icon-box" style={{ marginBottom: '0.75rem' }}>
                          <span className={SERVICE_ICONS[i % SERVICE_ICONS.length]}
                            style={{ fontSize: '2rem', color: '#ccc' }} />
                        </div>
                        <div className="cat" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '0.3rem' }}>
                          Service and Repairs
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ee0c0a', marginBottom: '0.75rem' }}>
                          {svc.service_name}
                        </h4>
                        <Link to="/services" style={{ fontSize: '0.8rem', color: '#ee0c0a', fontWeight: 600 }}>
                          READ MORE +
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Our service list is coming soon.</p>
                <p>Call us at <strong>{garageInfo.phone}</strong> for more information.</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* ── Why Choose Us + Additional Services ──────────────────────────────── */}
      <section style={{ padding: '60px 0' }}>
        <div className="auto-container">
          <div className="row clearfix">
            <div className="col-lg-6 col-md-12">
              <div className="sec-title">
                <h2>Why Choose Us <span className="decor" /></h2>
                <div className="lower-text">{garageInfo.whyUsText}</div>
              </div>
              {garageInfo.highlights.map((h, i) => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #ee0c0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className={WHY_ICONS[i % WHY_ICONS.length]} style={{ fontSize: '1.4rem', color: '#ee0c0a' }} />
                  </div>
                  <span style={{ fontWeight: 600, color: '#0a1436' }}>{h}</span>
                </div>
              ))}
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="sec-title">
                <h2>Addtional Services <span className="decor" /></h2>
              </div>
              <div className="row clearfix">
                <div className="col-md-7">
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {garageInfo.additionalServices.map((s) => (
                      <li key={s} style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#ee0c0a', fontSize: '0.8rem' }}>✓</span>
                        <span style={{ fontSize: '0.9rem', color: '#444' }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-md-5">
                  <img src={addSvcImg} alt="Services" style={{ width: '100%', borderRadius: '4px', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark tire banner ──────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundImage: `url(${tireBg})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          padding: '80px 0', position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,54,0.82)' }} />
        <div className="auto-container" style={{ position: 'relative', zIndex: 1, color: '#fff', maxWidth: '550px' }}>
          <h2 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
            We are leader<br />in Car Mechanical Work
          </h2>
        </div>
      </section>

      {/* ── Schedule CTA ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#ee0c0a', padding: '30px 0' }}>
        <div className="auto-container">
          <div className="row clearfix" style={{ alignItems: 'center' }}>
            <div className="col-lg-5 col-md-12" style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: '1.5rem' }}>{garageInfo.ctaTitle}</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.9rem' }}>{garageInfo.ctaSubtitle}</p>
            </div>
            <div className="col-lg-4 col-md-6" style={{ marginBottom: '0.5rem' }}>
              <a href={`tel:${garageInfo.phoneTel}`}
                style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, textDecoration: 'none' }}>
                {garageInfo.phone}
              </a>
            </div>
            <div className="col-lg-3 col-md-6" style={{ textAlign: 'right' }}>
              <Link to="/contact"
                style={{ display: 'inline-block', border: '2px solid #fff', color: '#fff', padding: '10px 24px', fontWeight: 600, textDecoration: 'none' }}>
                CONTACT US →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Services;
