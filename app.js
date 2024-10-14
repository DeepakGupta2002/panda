const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Required to resolve file paths
const fs = require('fs'); // Required for file system operations
const connectDB = require('./config/db');
const { authRouter } = require('./src/routes/authRoutes');
const { protect } = require('./src/middleware/authMiddleware');
const { router } = require('./src/routes/tiffinCategories');


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());


// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // Create uploads directory
}

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
let api = "/api";
app.use(api, authRouter);
app.use(api, router);

// Protected profile route
authRouter.get('/profile', protect, (req, res) => {
    res.json({ message: `Welcome, ${req.user.name}!`, user: req.user });
});

// Serve index.html for all other routes that aren't API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
