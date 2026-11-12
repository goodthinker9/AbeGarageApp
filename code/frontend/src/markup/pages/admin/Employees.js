import React from 'react';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import EmployeesList from '../../components/Admin/EmployeesList/EmployeesList';

/**
 * /admin/employees — protected by PrivateAuthRoute roles={[3]} in App.js.
 * No duplicate auth logic lives here.
 */
function Employees() {
  return (
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side">
          <AdminMenu />
        </div>
        <div className="col-md-9 admin-right-side">
          <EmployeesList />
        </div>
      </div>
    </div>
  );
}

export default Employees;
