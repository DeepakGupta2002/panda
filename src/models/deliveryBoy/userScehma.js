const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ['deliveryBoy', 'restaurant'], required: true }, // Role-Based Access
    otp: { type: String },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model('DeliveryBoyUser', UserSchema);
