const express = require('express');
const schoolsController = require('../controllers/schoolsController');
const auth = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/rbacMiddleware');

const router = express.Router();

// Superadmin-only routes
router.use(auth.authMiddleware);

router.get('/', requireRole('superadmin'), schoolsController.list);
router.post('/', requireRole('superadmin'), schoolsController.create);
router.get('/:id', requireRole('superadmin'), schoolsController.getById);

module.exports = router;
