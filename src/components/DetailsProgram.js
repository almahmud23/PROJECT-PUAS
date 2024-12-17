import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import WaiverForm from './WaiverForm';
import './DetailsProgram.css';
import Navbar from './Navbar';

const DetailsProgram = () => {
    const { programID } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { userID, universityID } = location.state || {};

    if (!userID) {
        console.log('Error: User ID is not available.')
    }

    const [isApplied, setIsApplied] = useState(false);
    const [programDetails, setProgramDetails] = useState(null);
    const [universityHistory, setUniversityHistory] = useState([]);
    const [universityName, setUniversityName] = useState('');
    const [showWaiverForm, setShowWaiverForm] = useState(false);
    const [baseFee, setBaseFee] = useState(null);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [message, setMessage] = useState('');
    const [requestStatus, setRequestStatus] = useState('');
    const [showApplyForm, setShowApplyForm] = useState(false); // State to show/hide the application form
    const [formData, setFormData] = useState({}); // State to store form data

    useEffect(() => {
        const fetchProgramDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/program/${programID}`);
                const data = await response.json();

                if (response.ok) {
                    setProgramDetails(data.program);
                    setUniversityHistory(data.history);
                    setBaseFee(data.program.tuitionFee);
                    setUniversityName(data.program.universityName);
                } else {
                    console.error('Failed to fetch program details:', data.message);
                }
            } catch (error) {
                console.error('Error fetching program details:', error);
            }
        };

        fetchProgramDetails();
    }, [programID, universityID]);

    const applyToProgram = async () => {
        if (!userID || !programID) {
            alert('User or program information is missing.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userID, programID, ...formData }), // Include form data in the request body
            });

            const data = await response.json();

            if (response.ok) {
                setIsApplied(true);
                setShowApplyForm(false); // Close the form modal
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

    const toggleWaiverForm = () => {
        if (!baseFee) {
            alert('Program fee details are missing.');
            return;
        }
        setShowWaiverForm((prev) => !prev);
    };

    const toggleRequestForm = () => setShowRequestForm((prev) => !prev);

    const handleRequestSubmit = async () => {
        if (!message.trim()) {
            alert('Please enter a valid message.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID, programID, rType: 'InfoRequest', message }),
            });

            const data = await response.json();

            if (response.ok) {
                setRequestStatus('Request submitted successfully!');
                setMessage('');
            } else {
                console.error('Error submitting request:', data.message);
                setRequestStatus('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            setRequestStatus('An error occurred. Please try again.');
        }
    };

    const handleHistoryItemClick = (historyItem) => {
        navigate(`/program-details/${historyItem.id}`, {
            state: {
                userID: userID,
                universityID: programDetails.universityID
            }
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        applyToProgram();
    };

    if (!programDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="details">
            <Navbar />
            <div className='details-program'>
                <h3>Program: <h2>{programDetails.programName}</h2> </h3>
                <h3>University: <h1>{universityName}</h1> </h3>
                <p><strong>Level:</strong> {programDetails.level}</p>
                <p><strong>Tuition Fee:</strong> {programDetails.tuitionFee}</p>
                <p><strong>Duration:</strong> {programDetails.duration}</p>
                <p><strong>Scholarship:</strong> {programDetails.availableScholarship}</p>
                <p><strong>Details:</strong> {programDetails.details}</p>

                <div className="button-group">
                    <button onClick={toggleWaiverForm} className="waiver-calculate-button">
                        {showWaiverForm ? 'Hide Waiver Form' : 'Calculate Waiver'}
                    </button>
                    <button onClick={() => setShowApplyForm(true)} disabled={isApplied} className="apply-button">
                        {isApplied ? '✔ Applied' : 'Apply Now'}
                    </button>
                    <button onClick={toggleRequestForm} className="request-info-button">
                        {showRequestForm ? 'Hide Request Form' : 'Request More Info'}
                    </button>
                </div>

                {showWaiverForm && (
                    <WaiverForm
                        userID={userID}
                        programID={programID}
                        universityID={universityID}
                        baseFee={baseFee}
                    />
                )}

                {showRequestForm && (
                    <div className="request-form">
                        <textarea
                            placeholder="Enter your request message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button onClick={handleRequestSubmit} className="submit-request-button">
                            Submit Request
                        </button>
                        {requestStatus && <p className="status-message">{requestStatus}</p>}
                    </div>
                )}

                <h3>University Program History:</h3>
                <ul className="history-list">
                    {universityHistory.map((historyItem, index) => (
                        <li key={index} onClick={() => handleHistoryItemClick(historyItem)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                            {historyItem.name}
                        </li>
                    ))}
                </ul>

                {showApplyForm && (
                    <div className="apply-form-modal">
                        <div className="apply-form-container">
                            <h2>Application Form</h2>
                            <form onSubmit={handleFormSubmit}>
                                <label>
                                    Full Name:
                                    <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleFormChange} required />
                                </label>
                                <label>
                                    Email:
                                    <input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} required />
                                </label>
                                <label>
                                    Phone Number:
                                    <input type="tel" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleFormChange} required />
                                </label>
                                <button type="submit" className="submit-application-button">Submit Application</button>
                                <button type="button" onClick={() => setShowApplyForm(false)} className="cancel-button">Cancel</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsProgram;
