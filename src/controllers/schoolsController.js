const Joi = require('joi');
const models = require('../models');

// List all schools — superadmin only
async function list(req, res, next) {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const schools = await models.School.findAll({
      order: [['id', 'ASC']],
    });

    res.json({ success: true, data: schools });
  } catch (err) {
    next(err);
  }
}

// Create a new school — superadmin only
async function create(req, res, next) {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    // Validate request
    const schema = Joi.object({
      name: Joi.string().required().messages({ 'string.empty': 'Name is required' }),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const school = await models.School.create({
      name: value.name,
      address: value.address || null,
      phone: value.phone || null,
    });

    res.status(201).json({ success: true, message: 'School created successfully', data: school });
  } catch (err) {
    next(err);
  }
}

// Get school by ID — superadmin only
async function getById(req, res, next) {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const school = await models.School.findByPk(req.params.id, {
      include: [
        { model: models.User, as: 'users' },
        { model: models.Student, as: 'students' },
      ],
    });

    if (!school) return res.status(404).json({ success: false, error: 'School not found' });

    res.json({ success: true, data: school });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById };
