const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/deliveryBoyMidilwhere/authmidilwhere');
const Identification = require('../../models/deliveryBoy/idSchema');
const { upload } = require('../../middleware/deliveryBoyMidilwhere/upload');

// ✅ Add / Update Identification Details
router.post('/', authenticateUser, upload.fields([{ name: 'aadhaarImage' }, { name: 'panImage' }]), async (req, res) => {
    try {
        const { aadhaar, pan } = req.body;
        if (!aadhaar) return res.status(400).json({ message: "Aadhaar is required" });

        let aadhaarImageUrl = req.files['aadhaarImage'] ? req.files['aadhaarImage'][0].path : null;
        let panImageUrl = req.files['panImage'] ? req.files['panImage'][0].path : null;

        let identification = await Identification.findOne({ user: req.user.id });

        if (identification) {
            identification.aadhaar = aadhaar;
            identification.pan = pan || identification.pan;
            if (aadhaarImageUrl) identification.aadhaarImage = aadhaarImageUrl;
            if (panImageUrl) identification.panImage = panImageUrl;
        } else {
            identification = new Identification({
                user: req.user.id,
                aadhaar,
                pan,
                aadhaarImage: aadhaarImageUrl,
                panImage: panImageUrl,
            });
        }

        await identification.save();
        res.status(200).json({ message: "Identification updated", identification });
    } catch (error) {
        res.status(500).json({ message: "Error updating identification", error });
    }
});
// ✅ Get Identification Details
router.get('/', authenticateUser, async (req, res) => {
    try {
        const identification = await Identification.findOne({ user: req.user.id }).populate('user', 'email phone');
        if (!identification) return res.status(404).json({ message: "Identification details not found" });

        res.status(200).json({ identification });
    } catch (error) {
        res.status(500).json({ message: "Error fetching identification details", error });
    }
});

// ✅ Delete Identification Details
router.delete('/', authenticateUser, async (req, res) => {
    try {
        await Identification.findOneAndDelete({ user: req.user.id });
        res.status(200).json({ message: "Identification details deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting identification details", error });
    }
});

module.exports = { router };
