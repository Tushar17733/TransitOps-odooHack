const { Vehicle, FuelLog, Expense, MaintenanceLog, Trip, sequelize } = require('../../database');
const { fn, col } = require('sequelize');

const fuelEfficiency = async () => {
  const results = await FuelLog.findAll({
    attributes: [
      'vehicleId',
      [fn('SUM', col('liters')),    'totalLiters'],
      [fn('SUM', col('totalCost')), 'totalFuelCost'],
      [fn('COUNT', col('FuelLog.id')), 'fillUps'],
      [fn('AVG', col('costPerLiter')), 'avgCostPerLiter'],
    ],
    group: ['FuelLog.vehicleId', 'vehicle.id'],
    include: [{ association: 'vehicle', attributes: ['id', 'registrationNumber', 'name', 'type'] }],
  });
  return results;
};

const operationalCost = async () => {
  const [fuelRows]  = await sequelize.query(`SELECT vehicleId, COALESCE(SUM(totalCost),0) as fuelCost, COUNT(*) as fillUps FROM fuel_logs GROUP BY vehicleId`);
  const [maintRows] = await sequelize.query(`SELECT vehicleId, COALESCE(SUM(cost),0) as maintenanceCost, COUNT(*) as maintenanceCount FROM maintenance_logs WHERE status='closed' GROUP BY vehicleId`);
  const [expRows]   = await sequelize.query(`SELECT vehicleId, COALESCE(SUM(amount),0) as expenseCost, COUNT(*) as expenseCount FROM expenses GROUP BY vehicleId`);

  const vehicles = await Vehicle.findAll({
    attributes: ['id', 'registrationNumber', 'name', 'type', 'status'],
  });

  return vehicles.map(v => {
    const fuel  = fuelRows.find(r => r.vehicleId === v.id)  || {};
    const maint = maintRows.find(r => r.vehicleId === v.id) || {};
    const exp   = expRows.find(r => r.vehicleId === v.id)   || {};
    const fuelCost        = parseFloat(fuel.fuelCost)        || 0;
    const maintenanceCost = parseFloat(maint.maintenanceCost)|| 0;
    const expenseCost     = parseFloat(exp.expenseCost)      || 0;
    return {
      vehicle: { id: v.id, registrationNumber: v.registrationNumber, name: v.name, type: v.type },
      fuelCost,
      maintenanceCost,
      expenseCost,
      totalCost: fuelCost + maintenanceCost + expenseCost,
      fillUps:          parseInt(fuel.fillUps)           || 0,
      maintenanceCount: parseInt(maint.maintenanceCount) || 0,
      expenseCount:     parseInt(exp.expenseCount)       || 0,
    };
  });
};

const fleetUtilization = async () => {
  const [tripStats] = await sequelize.query(`
    SELECT
      vehicleId,
      COUNT(*)                                                         AS totalTrips,
      SUM(CASE WHEN status='completed'  THEN 1 ELSE 0 END)            AS completedTrips,
      SUM(CASE WHEN status='cancelled'  THEN 1 ELSE 0 END)            AS cancelledTrips,
      SUM(CASE WHEN status='dispatched' THEN 1 ELSE 0 END)            AS activeTrips,
      COALESCE(SUM(actualDistance), SUM(plannedDistance), 0)          AS totalDistance
    FROM trips GROUP BY vehicleId
  `);

  const vehicles = await Vehicle.findAll({
    attributes: ['id', 'registrationNumber', 'name', 'type', 'status'],
  });

  return vehicles.map(v => {
    const s         = tripStats.find(t => t.vehicleId === v.id) || {};
    const total     = parseInt(s.totalTrips)     || 0;
    const completed = parseInt(s.completedTrips) || 0;
    return {
      vehicle: { id: v.id, registrationNumber: v.registrationNumber, name: v.name, type: v.type, status: v.status },
      totalTrips:     total,
      completedTrips: completed,
      cancelledTrips: parseInt(s.cancelledTrips) || 0,
      activeTrips:    parseInt(s.activeTrips)    || 0,
      totalDistance:  parseFloat(s.totalDistance)|| 0,
      utilizationRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });
};

const vehicleROI = async () => {
  const [fuelRows]  = await sequelize.query(`SELECT vehicleId, COALESCE(SUM(totalCost),0) as fuelCost FROM fuel_logs GROUP BY vehicleId`);
  const [maintRows] = await sequelize.query(`SELECT vehicleId, COALESCE(SUM(cost),0) as maintenanceCost FROM maintenance_logs WHERE status='closed' GROUP BY vehicleId`);
  const [expRows]   = await sequelize.query(`SELECT vehicleId, COALESCE(SUM(amount),0) as expenseCost FROM expenses GROUP BY vehicleId`);

  const vehicles = await Vehicle.findAll({
    attributes: ['id', 'registrationNumber', 'name', 'type', 'acquisitionCost'],
  });

  return vehicles.map(v => {
    const fuel  = fuelRows.find(r => r.vehicleId === v.id)  || {};
    const maint = maintRows.find(r => r.vehicleId === v.id) || {};
    const exp   = expRows.find(r => r.vehicleId === v.id)   || {};
    const fuelCost         = parseFloat(fuel.fuelCost)         || 0;
    const maintenanceCost  = parseFloat(maint.maintenanceCost) || 0;
    const expenseCost      = parseFloat(exp.expenseCost)       || 0;
    const totalOpCost      = fuelCost + maintenanceCost + expenseCost;
    const acquisitionCost  = parseFloat(v.acquisitionCost)    || 0;
    const costRatio        = acquisitionCost > 0 ? parseFloat(((totalOpCost / acquisitionCost) * 100).toFixed(1)) : 0;
    return {
      vehicle: { id: v.id, registrationNumber: v.registrationNumber, name: v.name, type: v.type },
      acquisitionCost,
      totalOperationalCost: totalOpCost,
      fuelCost,
      maintenanceCost,
      expenseCost,
      costRatio,
      netInvestment: acquisitionCost - totalOpCost,
    };
  });
};

module.exports = { fuelEfficiency, operationalCost, fleetUtilization, vehicleROI };
