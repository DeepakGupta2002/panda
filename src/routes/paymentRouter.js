const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
const bodyParser = require('body-parser');

// Create Razorpay instance with your Razorpay key and secret
const razorpay = new Razorpay({
    key_id: 'rzp_test_nYQzadcgwZUgVD', // Replace with your Razorpay key ID
    key_secret: 'YOUR_RAZORPAY_KEY_SECRET', // Replace with your Razorpay secret
});

// Parse JSON request bodies
router.use(bodyParser.json());

// Route for creating Razorpay order
router.post('/create-razorpay-order', (req, res) => {
    const { totalAmount } = req.body;

    // Razorpay order options
    const options = {
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR', // Currency
        receipt: `order_rcptid_${Math.random()}`, // Unique receipt ID
        payment_capture: 1, // Capture payment immediately
    };

    // Create order with Razorpay
    razorpay.orders.create(options, (err, order) => {
        if (err) {
            console.error('Error creating Razorpay order:', err);
            return res.status(500).json({ success: false, error: err });
        }
        res.json({
            success: true,
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    });
});

// Export the router
module.exports = { router };
