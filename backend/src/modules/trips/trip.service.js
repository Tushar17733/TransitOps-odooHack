const { sequelize } = require('../../database');
const tripRepo = require('./trip.repository');
const vehicleRepo = require('../vehicles/vehicle.repository');
const driverRepo = require('../drivers/driver.repository');
const AppError = require('../../utils/AppError');
const { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } = require('../../config/constants');

const list = (filters) => tripRepo.findAll(filters);

const getById = async (id) => {
  const trip = await tripRepo.findById(id);
  if (!trip) throw new AppError('Trip not found', 404);
  return trip;
};

const create = async (data, userId) => {
  const vehicle = await vehicleRepo.findById(data.vehicleId);
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  if (vehicle.status === VEHICLE_STATUS.RETIRED || vehicle.status === VEHICLE_STATUS.IN_SHOP) {
    throw new AppError(`Vehicle is ${vehicle.status.replace('_', ' ')} and cannot be assigned`, 409);
  }
  if (vehicle.status === VEHICLE_STATUS.ON_TRIP) {
    throw new AppError('Vehicle is already on a trip', 409);
  }

  const driver = await driverRepo.findById(data.driverId);
  if (!driver) throw new AppError('Driver not found', 404);

  if (driver.status === DRIVER_STATUS.SUSPENDED) {
    throw new AppError('Driver is suspended', 409);
  }
  if (driver.status === DRIVER_STATUS.ON_TRIP) {
    throw new AppError('Driver is already on a trip', 409);
  }
  if (new Date(driver.licenseExpiryDate) < new Date()) {
    throw new AppError('Driver license is expired', 409);
  }

  if (parseFloat(data.cargoWeight) > parseFloat(vehicle.maxLoadCapacity)) {
    throw new AppError(
      `Cargo weight (${data.cargoWeight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg)`,
      422
    );
  }

  return tripRepo.create({ ...data, createdBy: userId });
};

const dispatch = async (id) => {
  const trip = await getById(id);
  if (trip.status !== TRIP_STATUS.DRAFT) {
    throw new AppError('Only draft trips can be dispatched', 409);
  }

  const t = await sequelize.transaction();
  try {
    await tripRepo.update(id, { status: TRIP_STATUS.DISPATCHED, startTime: new Date() }, t);
    await vehicleRepo.updateStatus(trip.vehicleId, VEHICLE_STATUS.ON_TRIP, t);
    await driverRepo.updateStatus(trip.driverId, DRIVER_STATUS.ON_TRIP, t);
    await t.commit();
    return tripRepo.findById(id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const complete = async (id, data = {}) => {
  const trip = await getById(id);
  if (trip.status !== TRIP_STATUS.DISPATCHED) {
    throw new AppError('Only dispatched trips can be completed', 409);
  }

  const t = await sequelize.transaction();
  try {
    await tripRepo.update(id, {
      status: TRIP_STATUS.COMPLETED,
      endTime: new Date(),
      ...(data.actualDistance && { actualDistance: data.actualDistance }),
    }, t);
    await vehicleRepo.updateStatus(trip.vehicleId, VEHICLE_STATUS.AVAILABLE, t);
    await driverRepo.updateStatus(trip.driverId, DRIVER_STATUS.AVAILABLE, t);
    await t.commit();
    return tripRepo.findById(id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const cancel = async (id) => {
  const trip = await getById(id);
  if (trip.status === TRIP_STATUS.COMPLETED || trip.status === TRIP_STATUS.CANCELLED) {
    throw new AppError('Cannot cancel a completed or already cancelled trip', 409);
  }

  const t = await sequelize.transaction();
  try {
    await tripRepo.update(id, { status: TRIP_STATUS.CANCELLED }, t);
    if (trip.status === TRIP_STATUS.DISPATCHED) {
      await vehicleRepo.updateStatus(trip.vehicleId, VEHICLE_STATUS.AVAILABLE, t);
      await driverRepo.updateStatus(trip.driverId, DRIVER_STATUS.AVAILABLE, t);
    }
    await t.commit();
    return tripRepo.findById(id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { list, getById, create, dispatch, complete, cancel };
