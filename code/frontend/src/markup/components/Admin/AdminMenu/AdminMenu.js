import React from 'react';
import { Link } from 'react-router-dom';

function AdminMenu() {
  return (
    <div>
      <div className="admin-menu">
        <h2>Admin Menu</h2>
      </div>
      <div className="list-group">
        <Link to="/admin/orders"       className="list-group-item">Orders</Link>
        <Link to="/admin/add-employee" className="list-group-item">Add Employee</Link>
        <Link to="/admin/employees"    className="list-group-item">Employees</Link>
        <Link to="/admin/customers"    className="list-group-item">Customers</Link>
        <Link to="/admin/add-customer" className="list-group-item">Add Customer</Link>
        <Link to="/admin/services"     className="list-group-item">Services</Link>
        <Link to="/admin/add-service"  className="list-group-item">Add Service</Link>
      </div>
    </div>
  );
}

export default AdminMenu;
