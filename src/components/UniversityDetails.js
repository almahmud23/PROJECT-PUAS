import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const UniversityDetails = () => {
  const { universityID } = useParams();  // Get universityID from the URL params
  const [universityDetails, setUniversityDetails] = useState(null);

  useEffect(() => {
    // Fetch university details based on universityID
    const fetchUniversityDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/university/${universityID}`);
        const data = await response.json();
        
        if (response.ok) {
          setUniversityDetails(data);
        } else {
          console.error('Failed to fetch university details:', data.message);
        }
      } catch (error) {
        console.error('Error fetching university details:', error);
      }
    };

    fetchUniversityDetails();
  }, [universityID]);  // Re-fetch when universityID changes

  if (!universityDetails) return <div>Loading...</div>;

  return (
    <div>
      <h1>{universityDetails.universityName}</h1>
      <h3>About:-</h3>
      <p>{universityDetails.about}</p>
      {/* Render other university details here */}
    </div>
  );
};

export default UniversityDetails;
