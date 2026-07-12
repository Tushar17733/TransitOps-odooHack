const driverService = require('./driver.service');
const { success, created } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const drivers = await driverService.list(req.query);
    success(res, drivers);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const driver = await driverService.getById(req.params.id);
    success(res, driver);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const driver = await driverService.create(req.body);
    created(res, driver);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const driver = await driverService.update(req.params.id, req.body, req.user);
    success(res, driver, 'Driver updated');
  } catch (err) { next(err); }
};

const listDispatchable = async (req, res, next) => {
  try {
    const drivers = await driverService.listDispatchable();
    success(res, drivers);
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, listDispatchable };
