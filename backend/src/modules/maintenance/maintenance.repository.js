const { MaintenanceLog, Vehicle } = require('../../database');

const findByVehicle = (vehicleId) =>
  MaintenanceLog.findAll({
    where: { vehicleId },
    include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'name'] }],
    order: [['createdAt', 'DESC']],
  });

const findById = (id) =>
  MaintenanceLog.findByPk(id, {
    include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'name'] }],
  });

const create = (data, transaction) => MaintenanceLog.create(data, { transaction });

const update = (id, data, transaction) =>
  MaintenanceLog.update(data, { where: { id }, transaction });

module.exports = { findByVehicle, findById, create, update };
