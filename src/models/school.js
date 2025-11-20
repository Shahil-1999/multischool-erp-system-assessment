const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const School = sequelize.define('School', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    address: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'schools',
    timestamps: true,
    underscored: true,  // created_at, updated_at, deleted_at
  });

  School.associate = (models) => {
    School.hasMany(models.User, { foreignKey: 'school_id', as: 'users' });
    School.hasMany(models.Student, { foreignKey: 'school_id', as: 'students' });
  };

  return School;
};
