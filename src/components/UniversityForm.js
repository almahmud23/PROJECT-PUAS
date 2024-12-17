import React, { useState, useEffect } from 'react';

const UniversityForm = ({ role, universityData = {}, setUniversityData }) => {
    const [isLoading, setIsLoading] = useState(false);
    console.log(role);

    useEffect(() => {
        if (universityData) {
            setUniversityData(universityData);
        }
    }, [universityData, setUniversityData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUniversityData({
            ...universityData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("University Data before submission:", universityData);
        const token = localStorage.getItem('token');
        setIsLoading(true);

        const url = universityData?.universityID
            ? `http://localhost:5000/api/auth/university/${universityData.universityID}`
            : 'http://localhost:5000/api/auth/university';

        const method = universityData?.universityID ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(universityData),
            });
            console.log(response);

            setIsLoading(false);
            if (response.ok) {
                alert(universityData?.universityID ? 'University updated successfully' : 'University added successfully');
                setUniversityData({
                    universityName: '',
                    location: '',
                    contact: '',
                    website: '',
                    about: '',
                    latitude: '',
                    longitude: '',
                });
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to save the university'}`);
            }
        } catch (error) {
            setIsLoading(false);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="university-form">
            <h3>{universityData?.universityID ? 'Edit University' : 'Add University'}</h3>

            <div className="form-group">
                <label htmlFor="universityName">University Name:</label>
                <input
                    type="text"
                    id="universityName"
                    name="universityName"
                    value={universityData?.universityName || ''}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={universityData?.location || ''}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="contact">Contact:</label>
                <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={universityData?.contact || ''}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="website">Website:</label>
                <input
                    type="url"
                    id="website"
                    name="website"
                    value={universityData?.website || ''}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="about">About:</label>
                <textarea
                    id="about"
                    name="about"
                    value={universityData?.about || ''}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="latitude">Latitude:</label>
                <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={universityData?.latitude || ''}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="longitude">Longitude:</label>
                <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={universityData?.longitude || ''}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : universityData?.universityID ? 'Update University' : 'Add University'}
            </button>
        </form>
    );
};

export default UniversityForm;
