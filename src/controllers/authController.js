const Joi = require('joi');
const models = require('../models');
const auth = require('../middlewares/authMiddleware');
const bcrypt = require('bcrypt');

async function login(req, res, next) {
  try {
    // --- Validate request ---
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email'
      }),
      password: Joi.string().required().messages({
        'string.empty': 'Password is required'
      }),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.message });

    // --- Find user ---
    const user = await models.User.findOne({ where: { email: value.email } });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    // --- Compare password ---
    const validPassword = await bcrypt.compare(value.password, user.password_hash);
    if (!validPassword) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    // --- Get role ---
    const roleObj = await user.getRole();
    const role = roleObj ? roleObj.name : 'user';

    // --- Sign JWT ---
    const token = auth.sign({
      id: user.id,
      role,
      school_id: user.school_id,
      can_edit_students: user.can_edit_students
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        must_change_password: user.must_change_password || false,
        role,
        school_id: user.school_id
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
