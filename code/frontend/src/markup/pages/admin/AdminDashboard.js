import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../Contexts/AuthContext';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';

/**
 * Cards shown per role (1 = Employee, 2 = Manager, 3 = Admin).
 * comingSoon: true → renders a disabled card instead of a link.
 */
const CARDS = [
  { label: 'Orders',       to: '/admin/orders',       minRole: 1 },
  { label: 'Customers',    to: '/admin/customers',    minRole: 2 },
  { label: 'Add Customer', to: '/admin/add-customer', minRole: 2 },
  { label: 'Services',     to: '/admin/services',     minRole: 2 },
  { label: 'Add Service',  to: '/admin/add-service',  minRole: 2 },
  { label: 'Employees',    to: '/admin/employees',    minRole: 3 },
  { label: 'Add Employee', to: '/admin/add-employee', minRole: 3 },
];

const ROLE_NAMES = { 1: 'Employee', 2: 'Manager', 3: 'Admin' };

const cardBase = {
  display: 'block',
  borderRadius: '6px',
  padding: '1.5rem 1.25rem',
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '1rem',
  textDecoration: 'none',
  boxShadow: 'rgba(149,157,165,0.15) 0px 4px 12px',
};

function AdminDashboard() {
  const { employee } = useAuth();
  const role      = employee?.employee_role ?? 1;
  const firstName = employee?.employee_first_name ?? 'there';
  const roleName  = ROLE_NAMES[role] ?? 'Staff';

  const cards = CARDS.filter((c) => role >= c.minRole);

  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side">
          <AdminMenu />
        </div>
        <div className="col-md-9 admin-right-side">
          <section className="contact-section">
            <div className="auto-container">
              <div className="contact-title">
                <h2>Welcome, {firstName}</h2>
                <p style={{ color: '#666', marginTop: '-0.5rem' }}>
                  Logged in as <strong>{roleName}</strong>
                </p>
              </div>

              <div className="row clearfix">
                {cards.map(({ label, to, comingSoon }) => (
                  <div key={to} className="col-sm-6 col-md-4" style={{ marginBottom: '1.25rem' }}>
                    {comingSoon ? (
                      <div
                        style={{
                          ...cardBase,
                          background: '#f4f5f7',
                          border: '1px solid #dfe2ec',
                          color: '#999',
                          cursor: 'not-allowed',
                        }}
                        title="Coming soon"
                      >
                        {label}
                        <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.3rem', color: '#bbb' }}>
                          coming soon
                        </span>
                      </div>
                    ) : (
                      <Link
                        to={to}
                        style={{
                          ...cardBase,
                          background: '#fff',
                          border: '1px solid #dfe2ec',
                          color: '#222b48',
                          transition: 'box-shadow 0.2s, background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#222b48';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.color = '#222b48';
                        }}
                      >
                        {label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
