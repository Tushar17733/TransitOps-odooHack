const { Trip, Vehicle, Driver, User } = require('../../database');

const includes = [
  { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'name', 'type'] },
  { model: Driver, as: 'driver', attributes: ['id', 'name', 'licenseNumber'] },
  { model: User, as: 'creator', attributes: ['id', 'name'] },
];

const findAll = (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.vehicleId) where.vehicleId = filters.vehicleId;
  if (filters.driverId) where.driverId = filters.driverId;
  return Trip.findAll({ where, include: includes, order: [['createdAt', 'DESC']] });
};

const findById = (id) => Trip.findByPk(id, { include: includes });

const create = (data, transaction) => Trip.create(data, { transaction });

const update = (id, data, transaction) =>
  Trip.update(data, { where: { id }, transaction });

module.exports = { findAll, findById, create, update };
