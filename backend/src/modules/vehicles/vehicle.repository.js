const { Vehicle } = require('../../database');
const { Op } = require('sequelize');

const findAll = (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.region) where.region = { [Op.like]: `%${filters.region}%` };
  return Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
};

const findById = (id) => Vehicle.findByPk(id);

const findByRegistration = (registrationNumber) =>
  Vehicle.findOne({ where: { registrationNumber } });

const create = (data) => Vehicle.create(data);

const update = (id, data) => Vehicle.update(data, { where: { id } });

const updateStatus = (id, status, transaction) =>
  Vehicle.update({ status }, { where: { id }, transaction });

const findDispatchable = () =>
  Vehicle.findAll({ where: { status: 'available' }, order: [['name', 'ASC']] });

module.exports = { findAll, findById, findByRegistration, create, update, updateStatus, findDispatchable };
