import React from 'react';
import { Routes, Route } from 'react-router';

// Public pages
import Home            from './markup/pages/Home';
import Login           from './markup/pages/Login';
import About           from './markup/pages/About';
import Services        from './markup/pages/Services';
import Contact         from './markup/pages/Contact';
import Unauthorized    from './markup/pages/Unauthorized';
import NotFound        from './markup/pages/404';
import PublicOrderPage from './markup/pages/PublicOrderPage';

// Admin – shared
import AdminDashboard from './markup/pages/admin/AdminDashboard';

// Admin – employees
import AddEmployee  from './markup/pages/admin/AddEmployee';
import Employees    from './markup/pages/admin/Employees';
import EditEmployee from './markup/pages/admin/EditEmployee';

// Admin – orders
import Orders      from './markup/pages/admin/Orders';
import AddOrder    from './markup/pages/admin/AddOrder';
import OrderDetail from './markup/pages/admin/OrderDetail';
import EditOrder   from './markup/pages/admin/EditOrder';

// Admin – services
import AdminServices from './markup/pages/admin/AdminServices';
import AddService    from './markup/pages/admin/AddService';
import EditService   from './markup/pages/admin/EditService';

// Admin – customers & vehicles
import AdminCustomers from './markup/pages/admin/AdminCustomers';
import AddCustomer    from './markup/pages/admin/AddCustomer';
import EditCustomer   from './markup/pages/admin/EditCustomer';
import CustomerDetail from './markup/pages/admin/CustomerDetail';
import EditVehicle    from './markup/pages/admin/EditVehicle';

// Auth
import PrivateAuthRoute from './markup/components/Auth/PrivateAuthRoute';

// Layout
import Header from './markup/components/Header/Header';
import Footer from './markup/components/Footer/Footer';

// Styles
import './assets/template_assets/css/bootstrap.css';
import './assets/template_assets/css/style.css';
import './assets/template_assets/css/responsive.css';
import './assets/template_assets/css/color.css';
import './assets/styles/custom.css';

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Public */}
        <Route path="/"             element={<Home />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/about"        element={<About />} />
        <Route path="/services"     element={<Services />} />
        <Route path="/contact"      element={<Contact />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public order status page – no auth */}
        <Route path="/order/:hash"  element={<PublicOrderPage />} />

        {/* Admin dashboard – all logged-in staff */}
        <Route path="/admin" element={
          <PrivateAuthRoute roles={[1, 2, 3]}><AdminDashboard /></PrivateAuthRoute>
        } />

        {/* Admin – all employees (role 1,2,3) */}
        <Route path="/admin/orders" element={
          <PrivateAuthRoute roles={[1, 2, 3]}><Orders /></PrivateAuthRoute>
        } />
        <Route path="/admin/order/:id" element={
          <PrivateAuthRoute roles={[1, 2, 3]}><OrderDetail /></PrivateAuthRoute>
        } />

        {/* Admin – managers + admins (role 2,3) */}
        <Route path="/admin/add-order" element={
          <PrivateAuthRoute roles={[2, 3]}><AddOrder /></PrivateAuthRoute>
        } />
        <Route path="/admin/order/edit/:id" element={
          <PrivateAuthRoute roles={[2, 3]}><EditOrder /></PrivateAuthRoute>
        } />
        <Route path="/admin/customers" element={
          <PrivateAuthRoute roles={[2, 3]}><AdminCustomers /></PrivateAuthRoute>
        } />
        <Route path="/admin/add-customer" element={
          <PrivateAuthRoute roles={[2, 3]}><AddCustomer /></PrivateAuthRoute>
        } />
        <Route path="/admin/customer/edit/:id" element={
          <PrivateAuthRoute roles={[2, 3]}><EditCustomer /></PrivateAuthRoute>
        } />
        <Route path="/admin/customer/:id" element={
          <PrivateAuthRoute roles={[2, 3]}><CustomerDetail /></PrivateAuthRoute>
        } />
        <Route path="/admin/vehicle/edit/:id" element={
          <PrivateAuthRoute roles={[2, 3]}><EditVehicle /></PrivateAuthRoute>
        } />
        <Route path="/admin/services" element={
          <PrivateAuthRoute roles={[2, 3]}><AdminServices /></PrivateAuthRoute>
        } />
        <Route path="/admin/add-service" element={
          <PrivateAuthRoute roles={[2, 3]}><AddService /></PrivateAuthRoute>
        } />
        <Route path="/admin/service/edit/:id" element={
          <PrivateAuthRoute roles={[2, 3]}><EditService /></PrivateAuthRoute>
        } />

        {/* Admin – admins only (role 3) */}
        <Route path="/admin/employees" element={
          <PrivateAuthRoute roles={[3]}><Employees /></PrivateAuthRoute>
        } />
        <Route path="/admin/add-employee" element={
          <PrivateAuthRoute roles={[3]}><AddEmployee /></PrivateAuthRoute>
        } />
        <Route path="/admin/employee/edit/:id" element={
          <PrivateAuthRoute roles={[3]}><EditEmployee /></PrivateAuthRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
