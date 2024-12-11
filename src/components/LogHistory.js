import React, { useEffect, useState } from 'react';

const LogHistory = () => {
  const [logHistory, setLogHistory] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const fetchLogHistory = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/auth/loghistory', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching log history:', errorText);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log('Fetched Log History:', data); 
      setLogHistory(data); 
    } catch (error) {
      console.error('Error during fetch:', error);
      setError(error.message); 
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchLogHistory();
  }, []);

  return (
    <div className="log-history-container">
      <h2>Log History Page</h2>

      {loading ? (
        <p>Loading log history...</p> 
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p> 
      ) : (
        <>
          {logHistory.length === 0 ? (
            <p>No log history available.</p> 
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logHistory.map(log => (
                  <tr key={log.logID}>
                    <td>{log.logID}</td>
                    <td>{log.userID}</td>
                    <td>{log.email}</td>
                    <td>{log.action}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default LogHistory;
