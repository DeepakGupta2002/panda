const express = require('express');
const authRouter = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expiry (e.g., 30 days)
    });
};

// Register Route
authRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, password });
        await user.save();

        // Generate JWT token after user registration
        const token = generateToken(user._id);

        res.status(201).json({ token, status: 200 });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login Route
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.json({ token, status: 200 });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Forgot Password Route
authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Setup nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password
            },
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset email sent', status: 200 });
    } catch (error) {
        res.status(500).json({ message: 'Error sending password reset email' });
    }
});

// Reset Password Route
authRouter.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password and save
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful', status: 200 });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Protected Route - Profile
authRouter.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ _id: user._id, name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = { authRouter };
