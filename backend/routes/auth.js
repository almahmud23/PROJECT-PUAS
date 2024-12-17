const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const router = express.Router();


// Registration endpoint
router.post('/register', (req, res) => {
    const { name, email, password, role, inviteCode, universityID } = req.body;
    console.log(role);
    console.log(req.body);


    if (!name || !email || !password || !role) {
        return res.status(400).send('All fields are required');
    }

    // Check invite code for admin role
    if (role === 'admin') {
        const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE;
        if (!inviteCode || inviteCode !== ADMIN_INVITE_CODE) {
            return res.status(403).send('Invalid invite code for Admin registration');
        }
    }

    // Check that universityID is provided if the role is 'staff'
    if (role === 'staff' && !universityID) {
        return res.status(400).send('University ID is required for Staff registration');
    }

    // Password complexity validation
    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRequirements.test(password)) {
        return res.status(400).send('Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = role === 'staff'
        ? 'INSERT INTO users (name, email, password, role, universityID) VALUES (?, ?, ?, ?, ?)'
        : 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';

    const queryParams = role === 'staff'
        ? [name, email, hashedPassword, role, universityID]
        : [name, email, hashedPassword, role];

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error registering user');
        }
        res.status(201).send('User registered');
    });
});

// Login endpoint
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            console.log('Login failed for user:', email);
            db.query(
                'INSERT INTO loghistory (userId, email, action) VALUES (NULL, ?, ?)',
                [email, 'login_failed'],
                (err) => {
                    if (err) console.error('Error logging failed login:', err);
                }
            );
            return res.status(401).send('Invalid email or password');
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            console.log('Login failed for user:', email);
            db.query(
                'INSERT INTO loghistory (userId, email, action) VALUES (?, ?, ?)',
                [user.userID, email, 'login_failed'],
                (err) => {
                    if (err) console.error('Error logging failed login:', err);
                }
            );
            return res.status(401).send('Invalid email or password');
        }

        console.log('Login success for user:', email);
        db.query(
            'INSERT INTO loghistory (userId, email, action) VALUES (?, ?, ?)',
            [user.userID, email, 'login_success'],
            (err) => {
                if (err) console.error('Error logging successful login:', err);
            }
        );

        // Generate a JWT token
        const payload = {
            id: user.userID,
            role: user.role,
            email: user.email
        };

        // Include universityID only for Staff
        if (user.role === 'Staff') {
            payload.universityID = user.universityID; // Ensure `user.universityID` is defined
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 });
        console.log('User Role:', user.role, 'University ID:', user.universityID || 'N/A');


        // Send back the token and user information
        res.status(200).send({
            auth: true,
            token,
            user: {
                id: user.userID,
                name: user.name,
                email: user.email,
                role: user.role,
                universityID: user.universityID, // Include universityID
            },
        });

    });
});

// Endpoint to fetch users count (Admin)
router.get('/users/count', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM users', (error, results) => {
        if (error) {
            console.error('Error counting users:', error);
            return res.status(500).json({ message: 'Error retrieving user count' });
        }
        res.status(200).json({ total: results[0].total });
    });
});

// Endpoint to fetch applications count (Admin)
router.get('/applications/count', (req, res) => {
    db.query('SELECT COUNT(*) AS total FROM applications', (error, results) => {
        if (error) {
            console.error('Error counting applications:', error);
            return res.status(500).json({ message: 'Error retrieving application count' });
        }
        res.status(200).json({ total: results[0].total });
    });
});

// Route to fetch login history (Admin)
router.get('/loghistory', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }

        // Only allow admin role to access log history
        if (decoded.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Fetch log history from database
        db.query("SELECT * FROM loghistory ORDER BY timestamp DESC", (err, results) => {
            if (err) {
                console.error("Error executing query:", err.sqlMessage);
                res.status(500).json({ message: "Error retrieving log history", error: err });
            } else {
                res.status(200).json(results);
            }
        });

    });
});

// Reset Password endpoint
router.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    console.log("Reset");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        db.query('UPDATE users SET password = ? WHERE userID = ?', [hashedPassword, decoded.id], (error) => {
            if (error) {
                return res.status(500).json({ message: 'Error updating password' });
            }
            res.status(200).json({ message: 'Password has been reset successfully.' });
        });
    });
});

require('dotenv').config();
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,  // Email app password
    },
});

