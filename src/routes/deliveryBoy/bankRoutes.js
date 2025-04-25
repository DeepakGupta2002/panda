const express = require('express');
const BankRouter = express.Router();
const { authenticateUser } = require('../../middleware/deliveryBoyMidilwhere/authmidilwhere');
const { createBankDetails, getBankDetails, updateBankDetails, deleteBankDetails } = require('../../controllers/authDeliveryBoy.js/bankController');

// ✅ Create Bank Details
BankRouter.post('/bank/create', authenticateUser, createBankDetails);

// ✅ Get Bank Details
BankRouter.get('/bank/get', authenticateUser, getBankDetails);

// ✅ Update Bank Details
BankRouter.put('/bank/update', authenticateUser, updateBankDetails);

// ✅ Delete Bank Details
BankRouter.delete('/bank/delete', authenticateUser, deleteBankDetails);

module.exports = { BankRouter };
