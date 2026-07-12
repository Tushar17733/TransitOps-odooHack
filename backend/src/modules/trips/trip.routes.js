const router = require('express').Router();
const ctrl = require('./trip.controller');
const { createRules, completeRules, filterRules } = require('./trip.validation');
const validate = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { permit } = require('../../middlewares/rbac');
const { ROLES } = require('../../config/constants');

router.use(authenticate);

router.get('/mine', permit(ROLES.DRIVER), ctrl.listMine);
router.get('/', filterRules, validate, ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', permit(ROLES.FLEET_MANAGER), createRules, validate, ctrl.create);
router.patch('/:id/dispatch', permit(ROLES.FLEET_MANAGER), ctrl.dispatch);
router.patch('/:id/complete', permit(ROLES.FLEET_MANAGER), completeRules, validate, ctrl.complete);
router.patch('/:id/cancel', permit(ROLES.FLEET_MANAGER), ctrl.cancel);

module.exports = router;
