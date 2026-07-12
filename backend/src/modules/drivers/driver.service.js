const driverRepo = require('./driver.repository');
const AppError = require('../../utils/AppError');
const { ROLES } = require('../../config/constants');

const list = (filters) => driverRepo.findAll(filters);

const getById = async (id) => {
  const d = await driverRepo.findById(id);
  if (!d) throw new AppError('Driver not found', 404);
  return d;
};

const create = async (data) => {
  const existing = await driverRepo.findByLicense(data.licenseNumber);
  if (existing) throw new AppError('License number already registered', 409);
  return driverRepo.create(data);
};

const update = async (id, data, requestingUser) => {
  await getById(id);
  if (data.safetyScore !== undefined && requestingUser.role !== ROLES.SAFETY_OFFICER) {
    throw new AppError('Only Safety Officers can update safety scores', 403);
  }
  await driverRepo.update(id, data);
  return driverRepo.findById(id);
};

const listDispatchable = () => driverRepo.findDispatchable();

module.exports = { list, getById, create, update, listDispatchable };
