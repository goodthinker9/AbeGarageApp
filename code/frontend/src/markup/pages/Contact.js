import React from 'react';
import { Link } from 'react-router-dom';
import garageInfo from '../../config/garage';

const pageTitle = `${process.env.PUBLIC_URL}/assets/images/background/bg-3.jpg`;

function Contact() {
  return (
    <>
      {/* ── Page title banner ──────────────────────────────────────────────── */}
      <section
        style={{
          backgroundImage: `url(${pageTitle})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          padding: '60px 0', position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,54,0.72)' }} />
        <div className="auto-container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Contact Us</h1>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ color: '#ee0c0a' }}>Home</Link></li>
            <li style={{ color: '#ccc' }}>&gt;</li>
            <li style={{ color: '#ccc' }}>About Us</li>
          </ul>
        </div>
      </section>

      {/* ── Contact info + map placeholder ───────────────────────────────────── */}
      <section style={{ padding: '60px 0' }}>
        <div className="auto-container">
          <div className="row clearfix">
            {/* Map placeholder */}
            <div className="col-lg-7 col-md-12" style={{ marginBottom: '2rem' }}>
              <div style={{
                background: '#e8e8e8', borderRadius: '4px', overflow: 'hidden',
                height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Embed a static map link. Real embed requires Google Maps API key. */}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(garageInfo.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#666', textDecoration: 'none', textAlign: 'center' }}
                >
                  <span className="flaticon-pin" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }} />
                  View on Google Maps<br />
                  <small style={{ color: '#888' }}>{garageInfo.address}</small>
                </a>
              </div>
            </div>

            {/* Address details */}
            <div className="col-lg-5 col-md-12">
              <div className="sec-title" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#ee0c0a', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  Our Address
                </h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  {garageInfo.aboutIntro}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                <span className="flaticon-pin" style={{ fontSize: '1.5rem', color: '#ee0c0a', marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0a1436' }}>Address:</strong>
                  <p style={{ margin: 0, color: '#666' }}>{garageInfo.address}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                <span className="flaticon-email" style={{ fontSize: '1.5rem', color: '#ee0c0a', marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0a1436' }}>Email:</strong>
                  <p style={{ margin: 0 }}>
                    <a href={`mailto:${garageInfo.email}`} style={{ color: '#666' }}>{garageInfo.email}</a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <span className="flaticon-phone" style={{ fontSize: '1.5rem', color: '#ee0c0a', marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#0a1436' }}>Phone:</strong>
                  <p style={{ margin: 0 }}>
                    <a href={`tel:${garageInfo.phoneTel}`} style={{ color: '#666' }}>{garageInfo.phone}</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
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

export default Contact;
