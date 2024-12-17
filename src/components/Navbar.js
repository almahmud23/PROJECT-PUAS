import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user ? user.role : null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log("UR",userRole);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleProfile = () => {
    if (user && user.role === 'Student') {
      navigate(`/student-profile/${user.id}`);
    } else {
      navigate('/unauthorized'); // Redirect to unauthorized page for non-Student roles
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/"><span>P</span>UAS</Link>
        </div>
        <button className="menu-button" onClick={toggleMenu}>
          ☰
        </button>
        <ul className={`navbar-list ${isMenuOpen ? 'open' : ''}`}>
          {/* Non-User Links */}
          {!user && (
            <>
              <li className="navbar-item">
                <Link to="/">Home</Link>
              </li>
              <li className="navbar-item">
                <Link to="/uni-card">University</Link>
              </li>
              <li className="navbar-item">
                <Link to="/posts">Posts</Link>
              </li>
              <li className="navbar-item">
                <Link to="/login">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register">Register</Link>
              </li>
            </>
          )}

          {/* Common Links for All Users */}
          {user && (
            <>
              <li className="navbar-item">
                <Link to="/">Home</Link>
              </li>
              <li className="navbar-item">
                <div className="dropdown">
                  {user.role === 'Student' && user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="profile-pic"
                    />
                  ) : (
                    <span>{user.name}</span>
                  )}
                  Profile
                  <ul className="submenu">
                    <li className="navbar-subitem">
                      <button className="user-profile" onClick={handleProfile}>
                        Your Profile
                      </button>
                    </li>
                    <li className="navbar-subitem">
                      <button className="logout-button" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            </>
          )}

          {/* Admin Links */}
          {userRole === 'Admin' && (
            <>
              <li className="navbar-item">
                <Link to="/admin-dashboard">Admin Dashboard</Link>
              </li>
              <li className="navbar-item">
                <div className="dropdown">
                  Manage University
                  <ul className="submenu">
                    <li className="navbar-subitem">
                      <Link to="/add-university">Add University</Link>
                    </li>
                    <li className="navbar-subitem">
                      <Link to="/see-university">See All Universities</Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="navbar-item">
                <div className="dropdown">
                  Manage Program
                  <ul className="submenu">
                    <li className="navbar-subitem">
                      <Link to="/add-program">Add Program</Link>
                    </li>
                    <li className="navbar-subitem">
                      <Link to="/see-program">See Program</Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="navbar-item">
                <Link to="/manage-offer">Manage Offer</Link>
              </li>
              <li className="navbar-item">
                <Link to="/see-user">See User</Link>
              </li>
              <li className="navbar-item">
                <Link to="/log-history">Log History</Link>
              </li>
              <li className="navbar-item">
                <div className="dropdown">
                  Manage Posts
                  <ul className="submenu">
                    <li className="navbar-subitem">
                      <Link to="/create-post">Create Post</Link>
                    </li>
                    <li className="navbar-subitem">
                      <Link to="/manage-post">Manage Post</Link>
                    </li>
                  </ul>
                </div>
              </li>
            </>
          )}

          {/* Staff Links */}
          {userRole === 'Staff' && (
            <>
              <li className="navbar-item">
                <Link to="/staff-dashboard">Staff Dashboard</Link>
              </li>
              <li className="navbar-item">
                <div className="dropdown">
                  Manage Requests
                  <ul className="submenu">
                    <li className="navbar-subitem">
                      <Link to="/manage-information">Information</Link>
                    </li>
                    <li className="navbar-subitem">
                      <Link to="/manage-application">Application</Link>
                    </li>
                    <li className="navbar-subitem">
                      <Link to="/manage-scholarship">Scholarship</Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="navbar-item">
                <div className="dropdown">
                  Manage Program
                  <ul className="submenu">
                    <li className="navbar-subitem">
                      <Link to="/add-program">Add Program</Link>
                    </li>
                    <li className="navbar-subitem">
                      <Link to="/see-program">See Program</Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="navbar-item">
                <div className="dropdown">
                  Manage Offer
                  <ul className="submenu">
                    <li className="navbar-subitem">
                      <Link to="/add-offer">Add Offer</Link>
                    </li>
                    <li className="navbar-subitem">
                      <Link to="/see-offer">See Offer</Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="navbar-item">
                <Link to="/setup">Setup</Link>
              </li>
              <li className="navbar-item">
                <Link to="/manage-post">Manage Post</Link>
              </li>
            </>
          )}

          {/* Student Links */}
          {userRole === 'Student' && (
            <>
              <li className="navbar-item">
                <Link to="/student-dashboard">Student Dashboard</Link>
              </li>
              <li className="navbar-item">
                <Link to="/programs">Programs</Link>
              </li>
              <li className="navbar-item">
                <Link to="/uni-card">University</Link>
              </li>
              <li className="navbar-item">
                <Link to="/offer">Offer</Link>
              </li>
              <li className="navbar-item">
                <Link to="/posts">Posts</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
