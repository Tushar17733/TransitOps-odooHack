const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../database');
const { jwt: jwtConfig, bcryptRounds } = require('../../config');
const AppError = require('../../utils/AppError');

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('Email already in use', 409);

  const hashed = await bcrypt.hash(password, bcryptRounds);
  const user = await User.create({ name, email, password: hashed, role });
  const { password: _, ...userOut } = user.toJSON();
  return userOut;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);
  if (user.status !== 'active') throw new AppError('Account is inactive', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  const { password: _, ...userOut } = user.toJSON();
  return { token, user: userOut };
};

module.exports = { register, login };
