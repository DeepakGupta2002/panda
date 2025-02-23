const express = require('express');
const { register, verifyOTP, login, loginWithOTP, verifyLoginOTP } = require('../../controllers/authDeliveryBoy.js/authController');
const { authenticateUser } = require('../../middleware/deliveryBoyMidilwhere/authmidilwhere');
const deliveryBoyRouter = express.Router();

deliveryBoyRouter.post('/deliveryBoy/register', register);
deliveryBoyRouter.post('/deliveryBoy/verify-otp', verifyOTP);
deliveryBoyRouter.post('/deliveryBoy/login', loginWithOTP);
deliveryBoyRouter.post('/deliveryBoy/verify-login', verifyLoginOTP);


// ✅ Example Protected Route (Delivery Boy Dashboard)
deliveryBoyRouter.get('/dashboard', authenticateUser, (req, res) => {
    res.status(200).json({ message: 'Welcome to your dashboard', user: req.user });
});




module.exports = { deliveryBoyRouter };