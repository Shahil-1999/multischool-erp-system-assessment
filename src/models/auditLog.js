const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    model: { type: DataTypes.STRING, allowNull: false },
    model_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    changes: { type: DataTypes.JSON, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    school_id: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    AuditLog.belongsTo(models.School, { foreignKey: 'school_id', as: 'school' });
  };

  return AuditLog;
};
