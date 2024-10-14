const express = require('express');
const authRouter = express.Router();
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Routes for user authentication
authRouter.post('/register', register);
authRouter.post('/login', login);

module.exports = { authRouter };
