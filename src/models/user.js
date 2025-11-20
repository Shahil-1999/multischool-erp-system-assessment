const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true, notEmpty: true } },
    phone: { type: DataTypes.STRING, allowNull: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    can_edit_students: { type: DataTypes.BOOLEAN, defaultValue: false },
    must_change_password: { type: DataTypes.BOOLEAN, defaultValue: false },
    reset_token: { type: DataTypes.STRING, allowNull: true },
    reset_expires: { type: DataTypes.DATE, allowNull: true },
    role_id: { type: DataTypes.INTEGER, allowNull: true },
    school_id: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
    User.belongsTo(models.School, { foreignKey: 'school_id', as: 'school' });
  };

  User.prototype.verifyPassword = function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  return User;
};
