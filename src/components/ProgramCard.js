import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProgramCard.css';

const ProgramCard = ({ program, userID }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [universityName, setUniversityName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (program && program.universityID) {
            const fetchUniversityName = async () => {
                //console.log('Fetching university name for ID:', program.universityID);
                try {
                    const response = await fetch(`http://localhost:5000/api/auth/university/${program.universityID}`);
                    const data = await response.json();

                    if (response.ok && data.universityName) {
                        //console.log('Fetched university name:', data.universityName);
                        setUniversityName(data.universityName);
                    } else {
                        console.error('Failed to fetch university name:', data.message || 'Unknown error');
                    }
                } catch (error) {
                    console.error('Error fetching university name:', error);
                }
            };

            fetchUniversityName();
        }
    }, [program]);

    const saveToFavorites = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userID, programID: program.programID }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSaved((prev) => !prev);
                alert(data.message);
            } else {
                console.error('Error saving to favorites:', data.message);
                alert('Failed to update favorites. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const applyToProgram = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure authenticated requests
                },
                body: JSON.stringify({ userID, programID: program.programID }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsApplied(true);
                alert('Application submitted successfully!');
            } else {
                console.error('Error applying to program:', data.message);
                alert('Failed to submit application. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleCardClick = () => {
        navigate(`/program-details/${program.programID}`, {
            state: {
                userID: userID,
                universityID: program.universityID
            }
        });
    };

    const handleUniversityClick = () => {
        navigate(`/university-details/${program.universityID}`);
    };

    if (!program) {
        return null;
    }

    return (
        <div className="program-card">
            <h3 onClick={handleCardClick} style={{ cursor: 'pointer' }}>{program.programName}</h3>
            <h3 onClick={handleUniversityClick} style={{ cursor: 'pointer' }}>
                {universityName || 'Loading...'}
            </h3>
            <p>Level: {program.level}</p>
            <p>Tuition Fee: {program.tuitionFee}</p>
            <p>Duration: {program.duration}</p>
            <p>Scholarship: {program.availableScholarship ? 'Yes' : 'No'}</p>

            {/* Save to Favorites Button */}
            <button onClick={(e) => { e.stopPropagation(); saveToFavorites(); }} className={`save-button ${isSaved ? 'saved' : ''}`}>
                {isSaved ? '★ Saved to Favorites' : '☆ Save to Favorites'}
            </button>

            {/* Apply to Program Button */}
            <button onClick={(e) => { e.stopPropagation(); applyToProgram(); }} disabled={isApplied} className="apply-button">
                {isApplied ? '✔ Applied' : 'Apply Now'}
            </button>
        </div>
    );
};

export default ProgramCard;
