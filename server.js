const express = require('express');
const multer = require('multer');
const { Client } = require('pg');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the current directory (including CSS)
app.use(express.static(path.join(__dirname, '.')));

// Parse URL-encoded bodies (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// PostgreSQL client setup
const client = new Client({
    user: 'postgres',      // Change to your PostgreSQL username
    host: 'localhost',
    database: 'Students',  // Change to your database name
    password: 'aditya',    // Change to your database password
    port: 5432,
});

// Connect to the database
client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Connection error', err.stack));

// Multer setup to save files to 'uploads' directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');  // Specify the uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // Unique file name
    }
});

const upload = multer({ storage: storage });

// Serve the file.html page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'file.html'));
});

// Route to upload the file
app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;           // Path where the file is stored
    const fileName = req.file.originalname;   // Original name of the file
    const teamId = req.body.teamId;           // Team ID from the form

    // Insert file metadata and team ID into PostgreSQL database
    const query = 'INSERT INTO files (file_name, file_path, team_id) VALUES ($1, $2, $3)';
    client.query(query, [fileName, filePath, teamId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error storing file information in the database');
        }
        res.status(200).send('File uploaded and information stored successfully');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
