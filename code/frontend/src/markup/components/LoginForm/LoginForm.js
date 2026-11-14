import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import loginService from '../../../services/login.service';

function LoginForm() {
  const location = useLocation();

  const [employee_email, setEmail]       = useState('');
  const [employee_password, setPassword] = useState('');
  const [emailError, setEmailError]      = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError]    = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    let valid = true;

    if (!employee_email) {
      setEmailError('Please enter your email address first');
      valid = false;
    } else if (!employee_email.includes('@')) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      const regex = /^\S+@\S+\.\S+$/;
      if (!regex.test(employee_email)) {
        setEmailError('Invalid email format');
        valid = false;
      } else {
        setEmailError('');
      }
    }

    if (!employee_password || employee_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;

    try {
      const response = await loginService.logIn({ employee_email, employee_password });
      const data = await response.json();

      if (data.status === 'success') {
        if (data.data.employee_token) {
          localStorage.setItem('employee', JSON.stringify(data.data));
        }
        if (location.pathname === '/login') {
          window.location.replace('/admin');
        } else {
          window.location.reload();
        }
      } else {
        setServerError(data.message);
      }
    } catch {
      setServerError('An error has occurred. Please try again later.');
    }
  };

  return (
    <section className="contact-section login-section">
      <div className="auto-container">
        <div className="sec-title">
          <h2>Login to your account <span className="decor" /></h2>
        </div>

        <div className="row clearfix">
          <div className="form-column col-lg-6 col-md-8 col-sm-12">
            <div className="inner-column">
              <div className="contact-form">
                <form onSubmit={handleSubmit}>
                  {serverError && (
                    <div className="validation-error" role="alert" style={{ float: 'none', display: 'block', marginBottom: '1rem' }}>
                      {serverError}
                    </div>
                  )}
                  <div className="form-group">
                    <input
                      type="email"
                      name="employee_email"
                      value={employee_email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                    />
                    {emailError && <div className="validation-error" role="alert">{emailError}</div>}
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      name="employee_password"
                      value={employee_password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                    />
                    {passwordError && <div className="validation-error" role="alert">{passwordError}</div>}
                  </div>
                  <div className="form-group">
                    <button
                      className="theme-btn btn-style-one"
                      type="submit"
                    >
                      <span>Login</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginForm;
