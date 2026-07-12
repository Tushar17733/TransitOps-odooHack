const { FuelLog, Expense } = require('../../database');

const findFuelByVehicle = (vehicleId) =>
  FuelLog.findAll({ where: { vehicleId }, order: [['date', 'DESC']] });

const findExpensesByVehicle = (vehicleId) =>
  Expense.findAll({ where: { vehicleId }, order: [['date', 'DESC']] });

const createFuelLog = (data) => FuelLog.create(data);
const createExpense = (data) => Expense.create(data);

module.exports = { findFuelByVehicle, findExpensesByVehicle, createFuelLog, createExpense };
