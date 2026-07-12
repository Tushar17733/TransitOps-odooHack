const router = require('express').Router();
const authenticate = require('../../middlewares/auth');
const { permit } = require('../../middlewares/rbac');
const { ROLES } = require('../../config/constants');
const { User } = require('../../database');
const { success } = require('../../utils/response');

router.get('/', authenticate, permit(ROLES.FLEET_MANAGER), async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    success(res, users);
  } catch (err) { next(err); }
});

module.exports = router;
