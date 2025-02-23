const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String, // Or `mongoose.Schema.Types.ObjectId` if referencing a User model
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
