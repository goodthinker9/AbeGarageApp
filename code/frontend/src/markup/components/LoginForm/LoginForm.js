import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import loginService from '../../../services/login.service';

function LoginForm() {
  const location = useLocation();

  const [employee_email, setEmail] = useState('');
  const [employee_password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    let valid = true;

    // Email validation – missing "@" explicitly sets valid=false
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

    // Password must be at least 6 characters
    if (!employee_password || employee_password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
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
          window.location.replace('/');
        } else {
          window.location.reload();
        }
      } else {
        setServerError(data.message);
      }
    } catch (err) {
      setServerError('An error has occurred. Please try again later.');
    }
  };

  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Login to your account</h2>
        </div>
        <div className="row clearfix">
          <div className="form-column col-lg-7">
            <div className="inner-column">
              <div className="contact-form">
                <form onSubmit={handleSubmit}>
                  <div className="row clearfix">
                    <div className="form-group col-md-12">
                      {serverError && (
                        <div className="validation-error" role="alert">{serverError}</div>
                      )}
                      <input
                        type="email"
                        name="employee_email"
                        value={employee_email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                      />
                      {emailError && (
                        <div className="validation-error" role="alert">{emailError}</div>
                      )}
                    </div>
                    <div className="form-group col-md-12">
                      <input
                        type="password"
                        name="employee_password"
                        value={employee_password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                      />
                      {passwordError && (
                        <div className="validation-error" role="alert">{passwordError}</div>
                      )}
                    </div>
                    <div className="form-group col-md-12">
                      <button
                        className="theme-btn btn-style-one"
                        type="submit"
                        data-loading-text="Please wait..."
                      >
                        <span>Login</span>
                      </button>
                    </div>
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
