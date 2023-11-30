// server.js
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const port = 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'go',
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// API endpoint
app.post('/register', async (req, res) => {
    const { name, phone, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const checkQuery = 'SELECT * FROM users WHERE phone = ?';
        db.query(checkQuery, [phone], async (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Error checking phone number:', checkErr);
                res.status(500).json({ message: 'Registration failed' });
            } else if (checkResult.length > 0) {
                res.json({ message: 'Phone number already registered' });
            } else {
                const insertQuery = 'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)';
                await db.query(insertQuery, [name, phone, hashedPassword]);
                console.log('User registered');
                res.json({ message: 'Registration successful' });
            }
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
