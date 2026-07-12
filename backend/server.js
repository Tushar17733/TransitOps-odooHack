require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/database');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Models synced.');
    app.listen(PORT, () => console.log(`TransitOps API running on port ${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();
