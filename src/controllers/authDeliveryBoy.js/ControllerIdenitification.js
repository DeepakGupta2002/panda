const Identification = require('../../models/deliveryBoy/idSchema');

// ✅ Add / Update Identification
const addIdentification = async (req, res) => {
    try {
        const { aadhaarNumber, panNumber, drivingLicenseNumber } = req.body;

        // ✅ Ensure all required fields are present
        if (!aadhaarNumber) return res.status(400).json({ message: "Aadhaar Number is required" });

        // ✅ Extract Images
        let aadhaarImageUrl = req.files?.['aadhaarImage'] ? req.files['aadhaarImage'][0].path : null;
        let panImageUrl = req.files?.['panImage'] ? req.files['panImage'][0].path : null;
        let drivingLicenseImageUrl = req.files?.['drivingLicenseImage'] ? req.files['drivingLicenseImage'][0].path : null;

        // ✅ Ensure userId is available
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized - User ID not found" });

        let identification = await Identification.findOne({ userId });

        if (identification) {
            // ✅ Update Existing Record
            identification.aadhaarNumber = aadhaarNumber;
            identification.panNumber = panNumber || identification.panNumber;
            identification.drivingLicenseNumber = drivingLicenseNumber || identification.drivingLicenseNumber;
            if (aadhaarImageUrl) identification.aadhaarImage = aadhaarImageUrl;
            if (panImageUrl) identification.panImage = panImageUrl;
            if (drivingLicenseImageUrl) identification.drivingLicenseImage = drivingLicenseImageUrl;
        } else {
            // ✅ Create New Identification Entry
            identification = new Identification({
                userId,
                aadhaarNumber,
                panNumber,
                drivingLicenseNumber,
                aadhaarImage: aadhaarImageUrl,
                panImage: panImageUrl,
                drivingLicenseImage: drivingLicenseImageUrl
            });
        }

        await identification.save();
        res.status(200).json({ message: "Identification updated", identification });
    } catch (error) {
        res.status(500).json({ message: "Error updating identification", error });
    }
};

// ✅ Get Identification
const getIdentification = async (req, res) => {
    try {
        const identification = await Identification.findOne({ user: req.user.id }).populate('user', 'email phone');
        if (!identification) return res.status(404).json({ message: "Identification details not found" });

        res.status(200).json({ identification });
    } catch (error) {
        res.status(500).json({ message: "Error fetching identification details", error });
    }
};

// ✅ Delete Identification
const deleteIdentification = async (req, res) => {
    try {
        await Identification.findOneAndDelete({ user: req.user.id });
        res.status(200).json({ message: "Identification details deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting identification details", error });
    }
};

module.exports = { addIdentification, getIdentification, deleteIdentification };
