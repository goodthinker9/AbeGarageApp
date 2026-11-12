import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';
import loginService from '../../../services/login.service';
import { useAuth } from '../../../Contexts/AuthContext';

function Header() {
  const { isLogged, setIsLogged, employee } = useAuth();

  const logOut = () => {
    loginService.logOut();
    setIsLogged(false);
    // Hard-reload to clear any in-memory auth state
    window.location.replace('/');
  };

  return (
    <header className="main-header header-style-one">
      {/* Top bar */}
      <div className="header-top">
        <div className="auto-container">
          <div className="inner-container">
            <div className="left-column">
              <div className="text">Enjoy the Beso while we fix your car</div>
              <div className="office-hour">Monday – Saturday 7:00AM – 6:00PM</div>
            </div>
            <div className="right-column">
              {isLogged ? (
                <div className="phone-number">
                  <strong>Welcome, {employee?.employee_first_name}</strong>
                </div>
              ) : (
                <div className="phone-number">
                  Schedule Appointment: <strong>1800 456 7890</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="header-upper">
        <div className="auto-container">
          <div className="inner-container">
            <div className="logo-box">
              <div className="logo">
                <Link to="/"><img src={logo} alt="Abe Garage logo" /></Link>
              </div>
            </div>
            <div className="right-column">
              <div className="nav-outer">
                <div className="mobile-nav-toggler">
                  <img src="assets/images/icons/icon-bar.png" alt="menu" />
                </div>
                <nav className="main-menu navbar-expand-md navbar-light">
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent">
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
                  <button
                    className="theme-btn btn-style-one blue"
                    onClick={logOut}
                    type="button"
                  >
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

      {/* Sticky header – mirrors the main header, respects logged-in state */}
      <div className="sticky-header">
        <div className="header-upper">
          <div className="auto-container">
            <div className="inner-container">
              <div className="logo-box">
                <div className="logo">
                  <Link to="/"><img src={logo} alt="Abe Garage logo" /></Link>
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
                    <button
                      className="theme-btn btn-style-one blue"
                      onClick={logOut}
                      type="button"
                    >
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

      {/* Mobile menu */}
      <div className="mobile-menu">
        <div className="menu-backdrop" />
        <div className="close-btn"><span className="icon flaticon-remove" /></div>
        <nav className="menu-box">
          <div className="nav-logo">
            <Link to="/"><img src={logo} alt="Abe Garage logo" /></Link>
          </div>
          <div className="menu-outer" />
        </nav>
      </div>

      <div className="nav-overlay">
        <div className="cursor" />
        <div className="cursor-follower" />
      </div>
    </header>
  );
}

export default Header;
