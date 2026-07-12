const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FuelLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    liters: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    costPerLiter: { type: DataTypes.DECIMAL(10, 4), allowNull: false },
    totalCost: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    odometer: { type: DataTypes.DECIMAL(10, 2) },
    createdBy: { type: DataTypes.INTEGER },
  }, { tableName: 'fuel_logs', timestamps: true });
};
