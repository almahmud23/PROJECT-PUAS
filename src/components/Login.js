import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assuming you are using context for managing auth state
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth(); // Assuming login function is used to set token in context/state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send the credentials to the backend
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // If login failed
            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            console.log('Response Data:', data);

            // Store JWT token in the browser's local storage
            localStorage.setItem('token', data.token);

            // Use login function to save the token in context/state (optional)
            login(data.token);

            // Role-based redirection after login
            if (data.user && data.user.role === 'Admin') {
                navigate('/admin-dashboard');  // Redirect to admin dashboard if role is admin
            } else if (data.user && data.user.role === 'Staff') {
                navigate('/staff-dashboard');  // Redirect to staff dashboard if role is staff
            } else {
                navigate('/student-dashboard');  // Regular users (students) go to home page
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert(error.message);
        }
    };

    return (
        <div className='body'>
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label>
                        <input className="form-group"
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        Show Password
                    </label>
                    <p>
                        Forgot your password? <Link to="/forgot-password">Reset it</Link>
                    </p>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
