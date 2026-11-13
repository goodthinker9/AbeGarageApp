import React from 'react';
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';

function Orders() {
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
                <h2>Orders</h2>
              </div>
              <p style={{ color: '#666' }}>
                Order management is coming in the next step. Check back soon.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Orders;
