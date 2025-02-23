const express = require('express');
const addreshRoute = express.Router(); // Router को सही से परिभाषित करें

const Address = require('../../models/addreshModal'); // Address मॉडल का सही पथ दें

// Add Address Route
addreshRoute.post('/addaddress', async (req, res) => {
    try {
        const addressData = req.body;
        const requiredFields = ['fullName', 'phoneNumber', 'email', 'houseNumber', 'streetAddress', 'city', 'state', 'postalCode', 'country'];
        const missingFields = requiredFields.filter(field => !addressData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({ message: 'Validation error', missingFields });
        }

        const newAddress = new Address(addressData);
        const savedAddress = await newAddress.save();
        res.status(201).json({ message: 'Address added successfully', data: savedAddress });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation error', errors: validationErrors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

addreshRoute.put('/addresses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const addressData = req.body;

        const updatedAddress = await Address.findByIdAndUpdate(id, addressData, { new: true, runValidators: true });

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address updated successfully', data: updatedAddress });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation error', errors: validationErrors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

addreshRoute.get('/addresses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address fetched successfully', data: address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

addreshRoute.get('/addresses', async (req, res) => {
    try {
        const addresses = await Address.find();
        res.status(200).json({ message: 'Addresses fetched successfully', data: addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});



addreshRoute.delete('/addresses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAddress = await Address.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address deleted successfully', data: deletedAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = { addreshRoute };
