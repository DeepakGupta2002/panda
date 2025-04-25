const express = require('express');
const Identificationrouter = express.Router();
const { authenticateUser } = require('../../middleware/deliveryBoyMidilwhere/authmidilwhere');
const { uploadToCloudinary } = require('../../middleware/deliveryBoyMidilwhere/cloudinaryMiddleware');
const { addIdentification, getIdentification, deleteIdentification } = require('../../controllers/authDeliveryBoy.js/ControllerIdenitification');

Identificationrouter.post('/identification/create', authenticateUser, uploadToCloudinary.fields([
    { name: 'aadhaarImage' },
    { name: 'panImage' },
    { name: 'drivingLicenseImage' } // ✅ Driving License Image added
]), addIdentification);
Identificationrouter.get('/identification/get', authenticateUser, getIdentification);
Identificationrouter.delete('/identification/delete', authenticateUser, deleteIdentification);

module.exports = { Identificationrouter };
