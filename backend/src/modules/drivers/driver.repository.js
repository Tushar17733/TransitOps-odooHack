const { Driver, User } = require('../../database');

const findAll = (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  return Driver.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
  });
};

const findById = (id) =>
  Driver.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
  });

const findByLicense = (licenseNumber) => Driver.findOne({ where: { licenseNumber } });

const create = (data) => Driver.create(data);

const update = (id, data) => Driver.update(data, { where: { id } });

const updateStatus = (id, status, transaction) =>
  Driver.update({ status }, { where: { id }, transaction });

const findDispatchable = () =>
  Driver.findAll({ where: { status: 'available' }, order: [['name', 'ASC']] });

module.exports = { findAll, findById, findByLicense, create, update, updateStatus, findDispatchable };
