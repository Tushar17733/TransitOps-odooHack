const router = require('express').Router();
const ctrl = require('./dashboard.controller');
const authenticate = require('../../middlewares/auth');

router.use(authenticate);
router.get('/kpis', ctrl.getKPIs);

module.exports = router;
