const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: config.env === 'development' ? false : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

// Models
const User = require('../modules/users/user.model')(sequelize);
const Vehicle = require('../modules/vehicles/vehicle.model')(sequelize);
const Driver = require('../modules/drivers/driver.model')(sequelize);
const Trip = require('../modules/trips/trip.model')(sequelize);
const MaintenanceLog = require('../modules/maintenance/maintenance.model')(sequelize);
const FuelLog = require('../modules/fuelExpense/fuel.model')(sequelize);
const Expense = require('../modules/fuelExpense/expense.model')(sequelize);

// Associations
Driver.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Driver, { foreignKey: 'userId', as: 'driver' });

Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Trip.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });
Trip.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Vehicle.hasMany(Trip, { foreignKey: 'vehicleId', as: 'trips' });
Driver.hasMany(Trip, { foreignKey: 'driverId', as: 'trips' });

MaintenanceLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Vehicle.hasMany(MaintenanceLog, { foreignKey: 'vehicleId', as: 'maintenanceLogs' });

FuelLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Vehicle.hasMany(FuelLog, { foreignKey: 'vehicleId', as: 'fuelLogs' });

Expense.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Expense.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });
Vehicle.hasMany(Expense, { foreignKey: 'vehicleId', as: 'expenses' });

module.exports = { sequelize, User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense };
