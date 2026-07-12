const reportsService = require('./reports.service');
const { success } = require('../../utils/response');

const fuelEfficiency = async (req, res, next) => {
  try {
    const data = await reportsService.fuelEfficiency();
    success(res, data, 'Fuel efficiency report');
  } catch (err) { next(err); }
};

const operationalCost = async (req, res, next) => {
  try {
    const data = await reportsService.operationalCost();
    success(res, data, 'Operational cost report');
  } catch (err) { next(err); }
};

const fleetUtilization = async (req, res, next) => {
  try {
    const data = await reportsService.fleetUtilization();
    success(res, data, 'Fleet utilization report');
  } catch (err) { next(err); }
};

const vehicleROI = async (req, res, next) => {
  try {
    const data = await reportsService.vehicleROI();
    success(res, data, 'Vehicle ROI report');
  } catch (err) { next(err); }
};

module.exports = { fuelEfficiency, operationalCost, fleetUtilization, vehicleROI };
