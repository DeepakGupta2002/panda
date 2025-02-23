const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/deliveryBoyMidilwhere/authmidilwhere');
const BankDetail = require('../../models/deliveryBoy/bankSchema');

// ✅ Add / Update Bank Details
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { accountNumber, ifscCode, upiId } = req.body;
        let bank = await BankDetail.findOne({ user: req.user.id });

        if (bank) {
            bank.accountNumber = accountNumber;
            bank.ifscCode = ifscCode;
            bank.upiId = upiId;
        } else {
            bank = new BankDetail({ user: req.user.id, accountNumber, ifscCode, upiId });
        }

        await bank.save();
        res.status(200).json({ message: "Bank details updated", bank });
    } catch (error) {
        res.status(500).json({ message: "Error updating bank details", error });
    }
});

// ✅ Get Bank Details
router.get('/', authenticateUser, async (req, res) => {
    try {
        const bank = await BankDetail.findOne({ user: req.user.id }).populate('user', 'email phone');
        if (!bank) return res.status(404).json({ message: "Bank details not found" });

        res.status(200).json({ bank });
    } catch (error) {
        res.status(500).json({ message: "Error fetching bank details", error });
    }
});

// ✅ Delete Bank Details
router.delete('/', authenticateUser, async (req, res) => {
    try {
        await BankDetail.findOneAndDelete({ user: req.user.id });
        res.status(200).json({ message: "Bank details deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting bank details", error });
    }
});

module.exports = router;
