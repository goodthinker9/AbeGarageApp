import React from 'react';

const serviceList = [
  { title: 'Oil Change', description: 'Full synthetic or conventional oil change with filter replacement.' },
  { title: 'Brake Service', description: 'Inspection, pad replacement, and rotor resurfacing or replacement.' },
  { title: 'Tire Rotation & Balancing', description: 'Extend tire life and improve handling.' },
  { title: 'Engine Diagnostics', description: 'Computer-based diagnostics to identify warning lights and issues.' },
  { title: 'Transmission Service', description: 'Fluid flush and filter replacement for smooth shifting.' },
  { title: 'Air Conditioning', description: 'Recharge, leak detection, and full A/C system repair.' },
];

function Services() {
  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Our Services</h2>
        </div>
        <div className="row clearfix">
          {serviceList.map((service) => (
            <div key={service.title} className="col-md-6 col-lg-4" style={{ marginBottom: '1.5rem' }}>
              <div className="card h-100 p-3">
                <h5>{service.title}</h5>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
