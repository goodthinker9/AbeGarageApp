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
              <div className="footer-column col-lg-4">
                <div className="widget widget_about">
                  <div className="text">
                    Quality auto repair you can trust. Honest pricing, certified technicians,
                    and repairs done right the first time.
                  </div>
                </div>
              </div>

              <div className="footer-column col-lg-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="widget widget_links">
                      <h4 className="widget_title">Useful Links</h4>
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
                  <div className="col-md-6">
                    <div className="widget widget_links">
                      <h4 className="widget_title">Our Services</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li><Link to="/services">Performance Upgrade</Link></li>
                          <li><Link to="/services">Transmission Service</Link></li>
                          <li><Link to="/services">Brake Repair &amp; Service</Link></li>
                          <li><Link to="/services">Engine Service &amp; Repair</Link></li>
                          <li><Link to="/services">Tyres &amp; Wheels</Link></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="footer-column col-lg-4">
                <div className="widget widget_newsletter">
                  <h4 className="widget_title">Follow Us</h4>
                  <div className="text">Stay connected for offers and updates.</div>
                  <ul className="social-links">
                    {/* Real social links – update hrefs when accounts exist */}
                    <li>
                      <a href="https://facebook.com" target="_blank" rel="noreferrer">
                        <span className="fab fa-facebook-f" />
                      </a>
                    </li>
                    <li>
                      <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                        <span className="fab fa-linkedin-in" />
                      </a>
                    </li>
                    <li>
                      <a href="https://twitter.com" target="_blank" rel="noreferrer">
                        <span className="fab fa-twitter" />
                      </a>
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
            © {new Date().getFullYear()} <Link to="/">Abe Garage</Link>. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
