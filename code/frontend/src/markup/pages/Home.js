import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import garageInfo from '../../config/garage';

// Template asset images
const sliderBg   = `${process.env.PUBLIC_URL}/assets/images/main-slider/image-1.jpg`;
const aboutImg1  = `${process.env.PUBLIC_URL}/assets/images/resource/image-1.jpg`;
const aboutImg2  = `${process.env.PUBLIC_URL}/assets/images/resource/image-2.jpg`;
const tireBg     = `${process.env.PUBLIC_URL}/assets/images/background/bg-2.jpg`;
const addSvcImg  = `${process.env.PUBLIC_URL}/assets/images/resource/image-3.jpg`;

// Icon classes used by the template for service cards
const SERVICE_ICONS = [
  'flaticon-car',
  'flaticon-gearbox',
  'flaticon-brake',
  'flaticon-engine',
  'flaticon-tyre',
  'flaticon-painting',
];

// Why choose us – icon classes
const WHY_ICONS = [
  'flaticon-mechanic',
  'flaticon-tools-and-utensils',
  'flaticon-price-tag',
  'flaticon-award',
];

function Home() {
  const [services, setServices]     = useState([]);
  const [loadingSvc, setLoadingSvc] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/services`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') setServices(data.data.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoadingSvc(false));
  }, []);

  return (
    <>
      {/* ── Hero / Main slider ─────────────────────────────────────────────── */}
      <section className="main-slider" style={{ position: 'relative' }}>
        <div
          style={{
            backgroundImage: `url(${sliderBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            minHeight: '520px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="auto-container" style={{ width: '100%' }}>
            <div className="content" style={{ maxWidth: '540px', color: '#fff' }}>
              <div className="clearfix">
                <div className="btn-box" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="slider-btn">
                    <button
                      type="button"
                      style={{
                        background: 'red', border: 'none', borderRadius: '50%',
                        width: '48px', height: '48px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}
                      aria-label="Watch intro video"
                    >
                      <span className="flaticon-play-arrow" style={{ color: '#fff', fontSize: '1.1rem' }} />
                    </button>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Watch Intro Video
                    </div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      About Us
                    </div>
                  </div>
                </div>
                {garageInfo.heroTitle.split('\n').map((line, i) => (
                  <h1 key={i} style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.1, margin: 0, color: '#fff' }}>
                    {line}
                  </h1>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Welcome / About intro ───────────────────────────────────────────── */}
      <section className="about-section">
        <div className="auto-container">
          <div className="row clearfix" style={{ alignItems: 'center' }}>
            {/* Left: image collage */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <div className="row clearfix" style={{ marginBottom: '1rem' }}>
                  <div className="col-6">
                    <img src={aboutImg1} alt="Workshop" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                  </div>
                  <div className="col-6">
                    <img src={aboutImg2} alt="Workshop" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>
            </div>
            {/* Right: text */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="sec-title">
                <h5>Welcome to Our workshop</h5>
                <h2>We have <span style={{ color: '#ee0c0a' }}>professional</span> mechanics</h2>
                <div className="lower-text">{garageInfo.aboutIntro}</div>
              </div>
              <div className="text">{garageInfo.whyUsText}</div>
              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/about" className="theme-btn btn-style-one">About Us <span className="flaticon-next" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Services ────────────────────────────────────────────────────── */}
      <section className="services-section" style={{ background: '#f5f5f5', padding: '60px 0' }}>
        <div className="auto-container">
          <div className="sec-title">
            <h2>Our Services <span className="decor" /></h2>
            <div className="lower-text">{garageInfo.aboutIntro}</div>
          </div>
          {loadingSvc ? (
            <p>Loading…</p>
          ) : services.length > 0 ? (
            <div className="row clearfix">
              {services.map((svc, i) => (
                <div key={svc.service_id} className="col-lg-4 col-md-6 col-sm-12" style={{ marginBottom: '1.5rem' }}>
                  <div className="service-block-one">
                    <div className="inner-box">
                      <div className="icon-box">
                        <span className={SERVICE_ICONS[i % SERVICE_ICONS.length]} />
                      </div>
                      <div className="content-box">
                        <div className="cat">Service and Repairs</div>
                        <h4><Link to="/services">{svc.service_name}</Link></h4>
                        <div className="text">{svc.service_description || ''}</div>
                        <Link to="/services" className="read-more">READ MORE +</Link>
                      </div>
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
          )}
        </div>
      </section>

      {/* ── Quality Service CTA (red banner) ─────────────────────────────────── */}
      <section className="quality-section" style={{ background: '#ee0c0a', padding: '60px 0' }}>
        <div className="auto-container">
          <div className="row clearfix" style={{ alignItems: 'center' }}>
            <div className="col-lg-6 col-md-12">
              <div style={{ color: '#fff' }}>
                <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 700 }}>
                  Quality Service And<br />Customer Satisfaction !!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginTop: '1rem' }}>
                  {garageInfo.whyUsText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us + Additional Services ──────────────────────────────── */}
      <section className="why-choose-section" style={{ padding: '60px 0' }}>
        <div className="auto-container">
          <div className="row clearfix">
            {/* Why choose us */}
            <div className="col-lg-6 col-md-12">
              <div className="sec-title">
                <h2>Why Choose Us <span className="decor" /></h2>
                <div className="lower-text">{garageInfo.whyUsText}</div>
              </div>
              <div className="why-us-list">
                {garageInfo.highlights.map((h, i) => (
                  <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      border: '2px solid #ee0c0a', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span className={WHY_ICONS[i % WHY_ICONS.length]} style={{ fontSize: '1.4rem', color: '#ee0c0a' }} />
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0a1436' }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Services */}
            <div className="col-lg-6 col-md-12">
              <div className="sec-title">
                <h2>Addtional Services <span className="decor" /></h2>
              </div>
              <div className="row clearfix">
                <div className="col-md-7">
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {garageInfo.additionalServices.map((s) => (
                      <li key={s} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#ee0c0a', fontSize: '0.8rem' }}>✓</span>
                        <span style={{ fontSize: '0.95rem', color: '#444' }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-md-5">
                  <img src={addSvcImg} alt="Additional services" style={{ width: '100%', borderRadius: '4px', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── We Are Leader dark banner ─────────────────────────────────────────── */}
      <section
        style={{
          backgroundImage: `url(${tireBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '80px 0',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10,20,54,0.82)',
        }} />
        <div className="auto-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#fff', maxWidth: '550px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '32px', height: '2px', background: '#ee0c0a' }} />
              <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{garageInfo.ctaSubtitle}</span>
            </div>
            <h2 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>
              We are leader<br />in Car Mechanical Work
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                type="button"
                style={{
                  background: 'red', border: 'none', borderRadius: '50%',
                  width: '52px', height: '52px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
                aria-label="Watch intro video"
              >
                <span className="flaticon-play-arrow" style={{ color: '#fff', fontSize: '1.1rem' }} />
              </button>
              <div>
                <div style={{ color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Watch Intro Video</div>
                <div style={{ color: '#ccc', fontSize: '0.75rem', textTransform: 'uppercase' }}>About Us</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Schedule Appointment CTA bar ──────────────────────────────────────── */}
      <section style={{ background: '#ee0c0a', padding: '30px 0' }}>
        <div className="auto-container">
          <div className="row clearfix" style={{ alignItems: 'center' }}>
            <div className="col-lg-5 col-md-12" style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: '1.5rem' }}>
                {garageInfo.ctaTitle}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.9rem' }}>
                {garageInfo.ctaSubtitle}
              </p>
            </div>
            <div className="col-lg-4 col-md-6" style={{ marginBottom: '0.5rem' }}>
              <a href={`tel:${garageInfo.phoneTel}`}
                style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, textDecoration: 'none' }}>
                {garageInfo.phone}
              </a>
            </div>
            <div className="col-lg-3 col-md-6" style={{ textAlign: 'right' }}>
              <Link to="/contact"
                style={{
                  display: 'inline-block',
                  border: '2px solid #fff',
                  color: '#fff',
                  padding: '10px 24px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}>
                CONTACT US →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
