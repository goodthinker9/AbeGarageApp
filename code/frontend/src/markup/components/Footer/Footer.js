import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import garageInfo from '../../../config/garage';
import serviceService from '../../../services/service.service';

function Footer() {
  const [footerServices, setFooterServices] = useState([]);

  useEffect(() => {
    serviceService.getActiveServices()
      .then((r) => r.json())
      .then((d) => { if (d.status === 'success') setFooterServices(d.data.slice(0, 5)); })
      .catch(() => {});
  }, []);

  const { social } = garageInfo;

  return (
    <footer className="main-footer">

      {/* ── Three contact info boxes ──────────────────────────────────────── */}
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
                    Email us :<br />
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
                    Call us on :<br />
                    <strong>+ {garageInfo.phone}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4-column widgets section ──────────────────────────────────────── */}
      <div className="widgets-section">
        <div className="auto-container">
          <div className="widgets-inner-container">
            <div className="row clearfix">

              {/* Col 1 – About blurb */}
              <div className="footer-column col-lg-3 col-md-6">
                <div className="widget widget_about">
                  <div className="text">{garageInfo.footerBlurb}</div>
                </div>
              </div>

              {/* Col 2 – Useful Links */}
              <div className="footer-column col-lg-3 col-md-6">
                <div className="widget widget_links">
                  <h4 className="widget_title">Usefull Links</h4>
                  <div className="widget-content">
                    <ul className="list">
                      <li><Link to="/">Home</Link></li>
                      <li><Link to="/about">About Us</Link></li>
                      <li><Link to="/contact">Appointment</Link></li>
                      <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Col 3 – Our Services (live from API) */}
              <div className="footer-column col-lg-3 col-md-6">
                <div className="widget widget_links">
                  <h4 className="widget_title">Our Services</h4>
                  <div className="widget-content">
                    <ul className="list">
                      {footerServices.length > 0
                        ? footerServices.map((s) => (
                            <li key={s.service_id}>
                              <Link to="/services">{s.service_name}</Link>
                            </li>
                          ))
                        : garageInfo.additionalServices.slice(0, 5).map((s) => (
                            <li key={s}><Link to="/services">{s}</Link></li>
                          ))
                      }
                    </ul>
                  </div>
                </div>
              </div>

              {/* Col 4 – Newsletter + social */}
              <div className="footer-column col-lg-3 col-md-6">
                <div className="widget widget_newsletter">
                  <h4 className="widget_title">Newsletter</h4>
                  <div className="text">Get latest updates and offers.</div>
                  <ul className="social-links">
                    {social.facebook && (
                      <li>
                        <a href={social.facebook} target="_blank" rel="noreferrer">
                          <span className="fab fa-facebook-f" />
                        </a>
                      </li>
                    )}
                    {social.linkedin && (
                      <li>
                        <a href={social.linkedin} target="_blank" rel="noreferrer">
                          <span className="fab fa-linkedin-in" />
                        </a>
                      </li>
                    )}
                    {social.twitter && (
                      <li>
                        <a href={social.twitter} target="_blank" rel="noreferrer">
                          <span className="fab fa-twitter" />
                        </a>
                      </li>
                    )}
                    {social.googlePlus && (
                      <li>
                        <a href={social.googlePlus} target="_blank" rel="noreferrer">
                          <span className="fab fa-google-plus-g" />
                        </a>
                      </li>
                    )}
                    {/* Show placeholder icons when no social URLs set */}
                    {!social.facebook && !social.linkedin && !social.twitter && !social.googlePlus && (
                      <>
                        <li><span className="social-placeholder fab fa-facebook-f" /></li>
                        <li><span className="social-placeholder fab fa-linkedin-in" /></li>
                        <li><span className="social-placeholder fab fa-twitter" /></li>
                        <li><span className="social-placeholder fab fa-google-plus-g" /></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Copyright ─────────────────────────────────────────────────────── */}
      <div className="auto-container">
        <div className="footer-bottom">
          <div className="copyright-text">
            © Copyright <Link to="/">{garageInfo.name}</Link> {new Date().getFullYear()}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
