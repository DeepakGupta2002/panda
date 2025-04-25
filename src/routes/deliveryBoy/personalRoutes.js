const express = require('express');
const { uploadToCloudinary } = require('../../middleware/deliveryBoyMidilwhere/cloudinaryMiddleware');
const { authenticateUser } = require('../../middleware/deliveryBoyMidilwhere/authmidilwhere');
const {
    createPersonalDetails,
    getPersonalDetails,
    getAllPersonalDetails,
    updatePersonalDetails,
    deletePersonalDetails
} = require('../../controllers/authDeliveryBoy.js/personalController');
const { PersonalDetail } = require('../../models/deliveryBoy/personalSchema');

const personalrouter = express.Router();

/** ✅ Create Personal Details */
personalrouter.post('/personal/create', authenticateUser, uploadToCloudinary.single('profileImage'), createPersonalDetails);

/** ✅ Get Personal Details (Logged-in User) */
personalrouter.get('/personal', authenticateUser, getPersonalDetails);

/** ✅ Get All Personal Details (For Admin) */
personalrouter.get('/personal/all', getAllPersonalDetails);

/** ✅ Update Personal Details */
personalrouter.put('/personal/update', authenticateUser, uploadToCloudinary.single('profileImage'), updatePersonalDetails);

/** ✅ Delete Personal Details */
personalrouter.delete('/personal/delete', authenticateUser, deletePersonalDetails);


module.exports = { personalrouter };
