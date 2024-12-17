import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import ProgramCard from './ProgramCard';
import { fetchPrograms } from './helpers/fetchPrograms';
import UniversityCard from './UniversityCard';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [userRole, setUserRole] = useState(null);

  const userID = 1;

  // Fetch Role
  const fetchRole = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/user-role', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserRole(data);
      console.log("Role", data);
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  // Fetch programs and universities
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const loadPrograms = async () => {
      const fetchedPrograms = await fetchPrograms(token);
      setPrograms(fetchedPrograms);
    };

    const loadUniversities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/university', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };

    loadPrograms();
    loadUniversities();
  }, []);

  // Handle Search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const performSearch = () => {
    if (searchTerm.trim() === '') return;

    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const filteredPrograms = programs.filter((program) =>
      program.programName.toLowerCase().includes(lowercasedSearchTerm)
    );

    const filteredUniversities = universities.filter((university) =>
      university.universityName.toLowerCase().includes(lowercasedSearchTerm)
    );

    setFilteredResults([...filteredPrograms, ...filteredUniversities]);
  };

  // Trigger search on 'Enter'
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Navbar />
      </header>

      <div className="background-slide" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <h1>Welcome to Student Dashboard</h1>
        <input
          type="text"
          placeholder="Search for programs, universities..."
          className="search-bar"
          value={searchTerm}
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
        />
      </div>

      <main className="dashboard-main">
        <section className="dashboard-links">
          <Link to="/programs" className="link-card">
            Programs
          </Link>
          <Link to="/uni-card" className="link-card">
            Universities
          </Link>
          <Link to="/scholarships" className="link-card">
            Scholarships
          </Link>
          <Link to="/posts" className="link-card">
            Posts
          </Link>
        </section>

        {/* Timer Placeholder */}
        <section className="dashboard-timer">
          <h2>Stay Updated!</h2>
          <p>Your upcoming deadlines or tasks will appear here.</p>
        </section>

        <section className="search-results">
          <h2>Search Results</h2>
          {filteredResults.length > 0 ? (
            filteredResults.map((item, index) => (
              <div key={index} className="result-card">
                {item.programName ? (
                  <Link to={{
                    pathname: `/program-details/${item.programID}`,
                    state: { userID }
                  }}>
                    {item.programName}
                  </Link>
                ) : (
                  <Link to={{
                    pathname: `/university-details/${item.universityID}`,
                    state: { userID }
                  }}>
                    {item.universityName}
                  </Link>
                )}
              </div>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </section>


      </main>

      <footer className="dashboard-footer">
        <div className="logo" style={{ backgroundImage: "url('/logo.jpg')" }}></div>
        <p>&copy; 2024 Student Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;
