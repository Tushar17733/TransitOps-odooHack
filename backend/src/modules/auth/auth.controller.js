const authService = require('./auth.service');
const { success, created } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    created(res, user, 'User registered successfully');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    success(res, result, 'Login successful');
  } catch (err) { next(err); }
};

const me = (req, res) => success(res, req.user, 'Current user');

module.exports = { register, login, me };
