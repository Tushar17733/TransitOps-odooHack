const { DataTypes } = require('sequelize');
const { EXPENSE_TYPES } = require('../../config/constants');

module.exports = (sequelize) => {
  return sequelize.define('Expense', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    tripId: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.STRING(50), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    description: { type: DataTypes.TEXT },
    createdBy: { type: DataTypes.INTEGER },
  }, { tableName: 'expenses', timestamps: true });
};
