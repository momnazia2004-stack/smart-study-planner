const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    val: { type: String, required: true }, // Frontend ka "2 / 10" store karega
    p: { type: Number, default: 0 },       // Frontend ki percentage store karega
    type: { type: String, enum: ['weekly', 'monthly'], default: 'weekly' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);