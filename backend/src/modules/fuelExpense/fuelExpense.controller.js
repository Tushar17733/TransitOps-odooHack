const service = require('./fuelExpense.service');
const { success, created } = require('../../utils/response');

const logFuel = async (req, res, next) => {
  try {
    const log = await service.logFuel(req.body, req.user.id);
    created(res, log, 'Fuel log created');
  } catch (err) { next(err); }
};

const logExpense = async (req, res, next) => {
  try {
    const expense = await service.logExpense(req.body, req.user.id);
    created(res, expense, 'Expense logged');
  } catch (err) { next(err); }
};

const getFuelByVehicle = async (req, res, next) => {
  try {
    const logs = await service.getFuelByVehicle(req.params.vehicleId);
    success(res, logs);
  } catch (err) { next(err); }
};

const getExpensesByVehicle = async (req, res, next) => {
  try {
    const expenses = await service.getExpensesByVehicle(req.params.vehicleId);
    success(res, expenses);
  } catch (err) { next(err); }
};

module.exports = { logFuel, logExpense, getFuelByVehicle, getExpensesByVehicle };
