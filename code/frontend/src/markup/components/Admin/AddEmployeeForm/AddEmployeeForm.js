import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../../../services/employee.service';
import { useAuth } from '../../../../Contexts/AuthContext';

function AddEmployeeForm() {
  const navigate = useNavigate();

  const [employee_email, setEmail] = useState('');
  const [employee_first_name, setFirstName] = useState('');
  const [employee_last_name, setLastName] = useState('');
  const [employee_phone, setPhoneNumber] = useState('');
  const [employee_password, setPassword] = useState('');
  const [active_employee] = useState(1);
  const [company_role_id, setCompanyRoleId] = useState(1);

  const [emailError, setEmailError] = useState('');
  const [firstNameRequired, setFirstNameRequired] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const { employee } = useAuth();
  const loggedInEmployeeToken = employee?.employee_token ?? '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!employee_first_name) {
      setFirstNameRequired('First name is required');
      valid = false;
    } else {
      setFirstNameRequired('');
    }

    // Email validation – missing "@" explicitly sets valid=false
    if (!employee_email) {
      setEmailError('Email is required');
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

    const formData = {
      employee_email,
      employee_first_name,
      employee_last_name,
      employee_phone,
      employee_password,
      active_employee,
      company_role_id,
    };

    try {
      const response = await employeeService.createEmployee(formData, loggedInEmployeeToken);
      const data = await response.json();
      if (data.error) {
        setServerError(data.error);
      } else {
        setSuccess(true);
        setServerError('');
        setTimeout(() => navigate('/admin/employees'), 2000);
      }
    } catch (err) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Add a new employee</h2>
        </div>
        <div className="row clearfix">
          <div className="form-column col-lg-7">
            <div className="inner-column">
              <div className="contact-form">
                {success && (
                  <div className="alert alert-success" role="alert">
                    Employee added successfully! Redirecting…
                  </div>
                )}
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
                        placeholder="Employee email"
                      />
                      {emailError && (
                        <div className="validation-error" role="alert">{emailError}</div>
                      )}
                    </div>
                    <div className="form-group col-md-12">
                      <input
                        type="text"
                        name="employee_first_name"
                        value={employee_first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Employee first name"
                      />
                      {firstNameRequired && (
                        <div className="validation-error" role="alert">{firstNameRequired}</div>
                      )}
                    </div>
                    <div className="form-group col-md-12">
                      <input
                        type="text"
                        name="employee_last_name"
                        value={employee_last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Employee last name"
                        required
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <input
                        type="text"
                        name="employee_phone"
                        value={employee_phone}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Employee phone (555-555-5555)"
                        required
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <select
                        name="employee_role"
                        value={company_role_id}
                        onChange={(e) => setCompanyRoleId(Number(e.target.value))}
                        className="custom-select-box"
                      >
                        <option value={1}>Employee</option>
                        <option value={2}>Manager</option>
                        <option value={3}>Admin</option>
                      </select>
                    </div>
                    <div className="form-group col-md-12">
                      <input
                        type="password"
                        name="employee_password"
                        value={employee_password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Employee password"
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
                        <span>Add employee</span>
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

export default AddEmployeeForm;
