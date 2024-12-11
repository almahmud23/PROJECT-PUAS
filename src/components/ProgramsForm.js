import React, { useState, useEffect } from 'react';

const ProgramsForm = ({ role, programData = {}, setProgramData }) => {
    const [universities, setUniversities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const levels = ['Undergraduate', 'Graduate'];
    console.log("Role=", role);

    // Fetch universities 
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/university');
                const data = await response.json();

                if (data && Array.isArray(data)) {
                    setUniversities(data);
                } else {
                    console.error('Invalid data structure:', data);
                }
            } catch (error) {
                console.error('Error fetching universities:', error);
            }
        };

        fetchUniversities();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProgramData({
            ...programData,
            [name]: type === 'checkbox' ? checked : value,  
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Program Data before submission:", programData);  
        const token = localStorage.getItem('token');
        setIsLoading(true);

        const url = programData?.programID
            ? `http://localhost:5000/api/auth/programs/${programData.programID}`
            : 'http://localhost:5000/api/auth/programs';

        const method = programData?.programID ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(programData),
            });

            setIsLoading(false);
            if (response.ok) {
                alert(programData?.programID ? 'Program updated successfully' : 'Program added successfully');
                setProgramData({
                    universityID: '',
                    programName: '',
                    level: '',
                    details: '',
                    department: '',
                    tuitionFee: '',
                    duration: '',
                    availableScholarship: false,
                });
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to save the program'}`);
            }
        } catch (error) {
            setIsLoading(false);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="programs-form">
            <h3>{programData?.programID ? 'Edit Program' : 'Add Program'}</h3>
            {role === 'Admin' && universities.length > 0 && (
                <div className="form-group">
                    <label>University:</label>
                    <select
                        name="universityID"
                        value={programData?.universityID || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select University</option>
                        {universities.map((university) => (
                            <option key={university.universityID} value={university.universityID}>
                                {university.universityName}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Common fields for program data */}
            <div className="form-group">
                <label>Program Name:</label>
                <input
                    type="text"
                    name="programName"
                    value={programData?.programName || ''}  
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Level:</label>
                <select
                    name="level"
                    value={programData?.level || ''}  
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Level</option>
                    {levels.map((level) => (
                        <option key={level} value={level}>
                            {level}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Details:</label>
                <textarea
                    name="details"
                    value={programData?.details || ''}  
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Department:</label>
                <input
                    type="text"
                    name="department"
                    value={programData?.department || ''}  
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Tuition Fee:</label>
                <input
                    type="number"
                    name="tuitionFee"
                    value={programData?.tuitionFee || ''} 
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Duration:</label>
                <input
                    type="text"
                    name="duration"
                    value={programData?.duration || ''}  
                    onChange={handleChange}
                    placeholder="e.g., 4 years"
                    required
                />
            </div>
            <div>
                <label>Available Scholarship:</label>
                <input
                    type="checkbox"
                    name="availableScholarship"
                    checked={programData?.availableScholarship || false}  
                    onChange={handleChange}
                />
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : programData?.programID ? 'Update Program' : 'Add Program'}
            </button>
        </form>
    );
};

export default ProgramsForm;
