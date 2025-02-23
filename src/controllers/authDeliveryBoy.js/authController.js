// controllers/authController.js (Auth Logic)
const DeliveryBoyUser = require('../../models/deliveryBoy/userScehma');
// Schema Import Fix
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Register User with OTP Verification
exports.register = async (req, res) => {
    const { name, email, phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const emailLower = email.trim().toLowerCase(); // Ensure Lowercase Email

        let user = await DeliveryBoyUser.findOne({ email: emailLower });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new DeliveryBoyUser({ name, email: emailLower, phone, otp });
        await user.save();

        // ✅ Send OTP Email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emailLower,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error("Error Registering User:", error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// ✅ Verify OTP (For Registration)
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const emailLower = email.trim().toLowerCase();
        let user = await DeliveryBoyUser.findOne({ email: emailLower });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        user.isVerified = true;
        user.otp = null;
        await user.save();

        res.status(200).json({ message: 'User verified successfully' });
    } catch (error) {
        console.error("Error Verifying OTP:", error);
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};

// ✅ Step 1: Send OTP on Login Request
exports.loginWithOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const emailLower = email.trim().toLowerCase();
        let user = await DeliveryBoyUser.findOne({ email: emailLower });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (!user.isVerified) return res.status(400).json({ message: 'User not verified' });

        // ✅ Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        await user.save();

        // ✅ Send OTP Email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emailLower,
            subject: 'Login OTP Verification',
            text: `Your OTP for login is: ${otp}`
        });

        res.status(200).json({ message: 'OTP sent to email' });

    } catch (error) {
        console.error("Error Sending Login OTP:", error);
        res.status(500).json({ message: 'Error sending OTP', error });
    }
};

// ✅ Step 2: Verify OTP and Login
exports.verifyLoginOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const emailLower = email.trim().toLowerCase();
        let user = await DeliveryBoyUser.findOne({ email: emailLower });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        // ✅ OTP Verified, Generate JWT Token
        user.otp = null;
        await user.save();

        const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });

    } catch (error) {
        console.error("Error Verifying OTP:", error);
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};
