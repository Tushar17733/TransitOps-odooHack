const { body } = require('express-validator');
const { MAINTENANCE_TYPES } = require('../../config/constants');

const createRules = [
  body('vehicleId').isInt({ min: 1 }).withMessage('Valid vehicle ID required'),
  body('type').isIn(MAINTENANCE_TYPES).withMessage(`Type must be: ${MAINTENANCE_TYPES.join(', ')}`),
  body('description').optional().trim(),
  body('cost').optional().isFloat({ min: 0 }),
];

const closeRules = [
  body('cost').optional().isFloat({ min: 0 }),
];

module.exports = { createRules, closeRules };
