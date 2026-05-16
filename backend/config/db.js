const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Ye line .env se aapki MONGO_URI uthaye gi
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected: Smart Study Planner Database");
  } catch (err) {
    console.error("Database Connection Failed ❌", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;