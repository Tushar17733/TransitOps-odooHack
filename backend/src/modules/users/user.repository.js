const { User } = require('../../database');

const findByEmail = (email) => User.findOne({ where: { email } });
const findById = (id) => User.findByPk(id, { attributes: { exclude: ['password'] } });

module.exports = { findByEmail, findById };
