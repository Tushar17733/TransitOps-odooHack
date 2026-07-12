const { body, query } = require('express-validator');
const { VEHICLE_TYPES, VEHICLE_STATUS } = require('../../config/constants');

const createRules = [
  body('registrationNumber').trim().notEmpty().withMessage('Registration number required'),
  body('name').trim().notEmpty().withMessage('Vehicle name required'),
  body('type').isIn(VEHICLE_TYPES).withMessage(`Type must be one of: ${VEHICLE_TYPES.join(', ')}`),
  body('maxLoadCapacity').isFloat({ min: 0 }).withMessage('Max load capacity must be >= 0'),
  body('acquisitionCost').optional().isFloat({ min: 0 }),
  body('odometer').optional().isFloat({ min: 0 }),
  body('region').optional().trim(),
  body('model').optional().trim(),
];

const updateRules = [
  body('name').optional().trim().notEmpty(),
  body('type').optional().isIn(VEHICLE_TYPES),
  body('maxLoadCapacity').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(Object.values(VEHICLE_STATUS)),
  body('region').optional().trim(),
  body('odometer').optional().isFloat({ min: 0 }),
];

const filterRules = [
  query('status').optional().isIn(Object.values(VEHICLE_STATUS)),
  query('type').optional().isIn(VEHICLE_TYPES),
  query('region').optional().trim(),
];

module.exports = { createRules, updateRules, filterRules };
