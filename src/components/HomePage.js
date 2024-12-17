import React from 'react';
import Navbar from './Navbar';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <Navbar />
        <h1>Welcome to PUAS</h1>
        <p className="subheading">Your one-stop solution for academic success</p>
      </header>

      {/* Main Section */}
      <main className="home-main">
        {/* Introduction */}
        <section className="home-intro">
          <h2>About Us</h2>
          <p>
            PUAS is designed to connect students, universities, and administrators seamlessly. 
            Explore programs, apply to universities, calculate waivers, and discover scholarship opportunities with role-based access.
          </p>
        </section>

        {/* Features Section */}
        <section className="home-features">
          <h2>Key Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🎓 Explore Posts</h3>
              <p>Discover a wide range of university and programs related news and offer to your interests.</p>
            </div>
            <div className="feature-card">
              <h3>🏫 Apply to Universities</h3>
              <p>Submit applications to your dream universities effortlessly.</p>
            </div>
            <div className="feature-card">
              <h3>💰 Offers</h3>
              <p>Find and apply for scholarships and internship that match your needs.</p>
            </div>
          </div>
        </section>

        {/* Explore Cities */}
        <section className="explore-cities">
          <h2>Explore Cities</h2>
          <div className="city-grid">
            <div className="city-card">
              <h3>Dhaka</h3>
              <p>Top universities and career opportunities await in Dhaka.</p>
            </div>
            <div className="city-card">
              <h3>Chittagong</h3>
              <p>Explore top academic programs and vibrant city life.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2024 TeamAria. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
