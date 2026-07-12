const router = require('express').Router();
const ctrl = require('./driver.controller');
const { createRules, updateRules, filterRules } = require('./driver.validation');
const validate = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { permit } = require('../../middlewares/rbac');
const { ROLES } = require('../../config/constants');

router.use(authenticate);

router.get('/', filterRules, validate, ctrl.list);
router.get('/dispatchable', ctrl.listDispatchable);
router.get('/:id', ctrl.getOne);
router.post('/', permit(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER), createRules, validate, ctrl.create);
router.put('/:id', permit(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER), updateRules, validate, ctrl.update);

module.exports = router;
