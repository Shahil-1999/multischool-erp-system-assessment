const Joi = require('joi');
const passwordService = require('../services/passwordService');

async function requestReset(req, res, next) {
  try {
    // --- Validate request ---
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email'
      }),
      baseUrl: Joi.string().uri().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.message });

    // --- Create reset token & send email ---
    const ok = await passwordService.createReset(
      value.email,
      value.baseUrl || 'http://localhost:3000'
    );

    if (!ok) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, message: 'Password reset link sent successfully' });
  } catch (err) {
    next(err);
  }
}

async function reset(req, res, next) {
  try {
    const token = decodeURIComponent(req.params.token);

    // --- Validate token and new password ---
    const schema = Joi.object({
      token: Joi.string().required().messages({
        'string.empty': 'Token is required',
        'any.required': 'Token is required'
      }),
      password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      })
    });

    const { error, value } = schema.validate({ token, ...req.body });
    if (error) return res.status(400).json({ success: false, error: error.message });

    // --- Update password using service ---
    const user = await passwordService.consumeToken(value.token, value.password);

    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { requestReset, reset };
