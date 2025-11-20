const express = require('express');
const router = express.Router({ mergeParams: true }); // important for school_id
const studentsController = require('../controllers/studentsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Middleware: all routes require authentication
router.use(authMiddleware);

// Create a student in a school
router.post('/', studentsController.createStudent);

// List students in a school
router.get('/', studentsController.listStudents);

// Get a student by ID (not school-scoped)
router.get('/:id', studentsController.getStudent);

// Update a student by ID
router.put('/:id', studentsController.updateStudent);

// Delete a student by ID
router.delete('/:id', studentsController.deleteStudent);

module.exports = router;
