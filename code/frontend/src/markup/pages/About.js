import React from 'react';
import { Link } from 'react-router-dom';
import garageInfo from '../../config/garage';

const aboutImg1 = `${process.env.PUBLIC_URL}/assets/images/resource/image-1.jpg`;
const aboutImg2 = `${process.env.PUBLIC_URL}/assets/images/resource/image-2.jpg`;
const addSvcImg = `${process.env.PUBLIC_URL}/assets/images/resource/image-3.jpg`;
const tireBg    = `${process.env.PUBLIC_URL}/assets/images/background/bg-2.jpg`;
const pageTitle = `${process.env.PUBLIC_URL}/assets/images/background/bg-3.jpg`;

const WHY_ICONS = [
  'flaticon-mechanic',
  'flaticon-tools-and-utensils',
  'flaticon-price-tag',
  'flaticon-award',
];

function About() {
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
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,54,0.7)' }} />
        <div className="auto-container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>About Us</h1>
          <ul className="page-breadcrumb" style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ color: '#ee0c0a' }}>Home</Link></li>
            <li style={{ color: '#ccc' }}>&gt;</li>
            <li style={{ color: '#ccc' }}>About Us</li>
          </ul>
        </div>
      </section>

      {/* ── Intro text + image ─────────────────────────────────────────────── */}
      <section style={{ padding: '60px 0' }}>
        <div className="auto-container">
          <div className="row clearfix" style={{ alignItems: 'center' }}>
            <div className="col-lg-6 col-md-12">
              <div className="sec-title">
                <h2 style={{ color: '#0a1436', fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3 }}>
                  We are highly skilled mechanics<br />for your car repair
                </h2>
              </div>
              <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>
                {garageInfo.aboutIntro}
              </p>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                {garageInfo.whyUsText}
              </p>
            </div>
            <div className="col-lg-6 col-md-12">
              <img src={aboutImg1} alt="Workshop" style={{ width: '100%', borderRadius: '4px', objectFit: 'cover', maxHeight: '300px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 24 years experience block ─────────────────────────────────────────── */}
      <section style={{ padding: '20px 0 60px', background: '#f5f5f5' }}>
        <div className="auto-container">
          <div className="row clearfix" style={{ alignItems: 'center' }}>
            {/* Image collage with years badge */}
            <div className="col-lg-6 col-md-12" style={{ position: 'relative', marginBottom: '2rem' }}>
              <div className="row clearfix">
                <div className="col-6">
                  <img src={aboutImg1} alt="Workshop" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                </div>
                <div className="col-6">
                  <img src={aboutImg2} alt="Workshop" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="col-lg-6 col-md-12">
              <div className="sec-title">
                <h5 style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  Welcome to Our workshop
                </h5>
                <h2 style={{ color: '#0a1436', fontWeight: 700 }}>
                  We have <span style={{ color: '#ee0c0a' }}>professional</span> mechanics
                </h2>
                <div style={{ width: '36px', height: '3px', background: '#ee0c0a', margin: '0.75rem 0 1rem' }} />
              </div>
              <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>{garageInfo.aboutIntro}</p>
              <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1.5rem' }}>{garageInfo.whyUsText}</p>
              <Link to="/contact" className="theme-btn btn-style-one">About Us <span className="flaticon-next" /></Link>
            </div>
          </div>
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
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    border: '2px solid #ee0c0a', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '32px', height: '2px', background: '#ee0c0a' }} />
            <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{garageInfo.ctaSubtitle}</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>
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

export default About;
