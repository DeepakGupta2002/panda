const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full Name is required'],
        trim: true,
        minlength: [3, 'Full Name must be at least 3 characters long'],
        maxlength: [50, 'Full Name must not exceed 50 characters'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone Number is required'],
        match: [/^[0-9]{10}$/, 'Phone Number must be exactly 10 digits'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid Email format'],
    },
    houseNumber: {
        type: String,
        required: [true, 'House Number is required'],
        trim: true,
        minlength: [1, 'House Number must be at least 1 character'],
        maxlength: [20, 'House Number must not exceed 20 characters'],
    },
    streetAddress: {
        type: String,
        required: [true, 'Street Address is required'],
        trim: true,
        minlength: [5, 'Street Address must be at least 5 characters'],
        maxlength: [100, 'Street Address must not exceed 100 characters'],
    },
    landmark: {
        type: String,
        trim: true,
        maxlength: [50, 'Landmark must not exceed 50 characters'],
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        minlength: [2, 'City must be at least 2 characters long'],
        maxlength: [50, 'City must not exceed 50 characters'],
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        minlength: [2, 'State must be at least 2 characters long'],
        maxlength: [50, 'State must not exceed 50 characters'],
    },
    postalCode: {
        type: String,
        required: [true, 'Postal Code is required'],
        match: [/^[0-9]{5,6}$/, 'Postal Code must be 5-6 digits'],
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        minlength: [2, 'Country must be at least 2 characters long'],
        maxlength: [50, 'Country must not exceed 50 characters'],
    },
    deliveryInstructions: {
        type: String,
        trim: true,
        maxlength: [250, 'Delivery Instructions must not exceed 250 characters'],
    },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
