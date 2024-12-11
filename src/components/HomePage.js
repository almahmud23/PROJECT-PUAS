// components/HomePage.js
import React from 'react';
import Navbar from './Navbar';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to PUAS-Home</h1>
        <Navbar />
      </header>

      <main className="home-main">
        <section className="home-intro">
          <h2>About Us</h2>
          <p>
            Users (students, admins, and university staff) can register and log in securely. Role-based authentication ensures that users have access only to features relevant to their role. It includes password recovery for enhanced security.
          </p>
        </section>
        <section className="home-features">
          <h2>Features</h2>
          <div className="feature-cards">
            <div className="feature-card">
              <h3>Explore Programs</h3>
              <p>Discover a wide range of programs tailored for your academic interests.</p>
            </div>
            <div className="feature-card">
              <h3>Apply to Universities</h3>
              <p>Submit your applications effortlessly through our platform.</p>
            </div>
            <div className="feature-card">
              <h3>User Applying for Scholarship</h3>
              <p>Browse available scholarships and apply directly.</p>
            </div>
            <div className="feature-card">
              <h3>User Waiver Calculation</h3>
              <p>Users can calculate waivers on specific programs based on their SSC & HSC GPA.</p>
            </div>
          </div>
        </section>
        <section className="city">
          <h2>Explore City of Study</h2>
          <div className="feature-cards">
            <div className="feature-card">
              <h3>Dhaka</h3>
              <p>Discover a wide range of programs tailored for your academic interests.</p>
            </div>
            <div className="feature-card">
              <h3>Chittagong</h3>
              <p>Submit your applications effortlessly through our platform.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2024 TeamAria. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
