const { body, query } = require('express-validator');
const { TRIP_STATUS } = require('../../config/constants');

const createRules = [
  body('source').trim().notEmpty().withMessage('Source required'),
  body('destination').trim().notEmpty().withMessage('Destination required'),
  body('vehicleId').isInt({ min: 1 }).withMessage('Valid vehicle ID required'),
  body('driverId').isInt({ min: 1 }).withMessage('Valid driver ID required'),
  body('cargoWeight').isFloat({ min: 0 }).withMessage('Cargo weight must be >= 0'),
  body('plannedDistance').optional().isFloat({ min: 0 }),
  body('notes').optional().trim(),
];

const completeRules = [
  body('actualDistance').optional().isFloat({ min: 0 }),
];

const filterRules = [
  query('status').optional().isIn(Object.values(TRIP_STATUS)),
  query('vehicleId').optional().isInt(),
  query('driverId').optional().isInt(),
];

module.exports = { createRules, completeRules, filterRules };
