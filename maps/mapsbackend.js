const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const axios = require('axios');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'taxi_app'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public')); // Serve static files from the 'public' folder

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/calculate', (req, res) => {
    const { origin, destination } = req.body;

    // Using Google Maps API to get the distance between two locations
    axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
            origins: origin,
            destinations: destination,
            key: 'YOUR_GOOGLE_MAPS_API_KEY',
        },
    })
    .then(response => {
        const distance = response.data.rows[0].elements[0].distance.value / 1000; // Convert meters to kilometers
        const fare = calculateFare(distance);

        // Update the database with ride details (you should have a 'rides' table)
        const sql = 'INSERT INTO rides (origin, destination, distance) VALUES (?, ?, ?)';
        db.query(sql, [origin, destination, distance], (err, result) => {
            if (err) throw err;
            console.log('Ride details added to the database');
        });

        res.json({ distance, fare });
    })
    .catch(error => {
        console.error('Error fetching distance from Google Maps API', error);
        res.status(500).send('Error calculating distance');
    });
});

function calculateFare(distance) {
    const baseFare = 400;
    const additionalFare = 400;
    if (distance <= 2) {
        return baseFare;
    } else {
        return baseFare + (distance - 2) * additionalFare;
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
