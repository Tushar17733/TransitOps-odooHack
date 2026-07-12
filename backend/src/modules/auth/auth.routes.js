const router = require('express').Router();
const { register, login, me } = require('./auth.controller');
const { registerRules, loginRules } = require('./auth.validation');
const validate = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', authenticate, me);

module.exports = router;
