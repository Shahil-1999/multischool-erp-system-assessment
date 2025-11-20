const { sequelize } = require('../db');

const RoleModel = require('./role');
const SchoolModel = require('./school');
const UserModel = require('./user');
const StudentModel = require('./student');
const AuditLogModel = require('./auditLog');

// Initialize models
const Role = RoleModel(sequelize);
const School = SchoolModel(sequelize);
const User = UserModel(sequelize);
const Student = StudentModel(sequelize);
const AuditLog = AuditLogModel(sequelize);

// Call associate functions
[Role, School, User, Student, AuditLog].forEach(model => {
  if (model.associate) model.associate({ Role, School, User, Student, AuditLog });
});

function init(options = { alter: true }) {
  return sequelize.sync(options);
}

module.exports = { sequelize, Role, School, User, Student, AuditLog, init };
