import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const DetailsProgram = () => {
    const { programID } = useParams(); 
    const location = useLocation();
    const userID = location.state?.userID || null;
    const [isApplied, setIsApplied] = useState(false);
    const [programDetails, setProgramDetails] = useState(null);
    const [universityHistory, setUniversityHistory] = useState([]);
    
    // Fetch program details and history of that university
    useEffect(() => {
        const fetchProgramDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/program/${programID}`);
                const data = await response.json();

                if (response.ok) {
                    setProgramDetails(data.program); // Set program details
                    setUniversityHistory(data.history); // Set university program history
                } else {
                    console.error('Failed to fetch program details');
                }
            } catch (error) {
                console.error('Error fetching program details:', error);
            }
        };

        fetchProgramDetails();
    }, [programID]);

    const applyToProgram = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: localStorage.getItem('token'), 
                },
                body: JSON.stringify({ userID, programID }),
            });

            const data = await response.json();
            console.log(userID);
            console.log("Apply Data: ", data);

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

    // Request info button functionality
    const requestInfo = () => {
        alert('Requesting more information about this program...');
    };

    // Waiver calculation button functionality
    const waiverCalculate = () => {
        alert('Calculating waiver for this program...');
    };

    if (!programDetails) {
        return <div>Loading...</div>; // Show loading if programDetails are not yet available
    }

    return (
        <div className="details-program">
            <h2>{programDetails.programName}</h2>
            <p><strong>Level:</strong> {programDetails.level}</p>
            <p><strong>Tuition Fee:</strong> {programDetails.tuitionFee}</p>
            <p><strong>Duration:</strong> {programDetails.duration}</p>
            <p><strong>Scholarship:</strong> {programDetails.availableScholarship}</p>
            <p><strong>Details:</strong> {programDetails.details}</p>

            {/* Buttons for Request Info and Waiver Calculate */}
            <button onClick={requestInfo} className="request-info-button">Request Info</button>
            <button onClick={waiverCalculate} className="waiver-calculate-button">Waiver Calculate</button>

             {/* Apply to Program Button */}
             <button onClick={(e) => { e.stopPropagation(); applyToProgram(); }} disabled={isApplied} className="apply-button">
                {isApplied ? '✔ Applied' : 'Apply Now'}
            </button>

            <h3>University Program History:</h3>
            <ul>
                {universityHistory.map((historyItem, index) => (
                    <li key={index}>{historyItem}</li> // Display history items (you can modify this based on your data)
                ))}
            </ul>
        </div>
    );
};

export default DetailsProgram;
