const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'null',
    resave: true,
    saveUninitialized: true
}));

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

// API endpoint for login
app.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Fetch user from the database
        const selectQuery = 'SELECT * FROM users WHERE phone = ?';
        db.query(selectQuery, [phone], async (selectErr, selectResult) => {
            if (selectErr) {
                console.error('Error selecting user:', selectErr);
                res.status(500).json({ message: 'Login failed' });
            } else if (selectResult.length === 0) {
                res.json({ message: 'User not found' });
            } else {
                const user = selectResult[0];

                // Compare the provided password with the hashed password
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (passwordMatch) {
                    // Store user data in session
                    req.session.user = {
                        id: user.id,
                        name: user.name,
                        phone: user.phone
                    };

                    res.json({ message: 'Login successful' });
                } else {
                    res.json({ message: 'Incorrect password' });
                }
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.listen(port, () => {
    console.log(`Login server is running on http://localhost:${port}`);
});
