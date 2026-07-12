const { Vehicle, FuelLog, Expense, MaintenanceLog, Trip, sequelize } = require('../../database');
const { fn, col, literal } = require('sequelize');

// TODO: Add date-range filters (startDate, endDate) to all reports

const fuelEfficiency = async () => {
  return FuelLog.findAll({
    attributes: [
      'vehicleId',
      [fn('SUM', col('liters')), 'totalLiters'],
      [fn('SUM', col('totalCost')), 'totalFuelCost'],
      [fn('COUNT', col('FuelLog.id')), 'fillUps'],
    ],
    group: ['vehicleId', 'vehicle.id', 'vehicle.registrationNumber', 'vehicle.name'],
    include: [{ association: 'vehicle', attributes: ['id', 'registrationNumber', 'name'] }],
    raw: false,
  });
};

const operationalCost = async () => {
  // TODO: Aggregate fuel + maintenance + expenses per vehicle
  // Hint: Use Promise.all with three grouped queries and merge by vehicleId
  return { message: 'TODO: operational cost report — aggregate FuelLog + MaintenanceLog + Expense per vehicle' };
};

const fleetUtilization = async () => {
  // TODO: Count trips per vehicle, compute active days vs calendar days
  return { message: 'TODO: fleet utilization report — trips per vehicle, utilization %' };
};

const vehicleROI = async () => {
  // TODO: acquisitionCost / (revenue proxy or saved cost estimate) — needs Trip + cost data
  return { message: 'TODO: vehicle ROI — acquisitionCost vs total operational cost' };
};

module.exports = { fuelEfficiency, operationalCost, fleetUtilization, vehicleROI };
