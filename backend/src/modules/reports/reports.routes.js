const router = require('express').Router();
const ctrl = require('./reports.controller');
const authenticate = require('../../middlewares/auth');
const { permit } = require('../../middlewares/rbac');
const { ROLES } = require('../../config/constants');

router.use(authenticate);
router.use(permit(ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST));

router.get('/fuel-efficiency', ctrl.fuelEfficiency);
router.get('/operational-cost', ctrl.operationalCost);
router.get('/fleet-utilization', ctrl.fleetUtilization);
router.get('/vehicle-roi', ctrl.vehicleROI);

module.exports = router;
