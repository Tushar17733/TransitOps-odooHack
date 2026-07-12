const router = require('express').Router();
const ctrl = require('./fuelExpense.controller');
const authenticate = require('../../middlewares/auth');
const { permit } = require('../../middlewares/rbac');
const { ROLES } = require('../../config/constants');
const { body } = require('express-validator');
const validate = require('../../middlewares/validate');

router.use(authenticate);

const fuelRules = [
  body('vehicleId').isInt({ min: 1 }).withMessage('Valid vehicle ID required'),
  body('liters').isFloat({ min: 0.01 }).withMessage('Liters must be > 0'),
  body('costPerLiter').isFloat({ min: 0 }).withMessage('Cost per liter must be >= 0'),
  body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('odometer').optional().isFloat({ min: 0 }),
];

const expenseRules = [
  body('vehicleId').isInt({ min: 1 }).withMessage('Valid vehicle ID required'),
  body('type').isIn(['toll', 'parking', 'other']).withMessage('Type must be toll, parking, or other'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be >= 0'),
  body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('description').optional().trim(),
  body('tripId').optional().isInt({ min: 1 }),
];

router.post('/fuel', permit(ROLES.FLEET_MANAGER, ROLES.DRIVER), fuelRules, validate, ctrl.logFuel);
router.get('/fuel/vehicle/:vehicleId', ctrl.getFuelByVehicle);
router.post('/expense', permit(ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST), expenseRules, validate, ctrl.logExpense);
router.get('/expense/vehicle/:vehicleId', ctrl.getExpensesByVehicle);

module.exports = router;
