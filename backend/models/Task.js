const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    user: { type: String, required: true }, // User ID store karne ke liye
    title: { type: String, required: true },
    priority: { type: String, default: 'Medium' },
    hours: { type: Number, default: 0 },   // <--- Ye new field hours ke liye
    color: { type: String },               // <--- Dashboard colors ke liye
    category: { type: String, default: 'Task' },
    deadline: { type: String },
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);