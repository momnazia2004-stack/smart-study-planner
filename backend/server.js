const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. Environment variables load karna
dotenv.config();

// 2. Database (MongoDB Atlas) se connect karna
connectDB();

// 3. App Initialization
const app = express();

// 4. Middlewares
app.use(cors()); 
app.use(express.json()); 

// 5. API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes')); 
app.use('/api/goals', require('./routes/goalRoutes')); // Naya goals route yahan add kiya hai

// 6. Basic Route
app.get('/', (req, res) => {
    res.send("Smart Study Planner API is running successfully...");
});

// 7. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ Backend is ready for Evaluation!`);
});