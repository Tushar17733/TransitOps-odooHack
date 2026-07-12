require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/database');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 3000;

async function seedDemoUsers() {
  const { User } = require('./src/database');
  const demos = [
    { name: 'Fleet Manager',    email: 'fleet@transitops.com',   password: 'fleet123',   role: 'fleet_manager' },
    { name: 'Safety Officer',   email: 'safety@transitops.com',  password: 'safety123',  role: 'safety_officer' },
    { name: 'Finance Analyst',  email: 'finance@transitops.com', password: 'finance123', role: 'financial_analyst' },
    { name: 'John Driver',      email: 'driver@transitops.com',  password: 'driver123',  role: 'driver' },
  ];
  for (const u of demos) {
    const exists = await User.findOne({ where: { email: u.email } });
    if (!exists) {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hashed, status: 'active' });
      console.log(`Demo user seeded: ${u.email} (${u.role})`);
    }
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync({ alter: true });
    console.log('Models synced.');
    await seedDemoUsers();
    const server = app.listen(PORT, '0.0.0.0', () => console.log(`TransitOps API running on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Run this to fix it:  npx kill-port ${PORT}\n`);
      } else {
        console.error(err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();
