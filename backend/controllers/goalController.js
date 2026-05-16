const Goal = require('../models/Goal');

// 1. Get Goals - Ensure 'exports.getGoals' is exactly like this
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.params.userId });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Add Goal - Ensure 'exports.addGoal'
exports.addGoal = async (req, res) => {
    const { userId, title, val, p, type } = req.body;
    const newGoal = new Goal({ userId, title, val, p, type });
    try {
        const savedGoal = await newGoal.save();
        res.json(savedGoal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 3. Update Goal - Ensure 'exports.updateGoal'
exports.updateGoal = async (req, res) => {
    try {
        const { title, val, p, type } = req.body;
        const updatedGoal = await Goal.findByIdAndUpdate(
            req.params.id, 
            { title, val, p, type }, 
            { new: true, runValidators: true }
        );
        if (!updatedGoal) return res.status(404).json({ message: "Goal not found" });
        res.json(updatedGoal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 4. Delete Goal - Ensure 'exports.deleteGoal'
exports.deleteGoal = async (req, res) => {
    try {
        const deleted = await Goal.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Goal not found" });
        res.json({ message: "Goal Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};