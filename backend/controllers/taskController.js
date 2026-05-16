const Task = require('../models/Task');

// 1. Naya Task Add Karna
exports.addTask = async (req, res) => {
    try {
        const { user, title, priority, deadline, hours, color } = req.body;
        
        const newTask = new Task({
            user,
            title,
            priority,
            deadline,
            hours,
            color,
            status: 'Pending'
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: "Task save nahi ho saka", error: error.message });
    }
};

// 2. User ke mutabiq Tasks fetch karna (Filters ke liye bhi yahi use hoga)
exports.getTasks = async (req, res) => {
    try {
        const { userId } = req.params;
        const { priority } = req.query; // Frontend se ?priority=high pass karein ge

        let query = { user: userId };
        if (priority && priority !== 'All') {
            query.priority = priority;
        }

        const tasks = await Task.find(query).sort({ deadline: 1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Tasks fetch nahi ho sakay", error: error.message });
    }
};

// 3. Dashboard Stats (Today's Task, Completed, Pending)
exports.getDashboardStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const stats = {
            tasksToday: await Task.countDocuments({ 
                user: userId, 
                deadline: { $gte: startOfToday, $lte: endOfToday } 
            }),
            completed: await Task.countDocuments({ user: userId, status: 'Completed' }),
            pending: await Task.countDocuments({ user: userId, status: 'Pending' })
        };

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: "Stats fetch fail", error: error.message });
    }
};

// 4. Task Complete Mark Karna aur Hours update ka flow
exports.completeTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { status: 'Completed' }, 
            { new: true }
        );
        // Note: Frontend par jab iska response aye ga, tab hum Progress chart update karein ge.
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Status update fail", error: error.message });
    }
};

// 5. Task Delete Karna
exports.deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Task delete ho gaya" });
    } catch (error) {
        res.status(500).json({ message: "Delete error", error: error.message });
    }
};