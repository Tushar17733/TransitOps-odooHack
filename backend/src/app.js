const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/user.routes'));
app.use('/api/v1/vehicles', require('./modules/vehicles/vehicle.routes'));
app.use('/api/v1/drivers', require('./modules/drivers/driver.routes'));
app.use('/api/v1/trips', require('./modules/trips/trip.routes'));
app.use('/api/v1/maintenance', require('./modules/maintenance/maintenance.routes'));
app.use('/api/v1/fuel-expenses', require('./modules/fuelExpense/fuelExpense.routes'));
app.use('/api/v1/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/v1/reports', require('./modules/reports/reports.routes'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);

module.exports = app;
