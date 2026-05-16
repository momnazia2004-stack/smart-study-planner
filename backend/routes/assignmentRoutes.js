const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// 1. Nayi assignment add karne ke liye
router.post('/add', assignmentController.addAssignment);

// 2. Kisi khas user ki assignments get karne ke liye
router.get('/:userId', assignmentController.getAssignments);

// 3. Assignment update karne ke liye (Mark Done functionality)
router.put('/update/:id', assignmentController.updateAssignment);

// 4. Assignment delete karne ke liye
router.delete('/delete/:id', assignmentController.deleteAssignment);

module.exports = router;