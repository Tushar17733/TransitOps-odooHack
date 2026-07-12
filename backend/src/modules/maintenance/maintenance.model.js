const { DataTypes } = require('sequelize');
const { MAINTENANCE_TYPES, MAINTENANCE_STATUS } = require('../../config/constants');

module.exports = (sequelize) => {
  return sequelize.define('MaintenanceLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM(...MAINTENANCE_TYPES), allowNull: false },
    description: { type: DataTypes.TEXT },
    cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: {
      type: DataTypes.ENUM(...Object.values(MAINTENANCE_STATUS)),
      allowNull: false,
      defaultValue: MAINTENANCE_STATUS.ACTIVE,
    },
    openedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    closedAt: { type: DataTypes.DATE },
  }, { tableName: 'maintenance_logs', timestamps: true });
};
