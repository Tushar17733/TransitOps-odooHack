const AppError = require('../utils/AppError');

const permit = (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) return next(new AppError('Unauthenticated', 401));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };

module.exports = { permit };