// Forgot Password endpoint
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const user = results[0];

        // Generate a password reset token for 1hour
        const resetToken = jwt.sign({ id: user.userID }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(resetToken);

        // Create the password reset link
        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
        console.log(`Password reset link: ${resetLink}`);

        // Set up automatic email options
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Password Reset',
            text: `Click here to reset your password: ${resetLink}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Password reset link sent successfully.' });
        });
    });
});

// Endpoint to fetch all users data (Admin)
router.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error retrieving users' });
        }
        res.status(200).json(results);
    });
});


// Endpoint to fetch all users role
router.get('/user-role', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, 'mahmud'); // Replace with your actual secret key
        const email = decoded.email;

        db.query('SELECT role FROM users WHERE email = ?', [email], (error, results) => {
            if (error) {
                console.error('Error fetching user role:', error);
                return res.status(500).json({ message: 'Error fetching user role' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userRole = results[0].role;
            res.status(200).json(userRole);
        });
    } catch (err) {
        console.error('Token validation error:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
});


// Endpoint to fetch all universities data
router.get('/university', (req, res) => {
    db.query('SELECT * FROM university', (error, results) => {
        if (error) {
            console.error('Error retrieving universities:', error);
            return res.status(500).json({ message: 'Error retrieving universities' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to fetch all universities details
router.get('/university/:id', (req, res) => {
    const universityID = req.params.id;

    db.query('SELECT * FROM university WHERE universityID = ?', [universityID], (error, results) => {
        if (error) {
            console.error('Error retrieving university:', error);
            return res.status(500).json({ message: 'Error retrieving university' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'University not found' });
        }

        res.status(200).json(results[0]);  // Send the first result (the university)
    });
});

// Get universities for staff or all universities for admins
router.get('/universities', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token
    console.log('Token received:', token);


    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            const errorMessage = err.name === 'TokenExpiredError'
                ? 'Token has expired'
                : 'Failed to authenticate token';
            return res.status(401).json({ message: errorMessage });
        }

        const { role, universityID } = decoded;

        if (!role) {
            return res.status(400).json({ message: 'User role missing in token' });
        }

        const query = role === 'Staff'
            ? 'SELECT * FROM university WHERE universityID = ?'
            : 'SELECT * FROM university';

        const params = role === 'Staff' ? [universityID] : [];

        db.query(query, params, (error, results) => {
            if (error) {
                console.error('Database Query Error:', error);
                return res.status(500).json({ message: 'Error fetching universities' });
            }
            res.status(200).json(results || []);
        });
    });
});


// Endpoint to fetch all program data including university names
router.get('/programs', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token

    console.log("hhh", token);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT Error:', err);
            const errorMessage = err.name === 'TokenExpiredError'
                ? 'Token has expired'
                : 'Failed to authenticate token';
            return res.status(401).json({ message: errorMessage });
        }

        const { role, universityID } = decoded;
        console.log('Decoded Token Data:', decoded);

        const query = role === 'Staff'
            ? `SELECT p.*, u.universityName
               FROM programs p
               JOIN university u ON p.universityID = u.universityID
               WHERE p.universityID = ?`
            : `SELECT p.*, u.universityName
               FROM programs p
               JOIN university u ON p.universityID = u.universityID`;

        const params = role === 'Staff' ? [universityID] : [];

        db.query(query, params, (error, results) => {
            if (error) {
                console.error('Database Query Error:', error); // Log DB error
                return res.status(500).json({ message: 'Error fetching programs' });
            }
            res.json(results);
        });
    });
});



// Endpoint to fetch applications for staff or all universities applications for admins
router.get('/applications', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }

        const { role, universityID } = decoded;
        let query = '';
        let params = [];

        // If the user is a staff member, filter applications by program's universityID
        if (role === 'Staff') {
            query = `
                SELECT applications.*, users.name AS studentName, users.universityID, programs.programName
                FROM applications
                JOIN users ON applications.userID = users.userID
                JOIN programs ON applications.programID = programs.programID
                WHERE programs.universityID = ?`;
            params = [universityID];
        } else {
            // For admin or other roles, fetch all applications
            query = 'SELECT * FROM applications';
        }

        db.query(query, params, (error, results) => {
            if (error) {
                console.error('Database Query Error:', error);
                return res.status(500).json({ message: 'Error fetching applications' });
            }
            res.json(results);
        });
    });
});

// Endpoint to fetch all program details
router.get('/program/:programID', (req, res) => {
    const { programID } = req.params;

    const query = `
        SELECT p.*, u.universityName
        FROM programs p
        JOIN university u ON p.universityID = u.universityID
        WHERE p.programID = ?
    `;

    db.query(query, [programID], (error, programResults) => {
        if (error) {
            return res.status(500).json({ message: 'Error retrieving program details' });
        }

        if (programResults.length === 0) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Fetch history for the university
        const universityID = programResults[0].universityID;
        db.query(
            'SELECT programID, programName FROM programs WHERE universityID = ?',
            [universityID],
            (historyError, historyResults) => {
                if (historyError) {
                    return res.status(500).json({ message: 'Error retrieving program history' });
                }
                res.status(200).json({
                    program: programResults[0],
                    history: historyResults.map((program) => ({
                        id: program.programID,
                        name: program.programName
                    })) // Return an object with id and name
                });
            }
        );
        
    });
});


// Endpoint to add a new university
router.post('/university', (req, res) => {
    const { universityName, location, contact, about, website } = req.body;

    if (!universityName || !location || !contact) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    const query = 'INSERT INTO university (universityName, location, contact, about, website) VALUES (?, ?, ?, ?, ?)';
    const values = [universityName, location, contact, about || '', website || ''];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error('Error adding university:', error);
            return res.status(500).json({ message: 'Error adding university' });
        }
        res.status(201).json({ message: 'University added successfully', universityID: results.insertId });
    });
});

// Endpoint to update a university
router.put('/university/:id', (req, res) => {
    const universityID = req.params.id;
    console.log(universityID);
    const { universityName, location, contact, about, website } = req.body;

    const query = `UPDATE university SET universityName = ?, location = ?, contact = ?, about = ?, website = ? WHERE universityID = ?`;
    const values = [universityName, location, contact, about || '', website || '', universityID];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error('Error updating university:', error);
            return res.status(500).json({ message: 'Error updating university' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'University not found' });
        }

        res.status(200).json({ message: 'University updated successfully' });
    });
});

// Endpoint to delete a university
router.delete('/university/:id', (req, res) => {
    const universityID = req.params.id;

    const query = 'DELETE FROM university WHERE universityID = ?';

    db.query(query, [universityID], (error, results) => {
        if (error) {
            console.error('Error deleting university:', error);
            return res.status(500).json({ message: 'Error deleting university' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'University not found' });
        }

        res.status(200).json({ message: 'University deleted successfully' });
    });
});


// Function to get distances using Google Maps Distance Matrix API
const getDistances = async (userLocation, universities) => {
    const apiKey = 'AIzaSyCD3NL_didGH88eXLhSvTdsHn4I0ABU28Q';
    const origins = `${userLocation.latitude},${userLocation.longitude}`;
    const destinations = universities
        .map((uni) => `${uni.latitude},${uni.longitude}`)
        .join('|');

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            console.log('Google Maps API Data:', data);

            return universities.map((university, index) => {
                const element = data.rows[0].elements[index];

                return {
                    ...university,
                    distance: element?.distance?.value / 1000 || null, // Distance in km
                    duration: element?.duration?.text || 'Unknown',
                };
            });
        } else {
            console.error('Google Maps API Error:', data.error_message);
            return universities.map((uni) => ({ ...uni, distance: null, duration: null }));
        }
    } catch (error) {
        console.error('Error fetching distances:', error);
        return universities.map((uni) => ({ ...uni, distance: null, duration: null }));
    }
};

//get university
router.get('/universitieses', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract Bearer token if present
    console.log("Token received:", token);

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
            console.log("Decoded user:", decoded);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
    }

    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'User location (latitude and longitude) is required.' });
    }

    const query = 'SELECT * FROM university'; // Ensure your database includes latitude & longitude
    db.query(query, async (error, results) => {
        if (error) {
            console.error('Database Error:', error);
            return res.status(500).json({ message: 'Database query error.' });
        }

        const userLocation = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        const universitiesWithDistances = await getDistances(userLocation, results);

        // Sort by proximity
        universitiesWithDistances.sort((a, b) => a.distance - b.distance);
        res.status(200).json(universitiesWithDistances);
    });
});


// Endpoint to delete all program data
router.delete('/programs/:programID', (req, res) => {
    const { programID } = req.params;
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Extract the token from the 'Bearer <token>' format
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    console.log('Extracted Token:', token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }

        const { role, universityID } = decoded;

        if (role === 'Staff') {
            db.query(
                'SELECT * FROM programs WHERE programID = ? AND universityID = ?',
                [programID, universityID],
                (error, results) => {
                    if (error) {
                        return res.status(500).json({ message: 'Database error during validation' });
                    }

                    if (results.length === 0) {
                        return res.status(403).json({ message: 'Unauthorized to delete this program' });
                    }

                    db.query('DELETE FROM programs WHERE programID = ?', [programID], (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Failed to delete program' });
                        }
                        res.status(200).json({ message: 'Program deleted successfully' });
                    });
                }
            );
        } else if (role === 'Admin') {
            db.query('DELETE FROM programs WHERE programID = ?', [programID], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to delete program' });
                }
                res.status(200).json({ message: 'Program deleted successfully' });
            });
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    });
});

// Endpoint to add all program data
router.post('/programs', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }

        const { role, universityID: staffUniversityID } = decoded;


        const { programName, department, level, duration, tuitionFee, availableScholarship, universityID } = req.body;
        const finalUniversityID = role === 'Admin' ? universityID : staffUniversityID;

        // Log request data
        console.log('Request body:', req.body);

        if (!finalUniversityID) {
            return res.status(400).json({ message: 'University ID is required' });
        }
        console.log(level);


        if (!programName || !department || !level || !duration || !tuitionFee || availableScholarship === 'undefined') {
            return res.status(400).json({ message: 'All fields are required' });
        }


        const query = `
            INSERT INTO programs (universityID, programName, department, level, duration, tuitionFee, availableScholarship)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [finalUniversityID, programName, department, level, duration, tuitionFee, availableScholarship],
            (error, results) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).json({ message: 'Database error', error });
                }
                res.status(201).json({ message: 'Program added successfully', programID: results.insertId });
            }
        );
    });
});

