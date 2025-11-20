const express = require('express');
const router = express.Router({ mergeParams: true });
const usersController = require('../controllers/usersController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Create user for a school
router.post('/', usersController.createForSchool);

// List users for a school
router.get('/', usersController.listForSchool);

// Get user by ID
router.get('/:id', usersController.getUser);

// Update user by ID
router.put('/:id', usersController.updateUser);

module.exports = router;
