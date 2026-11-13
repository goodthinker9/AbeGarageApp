import React from 'react';
import { Link } from 'react-router-dom';
import garageInfo from '../../../config/garage';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="upper-box">
        <div className="auto-container">
          <div className="row no-gutters">
            <div className="footer-info-box col-md-4 col-sm-6 col-xs-12">
              <div className="info-inner">
                <div className="content">
                  <div className="icon"><span className="flaticon-pin" /></div>
                  <div className="text">{garageInfo.address}</div>
                </div>
              </div>
            </div>
            <div className="footer-info-box col-md-4 col-sm-6 col-xs-12">
              <div className="info-inner">
                <div className="content">
                  <div className="icon"><span className="flaticon-email" /></div>
                  <div className="text">
                    Email us:<br />
                    <a href={`mailto:${garageInfo.email}`}>{garageInfo.email}</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-info-box col-md-4 col-sm-6 col-xs-12">
              <div className="info-inner">
                <div className="content">
                  <div className="icon"><span className="flaticon-phone" /></div>
                  <div className="text">
                    Call us on:<br />
                    <strong>{garageInfo.phone}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="widgets-section">
        <div className="auto-container">
          <div className="widgets-inner-container">
            <div className="row clearfix">

              {/* About blurb + hours */}
              <div className="footer-column col-lg-4">
                <div className="widget widget_about">
                  <div className="text" style={{ marginBottom: '0.75rem' }}>
                    {garageInfo.highlights.map((h) => (
                      <div key={h} style={{ marginBottom: '0.25rem' }}>• {h}</div>
                    ))}
                  </div>
                  <div className="text" style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {garageInfo.hours}
                  </div>
                </div>
              </div>

              {/* Navigation links */}
              <div className="footer-column col-lg-4">
                <div className="widget widget_links">
                  <h4 className="widget_title">Quick Links</h4>
                  <div className="widget-content">
                    <ul className="list">
                      <li><Link to="/">Home</Link></li>
                      <li><Link to="/about">About Us</Link></li>
                      <li><Link to="/services">Services</Link></li>
                      <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="footer-column col-lg-4">
                <div className="widget">
                  <h4 className="widget_title">Contact</h4>
                  <ul className="list" style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '0.4rem' }}>{garageInfo.address}</li>
                    <li style={{ marginBottom: '0.4rem' }}>
                      <a href={`tel:${garageInfo.phone}`}>{garageInfo.phone}</a>
                    </li>
                    <li>
                      <a href={`mailto:${garageInfo.email}`}>{garageInfo.email}</a>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="auto-container">
        <div className="footer-bottom">
          <div className="copyright-text">
            © {new Date().getFullYear()} <Link to="/">{garageInfo.name}</Link>. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
