const { sequelize } = require('../../database');
const maintenanceRepo = require('./maintenance.repository');
const vehicleRepo = require('../vehicles/vehicle.repository');
const AppError = require('../../utils/AppError');
const { VEHICLE_STATUS, MAINTENANCE_STATUS } = require('../../config/constants');

const listByVehicle = (vehicleId) => maintenanceRepo.findByVehicle(vehicleId);

const getById = async (id) => {
  const log = await maintenanceRepo.findById(id);
  if (!log) throw new AppError('Maintenance log not found', 404);
  return log;
};

const create = async (data) => {
  const vehicle = await vehicleRepo.findById(data.vehicleId);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  if (vehicle.status === VEHICLE_STATUS.RETIRED) {
    throw new AppError('Cannot create maintenance for a retired vehicle', 409);
  }

  const t = await sequelize.transaction();
  try {
    const log = await maintenanceRepo.create(
      { ...data, status: MAINTENANCE_STATUS.ACTIVE, openedAt: new Date() },
      t
    );
    await vehicleRepo.updateStatus(data.vehicleId, VEHICLE_STATUS.IN_SHOP, t);
    await t.commit();
    return maintenanceRepo.findById(log.id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const close = async (id, data = {}) => {
  const log = await getById(id);
  if (log.status === MAINTENANCE_STATUS.CLOSED) {
    throw new AppError('Maintenance log is already closed', 409);
  }

  const t = await sequelize.transaction();
  try {
    await maintenanceRepo.update(
      id,
      { status: MAINTENANCE_STATUS.CLOSED, closedAt: new Date(), ...(data.cost != null && { cost: data.cost }) },
      t
    );
    const vehicle = await vehicleRepo.findById(log.vehicleId);
    if (vehicle && vehicle.status !== VEHICLE_STATUS.RETIRED) {
      await vehicleRepo.updateStatus(log.vehicleId, VEHICLE_STATUS.AVAILABLE, t);
    }
    await t.commit();
    return maintenanceRepo.findById(id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { listByVehicle, getById, create, close };
