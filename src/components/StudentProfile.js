import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar'; // Ensure the Navbar component is correctly imported
import './StudentProfile.css'; // Import the CSS file

const StudentProfile = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPic, setIsEditingPic] = useState(false);
  const [profile, setProfile] = useState({
    nickname: '',
    profilePic: '',
    bio: '',
    university: '',
    college: '',
    school: '',
    address: '',
    contact: '',
    interestedDepartments: [], // Initialize as an array
    website: ''
  });
  const [user, setUser] = useState({ email: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userResponse = await fetch(`http://localhost:5000/api/auth/users/${id}`);
        const profileResponse = await fetch(`http://localhost:5000/api/auth/user-profile/${id}`);

        const userData = await userResponse.json();
        const profileData = await profileResponse.json();

        if (userResponse.ok && profileResponse.ok) {
          setUser(userData);
          setProfile((prev) => ({
            ...prev,
            ...profileData,
            nickname: profileData.nickname || userData.email,
            interestedDepartments: profileData.interestedDepartments || []
          }));
        } else {
          alert('Failed to fetch profile details.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('An error occurred. Please try again.');
      }
    };
    fetchProfile();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value || '', // Ensure value is always a string
    }));
  };

  const handleInterestedDepartmentChange = (index, value) => {
    const updatedDepartments = [...profile.interestedDepartments];
    updatedDepartments[index] = value || ''; // Ensure value is always a string
    setProfile((prev) => ({
      ...prev,
      interestedDepartments: updatedDepartments,
    }));
  };

  const handleAddMore = () => {
    setProfile((prev) => ({
      ...prev,
      interestedDepartments: [...prev.interestedDepartments, '']
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profilePic', file);

    fetch(`http://localhost:5000/api/auth/upload-profile-pic/${id}`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProfile((prev) => ({
            ...prev,
            profilePic: data.url, // Use the URL from the server response
          }));
          setIsEditingPic(false);
        } else {
          alert('Failed to upload profile picture.');
        }
      })
      .catch(error => {
        console.error('Error uploading profile picture:', error);
        alert('An error occurred. Please try again.');
      });
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/user-profile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        alert('Error updating profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="student-profile">
        <div className="profile-header">
          <h2>{`Profile of ${profile.nickname}`}</h2>
          <p>{`${user.email}`}</p>
        </div>
        <div className="profile-section">
          {isEditing ? (
            <>
              <label>Nickname</label>
              <input type="text" name="nickname" value={profile.nickname || ''} onChange={handleInputChange} />
              <label>Bio</label>
              <textarea name="bio" value={profile.bio || ''} onChange={handleInputChange}></textarea>
              <h3>Education Background</h3>
              <label>University</label>
              <input type="text" name="university" value={profile.university || ''} onChange={handleInputChange} />
              <label>College (HSC)</label>
              <input type="text" name="college" value={profile.college || ''} onChange={handleInputChange} />
              <label>School (SSC)</label>
              <input type="text" name="school" value={profile.school || ''} onChange={handleInputChange} />
              <label>Address</label>
              <input type="text" name="address" value={profile.address || ''} onChange={handleInputChange} />
              <label>Contact</label>
              <input type="text" name="contact" value={profile.contact || ''} onChange={handleInputChange} />
              <label>Interested Departments</label>
              {profile.interestedDepartments.map((department, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={department || ''}
                    onChange={(e) => handleInterestedDepartmentChange(index, e.target.value)}
                  />
                </div>
              ))}
              <button onClick={handleAddMore}>Add More</button>
              <label>Website/LinkedIn</label>
              <input type="text" name="website" value={profile.website || ''} onChange={handleInputChange} />
              <button onClick={handleSaveProfile}>Save Profile</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <div className="profile-main">
                <div className="profile-picture">
                  {profile.profilePic && <img src={`http://localhost:5000/${profile.profilePic}`} alt="Profile-1" className="profile-pic" />}
                  <button onClick={() => setIsEditingPic(true)} className="edit-button">Edit Picture</button>
                  {isEditingPic && (
                    <>
                      <input type="file" accept="image/*" onChange={handleProfilePicChange} />
                      <button onClick={() => setIsEditingPic(false)}>Cancel</button>
                    </>
                  )}
                </div>
                <div className="profile-details">
                  <p className="nickname">{profile.nickname}</p>
                  <p>{profile.bio}</p>
                </div>
              </div>
              <div className="profile-divider"></div>
              <div className="profile-education">
                <h3>Education Background</h3>
                <p><strong>University:</strong> {profile.university || 'N/A'}</p>
                <p><strong>College (HSC):</strong> {profile.college || 'N/A'}</p>
                <p><strong>School (SSC):</strong> {profile.school || 'N/A'}</p>
              </div>
              <div className="profile-personal-info">
                <h3>Personal Information</h3>
                <p><strong>Address:</strong> {profile.address || ''}</p>
                <p><strong>Email:</strong> { `${user.email} `|| ''}</p>
                <p><strong>Contact:</strong> {profile.contact || ''}</p>
                <p><strong>Interested Departments:</strong></p>
                {profile.interestedDepartments.map((department, index) => (
                  <p key={index}>{department}</p>
                ))}
                <p><strong>Website/LinkedIn:</strong> {profile.website || 'N/A'}</p>
              </div>
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
