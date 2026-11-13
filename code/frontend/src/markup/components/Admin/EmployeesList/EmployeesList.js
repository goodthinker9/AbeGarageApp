import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../Contexts/AuthContext';
import { format } from 'date-fns';
import employeeService from '../../../../services/employee.service';

const EmployeesList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees]             = useState([]);
  const [apiError, setApiError]               = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState(null);

  const { employee } = useAuth();
  const token = employee ? employee.employee_token : null;

  useEffect(() => {
    employeeService
      .getAllEmployees(token)
      .then((res) => {
        if (!res.ok) {
          setApiError(true);
          if (res.status === 401) {
            localStorage.removeItem('employee');
            navigate('/login');
          } else if (res.status === 403) {
            setApiErrorMessage('You are not authorised to view this page.');
          } else {
            setApiErrorMessage('Please try again later.');
          }
          return res.json();
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.data && data.data.length > 0) {
          setEmployees(data.data);
        }
      })
      .catch(() => {
        setApiError(true);
        setApiErrorMessage('A network error occurred. Please try again.');
      });
  }, [token, navigate]);

  if (apiError) {
    return (
      <section className="contact-section">
        <div className="auto-container">
          <div className="contact-title">
            <h2>{apiErrorMessage || 'An error occurred.'}</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Employees</h2>
        </div>
        <div className="admin-table-wrapper">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Active</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Added Date</th>
                <th>Role</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.active_employee ? 'Yes' : 'No'}</td>
                  <td>{emp.employee_first_name}</td>
                  <td>{emp.employee_last_name}</td>
                  <td>{emp.employee_email}</td>
                  <td>{emp.employee_phone}</td>
                  <td>{format(new Date(emp.added_date), 'MM-dd-yyyy | HH:mm')}</td>
                  <td>{emp.company_role_name}</td>
                  <td>
                    <Link
                      to={`/admin/employee/edit/${emp.employee_id}`}
                      className="theme-btn btn-style-one"
                      style={{ fontSize: '0.8rem', padding: '3px 10px' }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default EmployeesList;
