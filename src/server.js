require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');

// Routes
const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/password');
const schoolRoutes = require('./routes/schools');
const usersRouter = require('./routes/users');       // school-scoped users
const studentsRouter = require('./routes/students'); // school-scoped students

// Middleware
const { authMiddleware } = require('./middlewares/authMiddleware');

const app = express();
app.use(express.json());

// ------------------ Public routes ------------------
app.use('/auth', authRoutes);
app.use('/auth/password', passwordRoutes);

// ------------------ Protected routes ------------------
app.use(authMiddleware);

// ------------------ Schools ------------------
// CRUD for schools (superadmin only)
app.use('/schools', schoolRoutes);
app.use('/api/schools', schoolRoutes);

// ------------------ School-scoped users ------------------
app.use('/schools/:school_id/users', usersRouter);
app.use('/api/schools/:school_id/users', usersRouter);

// ------------------ School-scoped students ------------------
app.use('/schools/:school_id/students', studentsRouter);
app.use('/api/schools/:school_id/students', studentsRouter);

// ------------------ Users by ID ------------------
// Optional: general user routes (not school-scoped)
// app.use('/users', generalUserRouter);

// ------------------ Change own password ------------------
app.post(['/users/change-password', '/api/users/change-password'], async (req, res, next) => {
  try {
    const Joi = require('joi');
    const schema = Joi.object({ password: Joi.string().min(6).required() });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const models = require('./models');
    await models.init();

    const user = await models.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hash = await bcrypt.hash(value.password, 10);
    await user.update({ password_hash: hash, must_change_password: false });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

// ------------------ Global error handler ------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
