const { DataTypes } = require('sequelize');
const { VEHICLE_STATUS, VEHICLE_TYPES } = require('../../config/constants');

module.exports = (sequelize) => {
  return sequelize.define('Vehicle', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    registrationNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    model: { type: DataTypes.STRING(100) },
    type: { type: DataTypes.STRING(50), allowNull: false },
    maxLoadCapacity: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    odometer: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    acquisitionCost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: VEHICLE_STATUS.AVAILABLE,
    },
    region: { type: DataTypes.STRING(100) },
  }, { tableName: 'vehicles', timestamps: true });
};
