const maintenanceService = require('./maintenance.service');
const { success, created } = require('../../utils/response');

const listByVehicle = async (req, res, next) => {
  try {
    const logs = await maintenanceService.listByVehicle(req.query.vehicleId);
    success(res, logs);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const log = await maintenanceService.getById(req.params.id);
    success(res, log);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const log = await maintenanceService.create(req.body);
    created(res, log, 'Maintenance log created');
  } catch (err) { next(err); }
};

const close = async (req, res, next) => {
  try {
    const log = await maintenanceService.close(req.params.id, req.body);
    success(res, log, 'Maintenance closed, vehicle restored to available');
  } catch (err) { next(err); }
};

module.exports = { listByVehicle, getOne, create, close };
