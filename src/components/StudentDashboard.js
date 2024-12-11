// components/StudentDashboard.js
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import ProgramCard from './ProgramCard';
import { fetchPrograms } from './helpers/fetchPrograms';
import './Dashboard.css';

const StudentDashboard = () => {
  const [programs, setPrograms] = useState([]);
  const userID = 1;

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

    loadPrograms();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Navbar />
        <h1>Student Dashboard</h1>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-programs">
          <h2>Available Programs</h2>
          <div className="program-cards">
            {programs.length > 0 ? (
              programs.map((program) => (
                <ProgramCard key={program.programID} program={program} userID={userID} />
              ))
            ) : (
              <p>No programs available. Please check back later.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
