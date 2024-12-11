import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import './Registration.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // default role
    inviteCode: '',  // Only needed for admin
    universityID: '' // Only needed for staff
  });
  const [universities, setUniversities] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch universities for staff registration
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/university');
        const data = await response.json();

        if (data && Array.isArray(data)) {
          setUniversities(data); // Ensure the data is in the correct format (array)
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
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'role') {
      setIsAdmin(value === 'admin');
      setIsStaff(value === 'staff');
    }

    if (name === 'password') {
      const result = zxcvbn(value);
      console.log(result);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password complexity validation
    const password = formData.password;
    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRequirements.test(password)) {
      alert('Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Registration successful');
        navigate('/login');
      } else {
        const errorText = await response.text();
        console.error('Registration failed:', errorText);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="registration-container">
      <h2>Register</h2>
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
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
        <div className="form-group">
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {isAdmin && (
          <div className="form-group">
            <label>Invite Code (For Admins Only):</label>
            <input
              type="text"
              name="inviteCode"
              value={formData.inviteCode}
              onChange={handleChange}
              required={isAdmin}
            />
          </div>
        )}

        {isStaff && (
          <div className="form-group">
            <label>University (For Staff Only):</label>
            <select
              name="universityID"
              value={formData.universityID}
              onChange={handleChange}
              required={isStaff}
            >
              <option value="">Select a University</option>
              {universities.length > 0 ? (
                universities.map((university) => (
                  <option key={university.universityID} value={university.universityID}>
                    {university.universityName}
                  </option>
                ))
              ) : (
                <option value="">No universities available</option>
              )}
            </select>
          </div>
        )}

        <button type="submit" className="submit-button">Register</button>
      </form>
    </div>
  );
};

export default Registration;
