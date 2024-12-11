import React, { useState } from 'react';
import zxcvbn from 'zxcvbn'; 
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams(); 
    const [formData, setFormData] = useState({
        password: '' 
    });
    const [showPassword, setShowPassword] = useState(false); 
    const [message, setMessage] = useState(''); 
    const navigate = useNavigate();

    // Handle password input change
    const handleChange = (e) => {
        const newPassword = e.target.value; 
        setFormData({
            ...formData,
            [e.target.name]: newPassword, 
        });

        // Check password strength
        const result = zxcvbn(newPassword);
        console.log(result); 
    };

    // Handle form submission for password reset
    const handleReset = async (e) => {
        e.preventDefault(); 

        // Password complexity validation
        const password = formData.password;
        const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Check if password meets requirements
        if (!passwordRequirements.test(password)) {
            alert('Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.');
            return; 
        }

        // Make API call to reset password
        try {
            const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }), 
            });

            const data = await response.json(); // Parse response data
            setMessage(data.message); 
            navigate('/login');
        } catch (error) {
            console.error('Error:', error); 
            setMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="reset-password-container">
            <h1>Reset Password</h1>
            <form className="reset-password-form" onSubmit={handleReset}>
                <div className="form-group">
                    <label>
                        New Password:
                        <input
                            type={showPassword ? 'text' : 'password'} // Toggle input type
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword} 
                            onChange={() => setShowPassword(!showPassword)} 
                        />
                        Show Password
                    </label>
                </div>
                <button className="submit-button" type="submit">Reset Password</button>
            </form>
            {message && <p className="message">{message}</p>} 
        </div>
    );
};

export default ResetPassword;
