const User = require('../models/User');

// Register User
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: "User Registered Successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login User (Flexible: Email or Name)
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Identifier ko dono email aur name fields mein check karega
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { name: identifier }
            ]
        });

        if (user && user.password === password) {
            res.json({
                _id: user._id,
                name: user.name, 
                email: user.email,
                message: "Login Successful"
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Password
exports.updatePassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOneAndUpdate({ email }, { password: newPassword });
        if (user) {
            res.json({ message: "Password updated successfully!" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};