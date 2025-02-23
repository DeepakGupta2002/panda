// middlewares/validateCategory.js
module.exports = (req, res, next) => {
    const { name } = req.body;

    // Check if name is provided and is a non-empty string
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required and must be a non-empty string.' });
    }

    // If validation passes, proceed to the next middleware or route handler
    next();
};
