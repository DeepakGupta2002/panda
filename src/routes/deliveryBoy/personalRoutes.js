const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/deliveryBoyMidilwhere/authmidilwhere');
const PersonalDetail = require('../../models/deliveryBoy/personalSchema');
const multer = require('multer');
// const { upload } = require('../../middleware/deliveryBoyMidilwhere/upload'); // ✅ Import multer middleware



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Folder to save the image temporarily
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
    }
});

const upload = multer({ storage });  // Multer instance for file upload


router.post('/', authenticateUser, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, gender } = req.body;
        let imageUrl = req.file ? req.file.path : null; // ✅ Multer will save file path

        let personal = await PersonalDetail.findOne({ user: req.user.id });

        if (personal) {
            personal.name = name || personal.name;
            personal.gender = gender || personal.gender;
            if (imageUrl) personal.profileImage = imageUrl;
        } else {
            personal = new PersonalDetail({ user: req.user.id, name, gender, profileImage: imageUrl });
        }

        await personal.save();
        res.status(200).json({ message: "Personal details updated", personal });
    } catch (error) {
        console.error("❌ Error in Personal Details API:", error);
        res.status(500).json({ message: "Error updating personal details", error: error.message });
    }
});

module.exports = { router };
