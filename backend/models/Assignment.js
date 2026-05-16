const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    // User ID ko String rakha hai taake dummy ID ya login ID dono accept ho sakein
    userId: {
        type: String, 
        required: true
    },
    title: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);