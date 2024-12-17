import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UniversityCard.css';
import Navbar from './Navbar';

const UniversityCard = ({ role }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [universities, setUniversities] = useState([]);
    const [filterByLocation, setFilterByLocation] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Fetch user's current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => console.error('Error fetching user location:', error),
            { enableHighAccuracy: true }
        );
    }, []);

    // Fetch universities and calculate distances
    useEffect(() => {
        if (!userLocation) return;

        const fetchUniversities = async () => {
            const token = localStorage.getItem('token'); // Get token from local storage
            if (!token) {
                console.error('No token found');
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:5000/api/auth/universities?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setUniversities(data);
                    console.log("Uni Fetch", data);
                } else {
                    console.error('Error fetching universities:', data.message);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchUniversities();
    }, [userLocation]);

    // Filter and search universities
    const filteredUniversities = universities
        .filter((university) => university.location.toLowerCase().includes(filterByLocation.toLowerCase()))
        .filter((university) => university.universityName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Calculate distance manually (optional)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (degree) => degree * (Math.PI / 180);
        const R = 6371; // Radius of the Earth in km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    // Navigate to university details page
    const handleCardClick = (universityID) => {
        navigate(`/university-details/${universityID}`);
    };

    return (
        <div className="university-list">
            <Navbar />
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Filter by city"
                    value={filterByLocation}
                    onChange={(e) => setFilterByLocation(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Search by university name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredUniversities.map((university) => (
                <div
                    key={university.universityID}
                    className="university-card"
                >
                    <h3 onClick={() => handleCardClick(university.universityID)}>{university.universityName}</h3>
                    <p>Location: {university.location}</p>
                    <p>Contact: {university.contact}</p>
                    <p>
                        Website:{' '}
                        <a href={university.website} target="_blank" rel="noopener noreferrer">
                            Visit
                        </a>
                    </p>
                    {userLocation && university.latitude && university.longitude && (
                        <button onClick={() => {
                            const distance = calculateDistance(userLocation.latitude, userLocation.longitude, university.latitude, university.longitude);
                            alert(`Distance: ${distance.toFixed(2)} km`);
                        }}>
                            Show Distance
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default UniversityCard;
