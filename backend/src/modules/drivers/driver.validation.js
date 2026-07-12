const { body, query } = require('express-validator');
const { DRIVER_STATUS } = require('../../config/constants');

const createRules = [
  body('name').trim().notEmpty().withMessage('Driver name required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number required'),
  body('licenseCategory').optional().trim(),
  body('licenseExpiryDate').isDate().withMessage('Valid license expiry date required (YYYY-MM-DD)'),
  body('contactNumber').optional().trim(),
  body('safetyScore').optional().isFloat({ min: 0, max: 100 }),
  body('userId').optional().isInt(),
];

const updateRules = [
  body('name').optional().trim().notEmpty(),
  body('licenseExpiryDate').optional().isDate(),
  body('contactNumber').optional().trim(),
  body('status').optional().isIn(Object.values(DRIVER_STATUS)),
  body('safetyScore').optional().isFloat({ min: 0, max: 100 }),
];

const filterRules = [
  query('status').optional().isIn(Object.values(DRIVER_STATUS)),
];

module.exports = { createRules, updateRules, filterRules };
