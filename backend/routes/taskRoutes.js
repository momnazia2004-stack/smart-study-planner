const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 1. Task Save Karne ka Route
router.post('/add', async (req, res) => {
    try {
        const { user, title, priority, deadline, hours, color, category } = req.body;
        const newTask = new Task({ 
            user, 
            title, 
            priority, 
            deadline, 
            hours, 
            color, 
            category: category || 'Task',
            status: 'Pending'
        });
        await newTask.save();
        res.status(201).json({ message: "Task saved successfully!", task: newTask });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Dashboard Stats Route (Counts + FIXED Weekly Chart Data)
router.get('/stats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const todayStr = new Date().toISOString().split('T')[0];

        // Basic Counts
        const tasksToday = await Task.countDocuments({ user: userId, deadline: todayStr });
        const completedCount = await Task.countDocuments({ user: userId, status: 'Completed' });
        const pendingCount = await Task.countDocuments({ user: userId, status: 'Pending' });

        // Chart Data Calculation
        const allCompletedTasks = await Task.find({ user: userId, status: 'Completed' });
        const weeklyHours = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        let totalWeeklyTime = 0;

        allCompletedTasks.forEach(task => {
            if (task.deadline) {
                // FIXED: String split logic taake timezone ki wajah se date na badle
                const [year, month, day] = task.deadline.split('-');
                const date = new Date(year, month - 1, day); 
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                if (weeklyHours[dayName] !== undefined) {
                    weeklyHours[dayName] += task.hours;
                    totalWeeklyTime += task.hours;
                }
            }
        });

        res.status(200).json({
            tasksToday,
            completed: completedCount,
            pending: pendingCount,
            totalStudyTime: totalWeeklyTime,
            chartData: weeklyHours
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. User ke mutabiq Tasks fetch karna
router.get('/:userId', async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.params.userId });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Task Status Update (Complete)
router.put('/complete/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { status: 'Completed' }, 
            { new: true }
        );
        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Task Delete
router.delete('/delete/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;