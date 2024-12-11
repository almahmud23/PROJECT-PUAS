import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Correct import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false); 
    }, []);



    const login = (token) => {
        localStorage.setItem('token', token); // Save the token in local storage
        const decoded = jwtDecode(token); 
        setUser(decoded); 
    };

    const logout = () => {
        localStorage.removeItem('token'); 
        setUser(null); 
    };
    
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => {
    return useContext(AuthContext);
};
