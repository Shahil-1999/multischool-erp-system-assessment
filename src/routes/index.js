const express = require('express');
const authRoutes = require('./authRoutes');
const schoolRoutes = require('./schoolRoutes');
const userRoutes = require('./userRoutes');
const studentRoutes = require('./studentRoutes');
const passwordRoutes = require('./passwordRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/password', passwordRoutes);
router.use('/schools', schoolRoutes);
router.use('/', userRoutes);     // users endpoints
router.use('/', studentRoutes);  // students endpoints

module.exports = router;
