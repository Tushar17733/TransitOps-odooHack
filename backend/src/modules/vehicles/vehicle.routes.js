const router = require('express').Router();
const ctrl = require('./vehicle.controller');
const { createRules, updateRules, filterRules } = require('./vehicle.validation');
const validate = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { permit } = require('../../middlewares/rbac');
const { ROLES } = require('../../config/constants');

router.use(authenticate);

router.get('/', filterRules, validate, ctrl.list);
router.get('/dispatchable', ctrl.listDispatchable);
router.get('/:id', ctrl.getOne);
router.post('/', permit(ROLES.FLEET_MANAGER), createRules, validate, ctrl.create);
router.put('/:id', permit(ROLES.FLEET_MANAGER), updateRules, validate, ctrl.update);
router.patch('/:id/retire', permit(ROLES.FLEET_MANAGER), ctrl.retire);

module.exports = router;
