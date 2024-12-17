import React, { useEffect, useState } from 'react';
import UniversityForm from './UniversityForm';
//import './UniversityManagement.css';

const UniversityManagement = ({ role }) => {
    const [universities, setUniversities] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const r = role;
    const [sortOrder, setSortOrder] = useState({ key: 'universityName', direction: 'asc' });

    useEffect(() => {
        const fetchUniversities = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                return;
            }
            try {
                const response = await fetch('http://localhost:5000/api/auth/universities', {
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
                console.log('Universities fetched successfully:', data);
                setUniversities(data);
            } catch (error) {
                console.error('Failed to fetch universities:', error);
            }
        };

        fetchUniversities();
    }, []);

    const sortedUniversities = [...universities].sort((a, b) => {
        const order = sortOrder.direction === 'asc' ? 1 : -1;
        if (a[sortOrder.key] < b[sortOrder.key]) return -1 * order;
        if (a[sortOrder.key] > b[sortOrder.key]) return 1 * order;
        return 0;
    });

    const handleSort = (key) => {
        const direction = sortOrder.key === key && sortOrder.direction === 'asc' ? 'desc' : 'asc';
        setSortOrder({ key, direction });
    };

    const handleEdit = (universityID) => {
        const universityToEdit = universities.find(university => university.universityID === universityID);
        console.log('Editing University:', universityToEdit);
        setSelectedUniversity(universityToEdit);
    };

    const handleDelete = async (universityID) => {
        const token = localStorage.getItem('token');
        console.log('Deleting University ID:', universityID);
        if (!window.confirm('Are you sure you want to delete this university?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/auth/university/${universityID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setUniversities(universities.filter(university => university.universityID !== universityID));
                alert('University deleted successfully');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to delete the university'}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="university-management-container">
            <h2>University Management</h2>
            <div>
                {role === 'admin' && (
                    <UniversityForm
                        role={r}
                        universityData={selectedUniversity}
                        setUniversityData={setSelectedUniversity}
                    />
                )}
            </div>

            <div className="filter-sort-controls">
                <button onClick={() => handleSort('universityName')}>Sort by University Name</button>
                <button onClick={() => handleSort('location')}>Sort by Location</button>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>University ID</th>
                        <th>University Name</th>
                        <th>Location</th>
                        <th>Contact</th>
                        <th>Website</th>
                        <th>About</th>
                        {(r === 'Admin' || r === 'Staff') && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedUniversities.map((university) => (
                        <tr key={university.universityID}>
                            <td>{university.universityID}</td>
                            <td>{university.universityName}</td>
                            <td>{university.location}</td>
                            <td>{university.contact}</td>
                            <td><a href={university.website} target="_blank" rel="noopener noreferrer">Visit</a></td>
                            <td>{university.about}</td>
                            <td>
                                {console.log(r)}
                                {r === 'Admin' && (
                                    <>
                                        <button onClick={() => handleEdit(university.universityID)}>Edit</button>
                                        <button onClick={() => handleDelete(university.universityID)}>Delete</button>
                                    </>
                                ) || r === 'Staff' && (
                                    <button onClick={() => handleEdit(university.universityID)}>Edit</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UniversityManagement;
