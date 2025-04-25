const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    deliveryInstructions: {
        type: String,
        default: ''
    },
    isDefault: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
