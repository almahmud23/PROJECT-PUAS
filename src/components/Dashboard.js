import React, { useState, useEffect } from 'react';
import ProgramCard from './ProgramCard';
import Navbar from './Navbar';
import './Programs.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [filters, setFilters] = useState({
    universityName: '',
    department: '',
    level: '',
  });
  const userID = 1; // Replace with actual user ID

  useEffect(() => {
    const fetchPrograms = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/programs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          console.log('Fetched Programs:', data);
          setPrograms(data);
          setFilteredPrograms(data); // Initialize filtered programs
        } else {
          console.error('Failed to fetch programs:', data.message);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  useEffect(() => {
    let filtered = [...programs];
    console.log('Filtering with filters:', filters);

    if (filters.universityName) {
      filtered = filtered.filter(program => {
        console.log('Program:', program);
        if (!program.universityName) {
          console.error('Missing universityName in program:', program);
          return false;
        }
        console.log('Program University Name:', program.universityName);
        return program.universityName.toLowerCase().includes(filters.universityName.toLowerCase());
      });
    }
    if (filters.department) {
      filtered = filtered.filter(program => program.department && program.department.toLowerCase().includes(filters.department.toLowerCase()));
    }
    if (filters.level) {
      filtered = filtered.filter(program => program.level && program.level.toLowerCase().includes(filters.level.toLowerCase()));
    }

    console.log('Filtered Programs:', filtered);
    setFilteredPrograms(filtered);
  }, [filters, programs]);

  const handleSort = (option) => {
    let sortedPrograms = [...filteredPrograms];
    if (option === 'programName') {
      sortedPrograms.sort((a, b) => a.programName.localeCompare(b.programName));
    } else if (option === 'tuitionFee') {
      sortedPrograms.sort((a, b) => a.tuitionFee - b.tuitionFee);
    } else if (option === 'rating') {
      sortedPrograms.sort((a, b) => b.rating - a.rating);
    }
    setFilteredPrograms(sortedPrograms);
    setSortOption(option);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <Navbar />
      <section className="programs-page">
        <h2>Available Programs</h2>
        <div className="filters-sorters">
          <div className="filters">
            <input
              type="text"
              name="universityName"
              placeholder="Filter by University"
              value={filters.universityName}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="department"
              placeholder="Filter by Department"
              value={filters.department}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="level"
              placeholder="Filter by Level"
              value={filters.level}
              onChange={handleFilterChange}
            />
          </div>
          <div className="sorters">
            <button onClick={() => handleSort('programName')}>Sort by Program Name</button>
            <button onClick={() => handleSort('tuitionFee')}>Sort by Tuition Fee</button>
            <button onClick={() => handleSort('rating')}>Sort by Rating</button>
          </div>
        </div>
        <div className="program-cards">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program) => (
              <ProgramCard key={program.programID} program={program} userID={userID} />
            ))
          ) : (
            <p>No programs available. Please check back later.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Programs;
