const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Route to serve hello.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'hello.html'));
});

// Server listening on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
