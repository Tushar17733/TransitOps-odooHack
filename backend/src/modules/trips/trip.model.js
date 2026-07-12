const { DataTypes } = require('sequelize');
const { TRIP_STATUS } = require('../../config/constants');

module.exports = (sequelize) => {
  return sequelize.define('Trip', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    source: { type: DataTypes.STRING(200), allowNull: false },
    destination: { type: DataTypes.STRING(200), allowNull: false },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    driverId: { type: DataTypes.INTEGER, allowNull: false },
    cargoWeight: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    plannedDistance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    actualDistance: { type: DataTypes.DECIMAL(10, 2) },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: TRIP_STATUS.DRAFT,
    },
    startTime: { type: DataTypes.DATE },
    endTime: { type: DataTypes.DATE },
    notes: { type: DataTypes.TEXT },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'trips', timestamps: true });
};
