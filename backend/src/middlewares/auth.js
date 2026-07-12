const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config');
const AppError = require('../utils/AppError');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    // Lazy-load to avoid circular dependency at module init
    const { User } = require('../database');
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user || user.status !== 'active') {
      return next(new AppError('User not found or inactive', 401));
    }
    req.user = user;
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
};
