const Joi = require('joi');
const models = require('../models');
const bcrypt = require('bcrypt');
const { sendMail } = require('../email');

// Password generator: phone + name + YYYYMMDD
function genPassword(phone, name) {
  const cleanName = name.replace(/\s+/g, '');
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${phone}${cleanName}${date}`;
}

// RBAC helper: can current user manage target user
function canManageUser(reqUser, targetUser) {
  if (reqUser.role === 'superadmin') return true;
  if (reqUser.role === 'admin' && reqUser.school_id === targetUser.school_id) return true;
  if (reqUser.id === targetUser.id) return true;
  return false;
}

// Create user scoped to a school (school_id from URL param)
async function createForSchool(req, res, next) {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      role_id: Joi.number().required(),
      can_edit_students: Joi.boolean().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    await models.init();
    const { User } = models;

    const school_id = parseInt(req.params.school_id, 10);
    if (isNaN(school_id)) return res.status(400).json({ success: false, error: 'Invalid school_id' });

    // Permission check: admin can only create in their own school
    if (req.user.role === 'admin' && req.user.school_id !== school_id) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    // Generate password & hash
    const rawPassword = genPassword(value.phone, value.name);
    const password_hash = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      name: value.name,
      email: value.email,
      phone: value.phone,
      role_id: value.role_id,
      school_id,
      can_edit_students: value.can_edit_students,
      must_change_password: false,
      password_hash
    });

    // Send email with password
    await sendMail({
      to: value.email,
      subject: 'Your account password',
      text: `Your password is: ${rawPassword}`
    });

    const out = user.toJSON();
    delete out.password_hash;
    res.status(201).json({ success: true, message: 'User created', data: out });
  } catch (err) {
    next(err);
  }
}

// List users in a school (school_id from URL param)
async function listForSchool(req, res, next) {
  try {
    await models.init();
    const { User } = models;

    const school_id = parseInt(req.params.school_id, 10);
    if (isNaN(school_id)) return res.status(400).json({ success: false, error: 'Invalid school_id' });

    // Permission check
    if (
      req.user.role !== 'superadmin' &&
      !(req.user.role === 'admin' && req.user.school_id === school_id)
    ) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const users = await User.findAll({ where: { school_id } });
    const output = users.map(u => {
      const o = u.toJSON();
      delete o.password_hash;
      return o;
    });

    res.json({ success: true, data: output });
  } catch (err) {
    next(err);
  }
}

// Get single user by ID
async function getUser(req, res, next) {
  try {
    await models.init();
    const { User } = models;

    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ success: false, error: 'User not found' });

    if (!canManageUser(req.user, target)) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const out = target.toJSON();
    delete out.password_hash;
    res.json({ success: true, data: out });
  } catch (err) {
    next(err);
  }
}

// Update user info
async function updateUser(req, res, next) {
  try {
    await models.init();
    const { User } = models;

    const target = await User.findByPk(req.params.id);
    if (!target) return res.status(404).json({ success: false, error: 'User not found' });

    if (!canManageUser(req.user, target)) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const schema = Joi.object({
      name: Joi.string().optional(),
      phone: Joi.string().optional(),
      can_edit_students: Joi.boolean().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    await target.update(value);

    const out = target.toJSON();
    delete out.password_hash;
    res.json({ success: true, message: 'User updated successfully', data: out });
  } catch (err) {
    next(err);
  }
}

module.exports = { createForSchool, listForSchool, getUser, updateUser };
