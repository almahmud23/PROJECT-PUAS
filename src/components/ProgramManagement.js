import React, { useEffect, useState } from 'react';
import ProgramsForm from './ProgramsForm';
import './ProgramManagement.css';

const ProgramManagement = ({ role }) => {
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);  
    const r = role;
    const [sortOrder, setSortOrder] = useState({ key: 'programName', direction: 'asc' });
    const [filterCriteria, setFilterCriteria] = useState({ level: '', department: '' });

    useEffect(() => {
        const fetchPrograms = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                return;
            }
            try {
                const response = await fetch('http://localhost:5000/api/auth/programs', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Programs fetched successfully:', data);
                setPrograms(data);
            } catch (error) {
                console.error('Failed to fetch programs:', error);
            }
        };

        fetchPrograms();
    }, []);

    const filteredPrograms = programs
        .filter(program =>
            (filterCriteria.level === '' || program.level === filterCriteria.level) &&
            (filterCriteria.department === '' || program.department.includes(filterCriteria.department))
        )
        .sort((a, b) => {
            const order = sortOrder.direction === 'asc' ? 1 : -1;
            if (a[sortOrder.key] < b[sortOrder.key]) return -1 * order;
            if (a[sortOrder.key] > b[sortOrder.key]) return 1 * order;
            return 0;
        });

    const handleSort = (key) => {
        const direction = sortOrder.key === key && sortOrder.direction === 'asc' ? 'desc' : 'asc';
        setSortOrder({ key, direction });
    };

    const handleEdit = (programID) => {
        const programToEdit = programs.find(program => program.programID === programID);
        setSelectedProgram(programToEdit);  
    };

    const handleDelete = async (programID) => {
        const token = localStorage.getItem('token');
        if (!window.confirm('Are you sure you want to delete this program?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/auth/programs/${programID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setPrograms(programs.filter(program => program.programID !== programID));
                alert('Program deleted successfully');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to delete the program'}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="program-management-container">
            <h2>Program Management</h2>

            {/* Pass selectedProgram to ProgramsForm for editing */}
            <ProgramsForm role={r} programData={selectedProgram} setProgramData={setSelectedProgram} />

            <div className="filter-sort-controls">
                <label>
                    Filter by Level:
                    <select
                        onChange={(e) => setFilterCriteria({ ...filterCriteria, level: e.target.value })}
                        value={filterCriteria.level}
                    >
                        <option value="">All</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate">Graduate</option>
                    </select>
                </label>
                <label>
                    Filter by Department:
                    <input
                        type="text"
                        placeholder="Department"
                        onChange={(e) => setFilterCriteria({ ...filterCriteria, department: e.target.value })}
                    />
                </label>
                <button onClick={() => handleSort('programName')}>Sort by Program Name</button>
                <button onClick={() => handleSort('tuitionFee')}>Sort by Tuition Fee</button>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>Program ID</th>
                        <th>University ID</th>
                        <th>Program Name</th>
                        <th>Level</th>
                        <th>Details</th>
                        <th>Department</th>
                        <th>Tuition Fee</th>
                        <th>Duration</th>
                        <th>Available Scholarship</th>
                        {(role === 'Admin' || role === 'Staff') && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredPrograms.map((program) => (
                        <tr key={program.programID}>
                            <td>{program.programID}</td>
                            <td>{program.universityID}</td>
                            <td>{program.programName}</td>
                            <td>{program.level}</td>
                            <td>{program.details}</td>
                            <td>{program.department}</td>
                            <td>{program.tuitionFee}</td>
                            <td>{program.duration}</td>
                            <td>{program.availableScholarship ? 'Yes' : 'No'}</td>
                            {(role === 'Admin' || role === 'Staff') && (
                                <td>
                                    <button onClick={() => handleEdit(program.programID)}>Edit</button>
                                    <button onClick={() => handleDelete(program.programID)}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProgramManagement;
