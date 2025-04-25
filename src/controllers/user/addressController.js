const Address = require('../../models/User/Address');

// ➕ Create new address
const createAddress = async (req, res) => {
    try {
        const { name, phone, address, pincode, deliveryInstructions } = req.body;

        // userId will be automatically extracted from req.user (set by JWT)
        const userId = req.user.id;

        // Address creation logic
        const newAddress = new Address({
            userId,  // Using userId from JWT
            name,
            phone,
            address,
            pincode,
            deliveryInstructions
        });

        await newAddress.save();

        res.status(201).json({ success: true, data: newAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// 📥 Get all addresses for a user
const getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch addresses', error });
    }
};

// 📄 Get single address by ID
const getAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch address', error });
    }
};

// 🖊️ Update address
const updateAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const { name, phone, address: newAddress, pincode, deliveryInstructions, isDefault } = req.body;

        if (isDefault) {
            await Address.updateMany({ userId: req.user._id }, { isDefault: false });
        }

        address.name = name || address.name;
        address.phone = phone || address.phone;
        address.address = newAddress || address.address;
        address.pincode = pincode || address.pincode;
        address.deliveryInstructions = deliveryInstructions || '';
        address.isDefault = isDefault || false;

        const updated = await address.save();
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update address', error });
    }
};

// ❌ Delete address
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndDelete(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete address', error });
    }
};

// ⭐ Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Unset previous default
        await Address.updateMany({ userId: address.userId }, { isDefault: false });

        // Set this one as default
        address.isDefault = true;
        const updated = await address.save();
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to set default address', error });
    }
};

module.exports = {
    createAddress,
    getUserAddresses,
    getAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
