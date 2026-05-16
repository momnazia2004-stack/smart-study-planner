const Assignment = require('../models/Assignment');

// 1. Add New Assignment
exports.addAssignment = async (req, res) => {
    try {
        // Status ko bhi body se nikalna hai taake 'Completed' wala logic chale
        const { userId, title, deadline, status } = req.body;
        
        const newAssignment = new Assignment({ 
            userId, 
            title, 
            deadline, 
            status: status || 'Pending' // Agar status na ho toh Pending
        });

        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get All Assignments for a specific User
exports.getAssignments = async (req, res) => {
    try {
        const { userId } = req.params;
        const assignments = await Assignment.find({ userId }).sort({ deadline: 1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Assignment Status (Mark Done ke liye)
exports.updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );
        res.json(updatedAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Delete Assignment
exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        await Assignment.findByIdAndDelete(id);
        res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};