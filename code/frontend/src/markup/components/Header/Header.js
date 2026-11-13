import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo     from '../../../assets/images/logo.png';
import iconBar  from '../../../assets/template_assets/images/icons/icon-bar.png';
import loginService from '../../../services/login.service';
import { useAuth }  from '../../../Contexts/AuthContext';
import garageInfo   from '../../../config/garage';

function Header() {
  const { isLogged, setIsLogged, employee } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const logOut = () => {
    loginService.logOut();
    setIsLogged(false);
    window.location.replace('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="main-header header-style-one">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="header-top">
        <div className="auto-container">
          <div className="inner-container">
            <div className="left-column">
              <div className="office-hour">{garageInfo.hours}</div>
            </div>
            <div className="right-column">
              {isLogged ? (
                <div className="phone-number">
                  <strong>Welcome, {employee?.employee_first_name}</strong>
                </div>
              ) : (
                <div className="phone-number">
                  Call us: <strong>{garageInfo.phone}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────────────────── */}
      <div className="header-upper">
        <div className="auto-container">
          <div className="inner-container">
            <div className="logo-box">
              <div className="logo">
                <Link to="/"><img src={logo} alt="Abe Garage" /></Link>
              </div>
            </div>
            <div className="right-column">
              <div className="nav-outer">
                <button
                  className="mobile-nav-toggler"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Toggle navigation"
                  aria-expanded={menuOpen}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <img src={iconBar} alt="menu" />
                </button>
                <nav className="main-menu navbar-expand-md navbar-light">
                  <div className="collapse navbar-collapse show clearfix">
                    <ul className="navigation">
                      <li><Link to="/">Home</Link></li>
                      <li><Link to="/about">About Us</Link></li>
                      <li><Link to="/services">Services</Link></li>
                      <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                  </div>
                </nav>
              </div>
              <div className="search-btn" />
              {isLogged ? (
                <div className="link-btn">
                  <button className="theme-btn btn-style-one blue" onClick={logOut} type="button">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="link-btn">
                  <Link to="/login" className="theme-btn btn-style-one">Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <div className="sticky-header">
        <div className="header-upper">
          <div className="auto-container">
            <div className="inner-container">
              <div className="logo-box">
                <div className="logo">
                  <Link to="/"><img src={logo} alt="Abe Garage" /></Link>
                </div>
              </div>
              <div className="right-column">
                <div className="nav-outer">
                  <nav className="main-menu navbar-expand-md navbar-light">
                    <div className="collapse navbar-collapse show clearfix">
                      <ul className="navigation">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/services">Services</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                      </ul>
                    </div>
                  </nav>
                </div>
                <div className="search-btn" />
                {isLogged ? (
                  <div className="link-btn">
                    <button className="theme-btn btn-style-one blue" onClick={logOut} type="button">
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="link-btn">
                    <Link to="/login" className="theme-btn btn-style-one">Login</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── React mobile menu ───────────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)', display: 'flex',
            flexDirection: 'column', padding: '2rem',
          }}
        >
          <button
            onClick={closeMenu}
            aria-label="Close navigation"
            style={{
              alignSelf: 'flex-end', background: 'none', border: 'none',
              color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: 1,
            }}
          >
            ×
          </button>
          <nav aria-label="Mobile navigation">
            <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0' }}>
              {[
                { to: '/',         label: 'Home'       },
                { to: '/about',    label: 'About Us'   },
                { to: '/services', label: 'Services'   },
                { to: '/contact',  label: 'Contact Us' },
              ].map(({ to, label }) => (
                <li key={to} style={{ marginBottom: '1.25rem' }}>
                  <Link to={to} onClick={closeMenu}
                    style={{ color: '#fff', fontSize: '1.25rem', textDecoration: 'none' }}>
                    {label}
                  </Link>
                </li>
              ))}

              {isLogged && (
                <>
                  <li style={{ borderTop: '1px solid #444', margin: '1rem 0', paddingTop: '1rem' }}>
                    <span style={{ color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      Admin
                    </span>
                  </li>
                  {[
                    { to: '/admin/orders',       label: 'Orders'       },
                    { to: '/admin/employees',    label: 'Employees'    },
                    { to: '/admin/add-employee', label: 'Add Employee' },
                    { to: '/admin/services',     label: 'Services'     },
                    { to: '/admin/customers',    label: 'Customers'    },
                  ].map(({ to, label }) => (
                    <li key={to} style={{ marginBottom: '1rem' }}>
                      <Link to={to} onClick={closeMenu}
                        style={{ color: '#ccc', fontSize: '1.1rem', textDecoration: 'none' }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li style={{ marginTop: '1.5rem' }}>
                    <button
                      onClick={() => { closeMenu(); logOut(); }}
                      style={{
                        background: 'none', border: '1px solid #ccc', color: '#ccc',
                        padding: '0.5rem 1.5rem', cursor: 'pointer', fontSize: '1rem',
                      }}
                      type="button"
                    >
                      Log out
                    </button>
                  </li>
                </>
              )}

              {!isLogged && (
                <li style={{ marginTop: '1.5rem' }}>
                  <Link to="/login" onClick={closeMenu}
                    style={{ color: '#fff', fontSize: '1.25rem', textDecoration: 'none' }}>
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      <div className="nav-overlay">
        <div className="cursor" />
        <div className="cursor-follower" />
      </div>
    </header>
  );
}

export default Header;
