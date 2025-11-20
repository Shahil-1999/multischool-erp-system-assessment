const Joi = require('joi');
const models = require('../models');

// Helper: check if user can edit students
function hasEditPermission(req, studentSchoolId) {
  console.log(req.user, studentSchoolId)
  if (req.user.role === 'superadmin') return true;
  if ((req.user.role === 'admin' || req.user.role === 'user') && req.user.can_edit_students && req.user.school_id === studentSchoolId) return true;
  return false;
}

// Create a student
async function createStudent(req, res, next) {
  try {
    const school_id = parseInt(req.params.school_id, 10);

    if (!hasEditPermission(req, school_id)) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const schema = Joi.object({
      name: Joi.string().required(),
      dob: Joi.date().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const student = await models.Student.create({
      name: value.name,
      dob: value.dob,
      school_id
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

// List students in a school
async function listStudents(req, res, next) {
  try {
    const school_id = parseInt(req.params.school_id, 10);

    // Only superadmin can list any school; others only their own school
    if (req.user.role !== 'superadmin' && req.user.school_id !== school_id) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const students = await models.Student.findAll({ where: { school_id } });
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
}

// Get student by ID
async function getStudent(req, res, next) {
  try {
    const school_id = parseInt(req.params.school_id, 10);
    const student = await models.Student.findByPk(req.params.id);

    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    if (req.user.role !== 'superadmin' && student.school_id !== school_id) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

// Update student
async function updateStudent(req, res, next) {
  try {
    const school_id = parseInt(req.params.school_id, 10);
    const student = await models.Student.findByPk(req.params.id);

    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    console.log(hasEditPermission(req, school_id), school_id)
    if (!hasEditPermission(req, school_id)) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const schema = Joi.object({
      name: Joi.string().optional(),
      dob: Joi.date().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    await student.update(value);
    res.json({ success: true, message: 'Student updated successfully', data: student });
  } catch (err) {
    next(err);
  }
}

// Delete student
async function deleteStudent(req, res, next) {
  try {
    const school_id = parseInt(req.params.school_id, 10);
    const student = await models.Student.findByPk(req.params.id);

    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    if (!hasEditPermission(req, school_id)) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    await student.destroy();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createStudent, listStudents, getStudent, updateStudent, deleteStudent };