// Endpoint to edit all program data
router.put('/programs/:programID', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }

        const { role, universityID: staffUniversityID } = decoded;
        const { programID } = req.params;
        const { programName, department, level, details, duration, tuitionFee, availableScholarship, universityID } = req.body;

        // Log request data
        console.log('Request body:', req.body);

        // Assign the correct universityID
        const finalUniversityID = role === 'Admin' ? universityID : staffUniversityID;
        console.log(finalUniversityID);

        if (!finalUniversityID) {
            return res.status(400).json({ message: 'University ID is required' });
        }
        if (!programID || !universityID || !programName || !level || !department || !tuitionFee || !duration) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            UPDATE programs
            SET universityID = ?, programName = ?, department = ?, level = ?,details=?, duration = ?, tuitionFee = ?, availableScholarship = ?
            WHERE programID = ?
        `;

        db.query(
            query,
            [finalUniversityID, programName, department, level, details, duration, tuitionFee, availableScholarship, programID],
            (error, results) => {
                if (error) {
                    return res.status(500).json({ message: 'Database error', error });
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Program not found' });
                }

                res.status(200).json({ message: 'Program updated successfully' });
            }
        );
    });
});

// Save program to favorites
router.post('/favorites', (req, res) => {
    const { userID, programID } = req.body;

    db.query(
        'INSERT INTO favourite (userID, programID, createdAt) VALUES (?, ?, NOW())',
        [userID, programID],
        (error, results) => {
            if (error) {
                console.error('Error saving favorite:', error);
                return res.status(500).json({ message: 'Error saving favorite' });
            }
            res.status(200).json({ message: 'Program saved to favorites' });
        }
    );
});

// Apply for a program
router.post('/applications', (req, res) => {
    const { userID, programID } = req.body;

    db.query(
        'INSERT INTO applications (userID, programID, applicationDate, status) VALUES (?, ?, NOW(), "pending")',
        [userID, programID],
        (error, results) => {
            if (error) {
                console.error('Error applying for program:', error);
                return res.status(500).json({ message: 'Error applying for program' });
            }
            res.status(200).json({ message: 'Application submitted successfully' });
        }
    );
});

//favorite
router.post('/favorites', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }

        const { userID } = decoded;

        const { programID } = req.body;
        if (!programID) {
            return res.status(400).json({ message: 'Program ID is required' });
        }

        db.query('SELECT 1 FROM users WHERE userID = ?', [userID], (userErr, userResults) => {
            if (userErr) {
                console.error('Error checking user:', userErr);
                return res.status(500).json({ message: 'Error verifying user' });
            }
            if (userResults.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            db.query('SELECT 1 FROM programs WHERE programID = ?', [programID], (programErr, programResults) => {
                if (programErr) {
                    console.error('Error checking program:', programErr);
                    return res.status(500).json({ message: 'Error verifying program' });
                }
                if (programResults.length === 0) {
                    return res.status(404).json({ message: 'Program not found' });
                }

                db.query(
                    'INSERT INTO favourite (userID, programID, createdAt) VALUES (?, ?, NOW())',
                    [userID, programID],
                    (error, results) => {
                        if (error) {
                            console.error('Error saving favorite:', error);
                            return res.status(500).json({ message: 'Error saving favorite' });
                        }
                        res.status(200).json({ message: 'Program saved to favorites' });
                    }
                );
            });
        });
    });
});

//applications check
router.patch('/applications/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Status Send: ", status);

    // Validate input status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }
    console.log("Updating application ID:", id);

    try {
        // Query to get student email, name, and program name
        db.query(
            `SELECT users.email AS studentEmail, users.name AS studentName, programs.programName
             FROM applications
             JOIN users ON applications.userID = users.userID
             JOIN programs ON applications.programID = programs.programID
             WHERE applications.applicationID = ?`, [id],
            (err, result) => {
                if (err) {
                    console.error("Query Error:", err);
                    return res.status(500).json({ message: "Internal server error-1" });
                }

                console.log("Result:", result);

                if (!result || result.length === 0) {
                    return res.status(404).json({ message: "Application not found" });
                }

                const { studentEmail, studentName, programName } = result[0];

                db.query(
                    'UPDATE applications SET status = ? WHERE applicationID = ?',
                    [status, id]
                );

                console.log("Email Args:", studentEmail, studentName, programName, status);
                sendStatusEmail(studentEmail, studentName, programName, status);
                res.status(200).json({ message: 'Application status updated successfully' });
            }
        );
    } catch (error) {
        console.error('Error in query or transaction setup:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});




// Endpoint to save waiver calculation
router.post('/waiver', (req, res) => {
    const { userID, programID, universityID, sscGPA, hscGPA, expertise } = req.body;

    console.log("wc", req.body);

    if (!userID || !programID || !universityID || !sscGPA || !hscGPA || !expertise) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Calculate percentage and final fee based on baseFee and inputs
    const baseFeeQuery = 'SELECT tuitionFee FROM programs WHERE programID = ?';
    db.query(baseFeeQuery, [programID], (err, results) => {
        if (err || results.length === 0) {
            console.error('Error fetching base fee:', err);
            return res.status(500).json({ message: 'Error fetching base fee' });
        }

        const baseFee = results[0].tuitionFee;
        let percentage = 0;

        // Example waiver logic
        if (sscGPA >= 4.5 && hscGPA >= 4.5) percentage += 20;
        if (expertise === 'National Player') percentage += 30;
        else if (expertise === 'Special Ability') percentage += 20;
        else if (expertise === 'Social Influencer') percentage += 15;
        else if (expertise === 'Tribal Species') percentage += 25;

        const finalFee = baseFee * ((100 - percentage) / 100);

        // Insert into waivercalculations table
        const insertQuery = `
            INSERT INTO waivercalculations 
            (userID, programID, universityID, sscGPA, hscGPA, expertise, baseFee, percentage, finalFee, calculatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const values = [userID, programID, universityID, sscGPA, hscGPA, expertise, baseFee, percentage, finalFee];

        db.query(insertQuery, values, (error, results) => {
            if (error) {
                console.error('Error saving waiver calculation:', error);
                return res.status(500).json({ message: 'Error saving waiver calculation' });
            }
            res.status(201).json({
                message: 'Waiver calculation saved successfully',
                calculationID: results.insertId,
                percentage,
                finalFee,
            });
        });
    });
});

// Endpoint to retrieve waiver calculations for a program
router.get('/waiver/:programID', (req, res) => {
    const { programID } = req.params;

    const query = `
        SELECT wc.*, u.name AS userName
        FROM waivercalculations wc
        JOIN users u ON wc.userID = u.userID
        WHERE wc.programID = ?
    `;
    db.query(query, [programID], (err, results) => {
        if (err) {
            console.error('Error fetching waiver calculations:', err);
            return res.status(500).json({ message: 'Error fetching waiver calculations' });
        }

        res.status(200).json(results);
    });
});

// Endpoint to send request
router.post('/request', (req, res) => {
    const { userID, programID, rType, message } = req.body;


    if (!userID || !programID || !rType || !message) {
        console.log("req-body: ", req.body);
        return res.status(400).json({ message: 'All fields are required' });
    }

    const status = 'pending';
    db.query(
        'INSERT INTO userRequests (programID, userID, rType, message, status, requestDate) VALUES (?, ?, ?, ?, ?, NOW())',
        [programID, userID, rType, message, status],
        (error, results) => {
            if (error) {
                console.error('Error submitting request:', error);
                return res.status(500).json({ message: 'Error submitting request' });
            }
            res.status(200).json({ message: 'Request submitted successfully' });
        }
    );
});



