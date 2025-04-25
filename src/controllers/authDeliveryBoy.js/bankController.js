const BankDetail = require('../../models/deliveryBoy/bankSchema');

// ✅ Create Bank Details
exports.createBankDetails = async (req, res) => {
    try {
        const { accountNumber, ifscCode, upiId } = req.body;

        if (!accountNumber || !ifscCode) {
            return res.status(400).json({ message: "Account Number and IFSC Code are required!" });
        }

        let bank = await BankDetail.findOne({ user: req.user.id });

        if (bank) {
            return res.status(400).json({ message: "Bank details already exist. Use update API instead." });
        }

        bank = new BankDetail({
            user: req.user.id,
            accountNumber,
            ifscCode,
            upiId
        });

        await bank.save();
        res.status(201).json({ message: "Bank details created successfully", bank });

    } catch (error) {
        console.error("Error creating bank details:", error);
        res.status(500).json({ message: "Error creating bank details", error });
    }
};

// ✅ Get Bank Details
exports.getBankDetails = async (req, res) => {
    try {
        // console.log("🔍 User Info from Auth Middleware:", req.user);

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized! User ID missing." });
        }

        console.log("🔎 Searching Bank Details for User ID:", req.user.id);

        const bank = await BankDetail.findOne({ user: req.user.id });

        if (!bank) {
            console.log("❌ No Bank Details Found!");
            return res.status(404).json({ message: "Bank details not found" });
        }

        // ✅ Only returning user ID, not full user details
        res.status(200).json({
            bank: {
                _id: bank._id,
                user: bank.user, // Only user ID
                accountNumber: bank.accountNumber,
                ifscCode: bank.ifscCode,
                upiId: bank.upiId
            }
        });

    } catch (error) {
        console.error("⚠️ Error fetching bank details:", error);
        res.status(500).json({ message: "Error fetching bank details", error });
    }
};

// ✅ Update Bank Details
exports.updateBankDetails = async (req, res) => {
    try {
        const { accountNumber, ifscCode, upiId } = req.body;

        let bank = await BankDetail.findOne({ user: req.user.id });

        if (!bank) {
            return res.status(404).json({ message: "Bank details not found" });
        }

        bank.accountNumber = accountNumber || bank.accountNumber;
        bank.ifscCode = ifscCode || bank.ifscCode;
        bank.upiId = upiId || bank.upiId;

        await bank.save();
        res.status(200).json({ message: "Bank details updated successfully", bank });

    } catch (error) {
        console.error("Error updating bank details:", error);
        res.status(500).json({ message: "Error updating bank details", error });
    }
};

// ✅ Delete Bank Details
exports.deleteBankDetails = async (req, res) => {
    try {
        const bank = await BankDetail.findOneAndDelete({ user: req.user.id });

        if (!bank) {
            return res.status(404).json({ message: "Bank details not found" });
        }

        res.status(200).json({ message: "Bank details deleted successfully" });

    } catch (error) {
        console.error("Error deleting bank details:", error);
        res.status(500).json({ message: "Error deleting bank details", error });
    }
};
