const express = require('express');
const passwordController = require('../controllers/passwordController');

const router = express.Router();

// Request password reset link
router.post('/request', passwordController.requestReset);

// Reset password using token
router.post('/reset/:token', passwordController.reset);

module.exports = router;