// Endpoint to fetch a specific user data by ID
router.get('/users/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM users WHERE userID = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error retrieving user' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(results[0]);
    });
});


//Fetch User Profile
router.get('/user-profile/:id', (req, res) => {
    const { id } = req.params;

    console.log("userID: ", id);

    db.query(
        'SELECT * FROM user_profile WHERE userID = ?',
        [id],
        (error, results) => {
            if (error) {
                console.error('Error fetching user profile:', error);
                return res.status(500).json({ message: 'Error fetching user profile' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            res.status(200).json(results[0]);
        }
    );
});

//Update User Profile
router.put('/user-profile/:id', (req, res) => {

    console.log("Call PUT Successfully");
    const userID = req.params.id;
    const { nickname, profilePic, bio, university,college,school, address, contact, interestedDepartment } = req.body;

    console.log("PUT Data: ",req.body);

    db.query(
        'UPDATE user_profile SET nickname = ?, profilePic = ?, bio = ?, university = ?, college = ?, school = ?, address = ?, contact = ?, interestedDepartment = ? WHERE userID = ?',
        [nickname, profilePic, bio, university, college, school, address, contact, JSON.stringify(interestedDepartment), userID],
        (error, results) => {
            if (error) {
                console.error('Error updating user profile:', error);
                return res.status(500).json({ message: 'Error updating user profile' });
            }

            res.status(200).json({ message: 'Profile updated successfully' });
        }
    );
});


// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../routes/uploads'); // Adjusted the path
    console.log(uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir); // Save files to the 'uploads' folder
    console.log(cb);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
    console.log(cb);
  }
});

