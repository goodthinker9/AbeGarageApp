import React from 'react';

function About() {
  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>About Abe Garage</h2>
        </div>
        <div className="row clearfix">
          <div className="col-lg-8">
            <p>
              Abe Garage has been serving the community with honest, high-quality auto repair
              since the day we opened our doors. Our certified technicians handle everything
              from routine oil changes to complex engine diagnostics.
            </p>
            <p>
              We believe every customer deserves transparent pricing and repairs done right the
              first time. Stop by or call us at <strong>1800 456 7890</strong> — we look
              forward to keeping your vehicle on the road.
            </p>
            <p>
              <strong>Hours:</strong> Monday – Saturday, 7:00 AM – 6:00 PM
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
