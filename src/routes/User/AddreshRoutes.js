const express = require('express');
const addreshRouter = express.Router();
const {
    createAddress,
    getUserAddresses,
    getAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('../../controllers/user/addressController')

// Validation middleware
const { body, param } = require('express-validator');
const { validateRequest } = require('../../middleware/user/validateRequest');
const { protect } = require('../../middleware/authMiddleware');

// Address validation rules
// Address validation rules
const addressValidationRules = [
    body('userId')
        .notEmpty().withMessage('userId is required')   // Ensure userId is provided
        .isMongoId().withMessage('Invalid userId format'), // Ensure it is a valid MongoDB ObjectId
    body('name').notEmpty().trim().isLength({ min: 2 }),
    body('phone').notEmpty().matches(/^(\+91|91|0)?[6789]\d{9}$/),
    body('email').optional().isEmail().normalizeEmail(),
    body('address').notEmpty().trim(),
    body('pincode').notEmpty().matches(/^[1-9][0-9]{5}$/),
    body('deliveryInstructions').optional().trim().isLength({ max: 500 }),
    body('isDefault').optional().isBoolean()
];


// Routes
addreshRouter.post('/addaddres', protect, validateRequest, createAddress);

addreshRouter.get('/user/:userId', [
    param('userId').isMongoId()
], validateRequest, getUserAddresses);
addreshRouter.get('/:id', [
    param('id').isMongoId()
], validateRequest, getAddress);
addreshRouter.put('/:id', protect, addressValidationRules, validateRequest, updateAddress);
addreshRouter.delete('/:id', [
    param('id').isMongoId()
], validateRequest, deleteAddress);
addreshRouter.patch('/:id/set-default', [
    param('id').isMongoId(),
    body('userId').isMongoId()
], validateRequest, setDefaultAddress);

module.exports = { addreshRouter };