const router = require('express').Router();
const ctrl = require('./maintenance.controller');
const { createRules, closeRules } = require('./maintenance.validation');
const validate = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { permit } = require('../../middlewares/rbac');
const { ROLES } = require('../../config/constants');

router.use(authenticate);

router.get('/', ctrl.listByVehicle);
router.get('/:id', ctrl.getOne);
router.post('/', permit(ROLES.FLEET_MANAGER), createRules, validate, ctrl.create);
router.patch('/:id/close', permit(ROLES.FLEET_MANAGER), closeRules, validate, ctrl.close);

module.exports = router;
