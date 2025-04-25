// controllers/authController.js
const DeliveryBoyUser = require('../../models/deliveryBoy/userScehma');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Temporary storage for unverified users
const tempUsers = new Map();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Register User with OTP Verification
exports.register = async (req, res) => {
    const { name, email, phone, role } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const emailLower = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await DeliveryBoyUser.findOne({ email: emailLower });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.isVerified
                    ? 'User already verified'
                    : 'Previous OTP expired. Please register again'
            });
        }

        // Check in temporary storage
        if (tempUsers.has(emailLower)) {
            return res.status(400).json({ message: 'OTP already sent. Please wait or verify the OTP' });
        }

        // Validate role
        if (!['deliveryBoy', 'restaurant'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Only 'deliveryBoy' or 'restaurant' allowed" });
        }

        // Store in temporary storage (10 minutes expiry)
        tempUsers.set(emailLower, {
            name,
            email: emailLower,
            phone,
            role,
            otp,
            createdAt: Date.now()
        });

        // Auto-delete after 10 minutes
        setTimeout(() => {
            if (tempUsers.get(emailLower)?.createdAt === tempUsers.get(emailLower)?.createdAt) {
                tempUsers.delete(emailLower);
                console.log(`Temporary user ${emailLower} deleted (timeout)`);
            }
        }, 10 * 60 * 1000);

        // Send OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emailLower,
            subject: 'Your OTP - Delivery App',
            text: `Your OTP code is: ${otp}\nThis code is valid for 10 minutes`
        });

        res.status(200).json({
            message: 'OTP sent to your email',
            tempUserId: emailLower
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Server error. Please try again later', error });
    }
};

// ✅ Verify OTP and Create Account
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const emailLower = email.trim().toLowerCase();

        // Get user from temporary storage
        const tempUser = tempUsers.get(emailLower);

        if (!tempUser) {
            return res.status(400).json({
                message: 'OTP expired (more than 10 minutes). Please register again'
            });
        }

        // Verify OTP
        if (tempUser.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please enter correct OTP' });
        }

        // Create permanent account
        const user = new DeliveryBoyUser({
            name: tempUser.name,
            email: tempUser.email,
            phone: tempUser.phone,
            role: tempUser.role,
            isVerified: true
        });

        await user.save();
        tempUsers.delete(emailLower);

        res.status(200).json({
            message: 'Account created successfully!',
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ message: 'Server error. Please try again later', error });
    }
};

// ✅ Send OTP for Login
exports.loginWithOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const emailLower = email.trim().toLowerCase();
        let user = await DeliveryBoyUser.findOne({ email: emailLower });

        if (!user) return res.status(400).json({ message: 'Email not registered' });
        if (!user.isVerified) return res.status(400).json({ message: 'Account not verified' });

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        await user.save();

        // Send OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emailLower,
            subject: 'Your Login OTP - Delivery App',
            text: `Your login OTP code is: ${otp}\nThis code is valid for 10 minutes`
        });

        res.status(200).json({
            message: 'Login OTP sent to your email',
            email: emailLower
        });

    } catch (error) {
        console.error("Login OTP error:", error);
        res.status(500).json({ message: 'Server error. Please try again later', error });
    }
};

// ✅ Verify Login OTP and Generate Token
exports.verifyLoginOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const emailLower = email.trim().toLowerCase();
        let user = await DeliveryBoyUser.findOne({ email: emailLower });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        // Generate JWT token
        user.otp = null;
        await user.save();

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login verification error:", error);
        res.status(500).json({ message: 'Server error. Please try again later', error });
    }
};