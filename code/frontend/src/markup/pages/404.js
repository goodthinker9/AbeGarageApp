import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="contact-section">
      <div className="auto-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="theme-btn btn-style-one">
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
