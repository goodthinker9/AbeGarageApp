import React from 'react';
import garageInfo from '../../config/garage';

function Contact() {
  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Contact Us</h2>
        </div>
        <div className="row clearfix">
          <div className="col-lg-6">
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2' }}>
              <li><strong>Phone:</strong> {garageInfo.phone}</li>
              <li>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${garageInfo.email}`}>{garageInfo.email}</a>
              </li>
              <li><strong>Address:</strong> {garageInfo.address}</li>
              <li><strong>Hours:</strong> {garageInfo.hours}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
