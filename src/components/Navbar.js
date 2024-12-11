import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importing the auth context
import './Navbar.css'; // Import the CSS file for Navbar

const Navbar = () => {
  const { user, logout } = useAuth(); // Get the user object from AuthContext
  const userRole = user ? user.role : null; // Determine the user's role
  const navigate = useNavigate(); // For redirecting after logout

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from context
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {userRole === 'Admin' && (
          <>
            <li className="navbar-item">
              <Link to="/admin-dashboard">Admin Dashboard</Link>
            </li>
            <li className="navbar-item">
              <Link to="/log-history">Log History</Link>
            </li>
          </>
        )}
        {userRole === 'Staff' && (
          <>
          <li className="navbar-item">
            <Link to="/staff-dashboard">Staff Dashboard</Link>
          </li>
          <li className="navbar-item">
          <Link to="/admin-dashboard">Admin Dashboard</Link>
        </li>
        </>
        )}
        {userRole === 'student' && (
          <li className="navbar-item">
            <Link to="/student-dashboard">Student Dashboard</Link>
          </li>
        )}
        {!user && (
          <>
            <li className="navbar-item">
              <Link to="/">Home</Link>
            </li>
            <li className="navbar-item">
              <Link to="/login">Login</Link>
            </li>
            <li className="navbar-item">
              <Link to="/registration">Register</Link>
            </li>
          </>
        )}
        {user && (
          <>
            <li className="navbar-item">
              <Link to="/">Home</Link>
            </li>
            <li className="navbar-item">
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
