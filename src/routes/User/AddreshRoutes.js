const express = require('express');
const { body, validationResult } = require('express-validator');
const UserAddresRouter = express.Router();
const { Address } = require('../../models/User/Address');
const { ContactInfo } = require('../../models/User/ContactInfo');
const { Location } = require('../../models/User/Location');
const { DeliveryInstructions } = require('../../models/User/DeliveryInstructions');

// Validation middleware
const addressValidation = [
    body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
    body('phone').notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Invalid phone number'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('address').notEmpty().withMessage('Address is required'),
    body('deliveryInstructions').optional().isString().withMessage('Delivery instructions must be a string'),
    body('city').notEmpty().withMessage('City is required').isString().withMessage('City must be a string'),
    body('state').notEmpty().withMessage('State is required').isString().withMessage('State must be a string'),
    body('country').notEmpty().withMessage('Country is required').isString().withMessage('Country must be a string'),
    body('latitude').optional().isDecimal().withMessage('Latitude must be a valid decimal'),
    body('longitude').optional().isDecimal().withMessage('Longitude must be a valid decimal'),
];

// 1. Create a new Address
UserAddresRouter.post('/address', addressValidation, async (req, res) => {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Create contact info
        const contactInfo = new ContactInfo({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
        });
        await contactInfo.save();

        // Create location
        const location = new Location({
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        });
        await location.save();

        // Create delivery instructions
        const deliveryInstructions = new DeliveryInstructions({
            instructions: req.body.deliveryInstructions,
        });
        await deliveryInstructions.save();

        // Create the Address
        const address = new Address({
            contactInfo: contactInfo._id,
            location: location._id,
            deliveryInstructions: deliveryInstructions._id,
        });
        await address.save();

        res.status(201).json({ message: 'Address saved successfully!', address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving address!', error: error.message });
    }
});

// 2. Get all Addresses
UserAddresRouter.get('/addresses', async (req, res) => {
    try {
        const addresses = await Address.find()
            .populate('contactInfo')
            .populate('location')
            .populate('deliveryInstructions');
        res.status(200).json(addresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching addresses!', error: error.message });
    }
});

// 3. Get Address by ID
UserAddresRouter.get('/address/:id', async (req, res) => {
    try {
        const address = await Address.findById(req.params.id)
            .populate('contactInfo')
            .populate('location')
            .populate('deliveryInstructions');
        if (!address) {
            return res.status(404).json({ message: 'Address not found!' });
        }
        res.status(200).json(address);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching address!', error: error.message });
    }
});

// 4. Update Address by ID
UserAddresRouter.put('/address/:id', addressValidation, async (req, res) => {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedAddress = await Address.findByIdAndUpdate(
            req.params.id,
            {
                contactInfo: req.body.contactInfoId || req.body.contactInfo,
                location: req.body.locationId || req.body.location,
                deliveryInstructions: req.body.deliveryInstructionsId || req.body.deliveryInstructions,
            },
            { new: true }
        ).populate('contactInfo').populate('location').populate('deliveryInstructions');

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found!' });
        }

        res.status(200).json({ message: 'Address updated successfully!', updatedAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating address!', error: error.message });
    }
});

// 5. Delete Address by ID
UserAddresRouter.delete('/address/:id', async (req, res) => {
    try {
        const address = await Address.findByIdAndDelete(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found!' });
        }

        // Also delete associated contact info, location, and delivery instructions
        await ContactInfo.findByIdAndDelete(address.contactInfo);
        await Location.findByIdAndDelete(address.location);
        await DeliveryInstructions.findByIdAndDelete(address.deliveryInstructions);

        res.status(200).json({ message: 'Address deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting address!', error: error.message });
    }
});

module.exports = { UserAddresRouter };
