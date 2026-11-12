import React from 'react';
import { Routes, Route } from 'react-router';

// Pages
import Home from './markup/pages/Home';
import Login from './markup/pages/Login';
import About from './markup/pages/About';
import Services from './markup/pages/Services';
import Contact from './markup/pages/Contact';
import Unauthorized from './markup/pages/Unauthorized';
import NotFound from './markup/pages/404';

// Admin pages
import AddEmployee from './markup/pages/admin/AddEmployee';
import Employees from './markup/pages/admin/Employees';
import Orders from './markup/pages/admin/Orders';
import Customers from './markup/pages/admin/Customers';

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
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin routes */}
        <Route
          path="/admin/orders"
          element={
            <PrivateAuthRoute roles={[1, 2, 3]}>
              <Orders />
            </PrivateAuthRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <PrivateAuthRoute roles={[2, 3]}>
              <Customers />
            </PrivateAuthRoute>
          }
        />
        {/* Employees list – admin only */}
        <Route
          path="/admin/employees"
          element={
            <PrivateAuthRoute roles={[3]}>
              <Employees />
            </PrivateAuthRoute>
          }
        />
        <Route
          path="/admin/add-employee"
          element={
            <PrivateAuthRoute roles={[3]}>
              <AddEmployee />
            </PrivateAuthRoute>
          }
        />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
