import React, { useState, useEffect, useCallback } from 'react';
import { Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../Contexts/AuthContext';
import { format } from 'date-fns';
import employeeService from '../../../../services/employee.service';

const PAGE_SIZE = 10;

const EmployeesList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees]             = useState([]);
  const [total, setTotal]                     = useState(0);
  const [page, setPage]                       = useState(0);       // 0-based
  const [apiError, setApiError]               = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState(null);
  const [loading, setLoading]                 = useState(true);

  const { employee } = useAuth();
  const token = employee ? employee.employee_token : null;

  const load = useCallback(() => {
    setLoading(true);
    setApiError(false);
    employeeService
      .getAllEmployees(token, { limit: PAGE_SIZE, offset: page * PAGE_SIZE })
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
        if (data && data.data) {
          setEmployees(data.data);
          setTotal(data.total || 0);
        }
      })
      .catch(() => {
        setApiError(true);
        setApiErrorMessage('A network error occurred. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [token, page, navigate]);

  useEffect(() => { load(); }, [load]);

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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Employees</h2>
        </div>

        {loading && <p>Loading…</p>}

        {!loading && (
          <>
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
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center' }}>No employees found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
                <button
                  className="theme-btn btn-style-one"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{ padding: '4px 12px', opacity: page === 0 ? 0.5 : 1 }}
                  type="button"
                >
                  Previous
                </button>
                <span>Page {page + 1} of {totalPages}</span>
                <button
                  className="theme-btn btn-style-one"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  style={{ padding: '4px 12px', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default EmployeesList;
