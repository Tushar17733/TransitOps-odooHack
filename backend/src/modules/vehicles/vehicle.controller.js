const vehicleService = require('./vehicle.service');
const { success, created } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.list(req.query);
    success(res, vehicles);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getById(req.params.id);
    success(res, vehicle);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.create(req.body);
    created(res, vehicle);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.update(req.params.id, req.body);
    success(res, vehicle, 'Vehicle updated');
  } catch (err) { next(err); }
};

const retire = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.retire(req.params.id);
    success(res, vehicle, 'Vehicle retired');
  } catch (err) { next(err); }
};

const listDispatchable = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.listDispatchable();
    success(res, vehicles);
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, retire, listDispatchable };
