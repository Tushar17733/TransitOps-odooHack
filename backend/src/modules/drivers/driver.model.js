const { DataTypes } = require('sequelize');
const { DRIVER_STATUS } = require('../../config/constants');

module.exports = (sequelize) => {
  return sequelize.define('Driver', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    licenseNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    licenseCategory: { type: DataTypes.STRING(20) },
    licenseExpiryDate: { type: DataTypes.DATEONLY, allowNull: false },
    contactNumber: { type: DataTypes.STRING(20) },
    safetyScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 100.00 },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: DRIVER_STATUS.AVAILABLE,
    },
    userId: { type: DataTypes.INTEGER, allowNull: true },
  }, { tableName: 'drivers', timestamps: true });
};