const upload = multer({ storage });

// Upload profile picture endpoint
router.post('/upload-profile-pic/:id', upload.single('profilePic'), async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!req.file) {
    console.error('No file received');
    return res.status(400).json({ success: false, message: 'No file received' });
  }
  
  const profilePicUrl = `uploads/${req.file.filename}`; // Save the relative URL of the file
  console.log(profilePicUrl);

  try {
    console.log('File received:', req.file);
    console.log('Profile pic URL:', profilePicUrl);

    // Update the user's profile picture URL in the database
     db.query('UPDATE user_profile SET profilePic = ? WHERE userID = ?', [profilePicUrl, id]);

    res.status(200).json({ success: true, url: profilePicUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile picture' });
  }
});








// Helper function to send status email
const sendStatusEmail = async (email, name, programName, status) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });


    let subject, text;

    if (status === 'Approved') {
        subject = 'Your Application Has Been Approved';
        text = `Dear ${name},\n\nCongratulations! Your application for the ${programName} program has been approved. Please check your portal for further instructions, including payment details or scheduling a meeting.\n\nBest regards,\nUniversity Staff`;
    } else if (status === 'Rejected') {
        subject = 'Your Application Has Been Rejected';
        text = `Dear ${name},\n\nWe regret to inform you that your application for the ${programName} program has been rejected. For more information, please contact the university.\n\nBest regards,\nUniversity Staff`;
    } else {
        subject = 'Application Status Update';
        text = `Dear ${name},\n\nYour application for the ${programName} program has been updated to: ${status}.\n\nBest regards,\nUniversity Staff`;
    }

    await transporter.sendMail({
        from: process.env.DB_USER,
        to: email,
        subject: subject,
        text: text,
    });

    console.log('Email sent successfully');
};



module.exports = router;
