import React, { useState } from 'react';

const WaiverForm = ({ programID, universityID, userID, baseFee, onClose }) => {
    const [sscGPA, setSscGPA] = useState('');
    const [hscGPA, setHscGPA] = useState('');
    const [expertise, setExpertise] = useState('');
    const [calculationResult, setCalculationResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/auth/waiver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID, programID, universityID, sscGPA, hscGPA, expertise }),
            });

            const data = await response.json();
            if (response.ok) {
                setCalculationResult(data);
            } else {
                alert('Error calculating waiver: ' + data.message);
            }
        } catch (error) {
            console.error('Error calculating waiver:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="waiver-form">
            <h3>Waiver Calculation</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>SSC GPA:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={sscGPA}
                        onChange={(e) => setSscGPA(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>HSC GPA:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={hscGPA}
                        onChange={(e) => setHscGPA(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Expertise:</label>
                    <select value={expertise} onChange={(e) => setExpertise(e.target.value)} required>
                        <option value="">Select Expertise</option>
                        <option value="National Player">National Player</option>
                        <option value="Special Ability">Special Ability</option>
                        <option value="Social Influencer">Social Influencer</option>
                        <option value="Tribal Species">Tribal Species</option>
                    </select>
                </div>
                <button type="submit">Calculate</button>
            </form>

            {calculationResult && (
                <div className="calculation-result">
                    <h4>Calculation Result:</h4>
                    <p>Base Fee: {baseFee}</p>
                    <p>Waiver Percentage: {calculationResult.percentage}%</p>
                    <p>Final Fee: {calculationResult.finalFee}</p>
                </div>
            )}
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default WaiverForm;
