const jwt = require('jsonwebtoken');
const User = require('../../models/deliveryBoy/userScehma');

// ✅ Middleware to Protect Routes
exports.authenticateUser = async (req, res, next) => {
    let token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        // Extract Token
        token = token.replace("Bearer ", "");

        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach User to Request
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Invalid Token' });
    }
};

// ✅ Middleware to Check Specific Role
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied' });
        }
        next();
    };
};
