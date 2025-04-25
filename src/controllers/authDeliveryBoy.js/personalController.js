const { PersonalDetail } = require('../../models/deliveryBoy/personalSchema');

/** ✅ Create Personal Details */
const createPersonalDetails = async (req, res) => {
    try {
        const { name, gender } = req.body;
        const profileImage = req.file ? req.file.path : null; // 👈 Cloudinary image URL

        if (!profileImage) {
            return res.status(400).json({ error: 'Profile image is required' });
        }

        let existingPersonal = await PersonalDetail.findOne({ user: req.user.id });
        if (existingPersonal) {
            return res.status(400).json({ message: "Personal details already exist. Use update API." });
        }

        const personal = new PersonalDetail({
            user: req.user.id,
            name,
            gender,
            profileImage
        });

        await personal.save();
        res.status(201).json({ message: "Personal details created successfully", personal });

    } catch (error) {
        console.error("❌ Error in Personal Details Create API:", error);
        res.status(500).json({ message: "Error creating personal details", error: error.message });
    }
};

/** ✅ Get Personal Details by User */
const getPersonalDetails = async (req, res) => {
    try {
        let personal = await PersonalDetail.findOne({ user: req.user.id });

        if (!personal) {
            return res.status(404).json({ message: "No personal details found." });
        }

        res.status(200).json({ message: "Personal details fetched successfully", personal });

    } catch (error) {
        console.error("❌ Error in Get Personal Details API:", error);
        res.status(500).json({ message: "Error fetching personal details", error: error.message });
    }
};

/** ✅ Get All Personal Details (Admin Purpose) */
const getAllPersonalDetails = async (req, res) => {
    try {
        let personals = await PersonalDetail.find();

        res.status(200).json({ message: "All personal details fetched successfully", personals });

    } catch (error) {
        console.error("❌ Error in Get All Personal Details API:", error);
        res.status(500).json({ message: "Error fetching all personal details", error: error.message });
    }
};

/** ✅ Update Personal Details */
const updatePersonalDetails = async (req, res) => {
    try {
        const { name, gender } = req.body;
        let personal = await PersonalDetail.findOne({ user: req.user.id });

        if (!personal) {
            return res.status(404).json({ message: "No personal details found. Use create API." });
        }

        if (req.file) {
            personal.profileImage = req.file.path; // 👈 Cloudinary image URL
        }
        personal.name = name || personal.name;
        personal.gender = gender || personal.gender;

        await personal.save();
        res.status(200).json({ message: "Personal details updated successfully", personal });

    } catch (error) {
        console.error("❌ Error in Personal Details Update API:", error);
        res.status(500).json({ message: "Error updating personal details", error: error.message });
    }
};

/** ✅ Delete Personal Details */
const deletePersonalDetails = async (req, res) => {
    try {
        const userId = req.user.id; // ✅ User ID from JWT Token

        const deletedPersonal = await PersonalDetail.findOneAndDelete({ user: userId });
        if (!deletedPersonal) {
            return res.status(404).json({ message: "No personal details found to delete." });
        }

        res.status(200).json({ message: "Personal details deleted successfully" });
    } catch (error) {
        console.error("❌ Error in Delete Personal Details:", error);
        res.status(500).json({ message: "Error deleting personal details", error: error.message });
    }
};

module.exports = {
    createPersonalDetails,
    getPersonalDetails,
    getAllPersonalDetails,
    updatePersonalDetails,
    deletePersonalDetails
};
