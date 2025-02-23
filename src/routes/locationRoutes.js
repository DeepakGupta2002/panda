const express = require('express');
const locationRoutes = express.Router();

// Placeholder route for fetching locations
locationRoutes.get('/', (req, res) => {
    res.send('Location routes are working!');
});

module.exports = { locationRoutes };
