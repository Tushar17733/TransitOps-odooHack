const repo = require('./fuelExpense.repository');
const vehicleRepo = require('../vehicles/vehicle.repository');
const AppError = require('../../utils/AppError');

const logFuel = async (data, userId) => {
  const vehicle = await vehicleRepo.findById(data.vehicleId);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  const totalCost = parseFloat(data.liters) * parseFloat(data.costPerLiter);
  return repo.createFuelLog({ ...data, totalCost, createdBy: userId });
};

const logExpense = async (data, userId) => {
  const vehicle = await vehicleRepo.findById(data.vehicleId);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  return repo.createExpense({ ...data, createdBy: userId });
};

const getFuelByVehicle = (vehicleId) => repo.findFuelByVehicle(vehicleId);
const getExpensesByVehicle = (vehicleId) => repo.findExpensesByVehicle(vehicleId);

module.exports = { logFuel, logExpense, getFuelByVehicle, getExpensesByVehicle };
