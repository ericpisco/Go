// server.js
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

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

// API endpoint for registration
app.post('/register', async (req, res) => {
    // Your registration logic here
    res.json({ message: 'Registration successful' });
});

// API endpoint for login
app.post('/login', (req, res) => {
    const { phone, password } = req.body;

    const selectQuery = 'SELECT * FROM users WHERE phone = ?';
    db.query(selectQuery, [phone], async (selectErr, selectResult) => {
        if (selectErr) {
            console.error('Error selecting user:', selectErr);
            res.status(500).json({ message: 'Login failed' });
        } else if (selectResult.length === 0) {
            res.json({ message: 'User not found' });
        } else {
            const user = selectResult[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Redirect to a new URL (replace 'dashboard.html' with your actual file)
                res.redirect('/home.html');
            } else {
                res.json({ message: 'Incorrect password' });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
