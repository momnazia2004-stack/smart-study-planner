const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

// Saaray goals mangwanay ke liye
router.get('/:userId', goalController.getGoals);

// Naya goal add karnay ke liye
router.post('/add', goalController.addGoal);

// Goal progress update karnay ke liye
router.put('/update/:id', goalController.updateGoal);

// Goal delete karnay ke liye
router.delete('/delete/:id', goalController.deleteGoal);

module.exports = router;