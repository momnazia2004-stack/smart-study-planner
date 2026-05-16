const express = require('express');
const router = express.Router();
// Controller se functions import kar rahe hain
const { signup, login, updatePassword } = require('../controllers/userController');

// 1. SIGNUP ROUTE
// User register karne ke liye
router.post('/signup', signup);

// 2. LOGIN ROUTE
// User login aur dashboard ke liye data fetch karne ke liye
router.post('/login', login);

// 3. FORGOT/UPDATE PASSWORD ROUTE
// Password reset logic ke liye
router.put('/update-password', updatePassword);

module.exports = router;