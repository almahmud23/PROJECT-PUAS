import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import LogHistory from "./LogHistory";
import UserManagement from "./UserManagement";
import ProgramManagement from "./ProgramManagement";

import './AdminDashboard.css';

function AdminDashboard() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [userRole, setUserRole] = useState(null);
    const [totalApplications, setTotalApplications] = useState(0);
    const [logHistory, setLogHistory] = useState([]);

    const fetchCounts = async () => {
        const token = localStorage.getItem('token');

        try {
            // Fetch user count
            const userResponse = await fetch('http://localhost:5000/api/auth/users/count', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
            });
            const userCount = await userResponse.json();
            setTotalUsers(userCount.total);

            // Fetch application count
            const appResponse = await fetch('http://localhost:5000/api/auth/applications/count', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
            });
            const applicationCount = await appResponse.json();
            setTotalApplications(applicationCount.total);

            // Fetch log history
            const logResponse = await fetch('http://localhost:5000/api/auth/loghistory', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
            });
            const logs = await logResponse.json();
            setLogHistory(logs);
            const response = await fetch('http://localhost:5000/api/auth/user-role', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUserRole(data);
            console.log("Role", data);
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    return (
        <div className="abody">
            <div className="admin-dashboard">
                <h1 className="dashboard-header">PUAS-Admin Dashboard</h1>
                <br />
                <Navbar />
                <br />

                <div className="dashboard-stats">
                    <div className="stat-card">
                        <p>Total Users</p>
                        <h3>{totalUsers}</h3>
                    </div>
                    <div className="stat-card">
                        <p>Total Applications</p>
                        <h3>{totalApplications}</h3>
                    </div>
                </div>

                <br />
                <div className="dashboard-content">
                    <ProgramManagement role={userRole}/>
                    <br />
                    <UserManagement />
                    <br />
                    <LogHistory logHistory={logHistory} />
                </div>

                <footer className="home-footer">
                    <p>&copy; 2024 PUAS-TeamAria. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}

export default AdminDashboard;
