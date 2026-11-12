import React from 'react';

function Contact() {
  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Contact Us</h2>
        </div>
        <div className="row clearfix">
          <div className="col-lg-6">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><strong>Phone:</strong> 1800 456 7890</li>
              <li><strong>Email:</strong> info@abegarage.com</li>
              <li><strong>Address:</strong> 123 Main Street, Anytown, USA</li>
              <li><strong>Hours:</strong> Monday – Saturday, 7:00 AM – 6:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
