import React, { useEffect, useState } from 'react';
import ProgramManagement from './ProgramManagement';
import Navbar from './Navbar';

const StaffDashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [applications, setApplications] = useState([]);

  // Fetch the user role (Admin or Staff)
  const fetchRole = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/user-role', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserRole(data);
      console.log("Role", data);
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  // Fetch student applications based on the role
  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/applications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("da: ", data);
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApplicationUpdate = async (applicationID, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Sending PATCH request to:', `http://localhost:5000/api/auth/applications/${applicationID}`);

      // Send the PATCH request with the token and status
      const response = await fetch(`http://localhost:5000/api/auth/applications/${applicationID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Application error:", errorData);
        throw new Error(`HTTP error! status: ${response.status}, ${errorData.message}`);
      }

      const data = await response.json();
      console.log("Application updated:", data);

      // Refetch updated applications
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  useEffect(() => {
    console.log("Call Role");
    fetchRole();
  }, []);

  useEffect(() => {
    console.log("Call Application");
    if (userRole) {
      fetchApplications();
    }
  }, [userRole]);

  return (
    <div>
      <h1 className="dashboard-header">PUAS-Staff Dashboard</h1>
      <br />
      <Navbar />
      <br />
      <p>Welcome, Staff! Here you can manage university programs and respond to student requests.</p>

      {/* Display the student applications for Staff */}
      <section>
        <h3>Student Applications</h3>

        {applications && applications.length > 0 ? (
          applications.map((application) => (
            <div key={application.applicationID}>
              <h4>{application.studentName}</h4>
              <p><strong>Program:</strong> {application.programName}</p>
              <p><strong>Status:</strong> {application.status}</p>
              <p><strong>Applied On:</strong> {application.applicationDate}</p>
              <button onClick={() => handleApplicationUpdate(application.applicationID, 'approved')}>Approve</button>
              <button onClick={() => handleApplicationUpdate(application.applicationID, 'rejected')}>Reject</button>
            </div>
          ))
        ) : (
          <p>No applications available.</p>
        )}
      </section>

      {/* Example Feature Components */}
      <section>
        <h3>Manage Programs</h3>
        <p>View, add, or edit programs for your university.</p>
        <ProgramManagement role={userRole} />
      </section>
    </div>
  );
};



export default StaffDashboard;
