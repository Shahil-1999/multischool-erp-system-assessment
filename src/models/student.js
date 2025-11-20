const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'students',
    timestamps: true,
    underscored: true,
  });

  Student.associate = (models) => {
    Student.belongsTo(models.School, { foreignKey: 'school_id', as: 'school' });
  };

  return Student;
};
