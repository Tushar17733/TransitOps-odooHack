const vehicleRepo = require('./vehicle.repository');
const AppError = require('../../utils/AppError');
const { VEHICLE_STATUS } = require('../../config/constants');

const list = (filters) => vehicleRepo.findAll(filters);

const getById = async (id) => {
  const v = await vehicleRepo.findById(id);
  if (!v) throw new AppError('Vehicle not found', 404);
  return v;
};

const create = async (data) => {
  const existing = await vehicleRepo.findByRegistration(data.registrationNumber);
  if (existing) throw new AppError('Registration number already exists', 409);
  return vehicleRepo.create(data);
};

const update = async (id, data) => {
  await getById(id);
  await vehicleRepo.update(id, data);
  return vehicleRepo.findById(id);
};

const retire = async (id) => {
  const v = await getById(id);
  if (v.status === VEHICLE_STATUS.ON_TRIP) {
    throw new AppError('Cannot retire a vehicle currently on trip', 409);
  }
  await vehicleRepo.update(id, { status: VEHICLE_STATUS.RETIRED });
  return vehicleRepo.findById(id);
};

const listDispatchable = () => vehicleRepo.findDispatchable();

module.exports = { list, getById, create, update, retire, listDispatchable };
