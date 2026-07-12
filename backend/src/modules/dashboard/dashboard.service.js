const { Vehicle, Driver, Trip } = require('../../database');
const { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } = require('../../config/constants');
const { Op } = require('sequelize');

const getKPIs = async () => {
  const [
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    totalDrivers,
  ] = await Promise.all([
    Vehicle.count(),
    Vehicle.count({ where: { status: VEHICLE_STATUS.AVAILABLE } }),
    Vehicle.count({ where: { status: VEHICLE_STATUS.ON_TRIP } }),
    Vehicle.count({ where: { status: VEHICLE_STATUS.IN_SHOP } }),
    Vehicle.count({ where: { status: VEHICLE_STATUS.RETIRED } }),
    Trip.count({ where: { status: TRIP_STATUS.DISPATCHED } }),
    Trip.count({ where: { status: TRIP_STATUS.DRAFT } }),
    Driver.count({ where: { status: DRIVER_STATUS.ON_TRIP } }),
    Driver.count({ where: { status: { [Op.notIn]: [DRIVER_STATUS.SUSPENDED] } } }),
  ]);

  const activeVehicles = availableVehicles + onTripVehicles;
  const fleetUtilization = totalVehicles > 0
    ? parseFloat(((activeVehicles / totalVehicles) * 100).toFixed(2))
    : 0;

  return {
    vehicles: {
      total: totalVehicles,
      available: availableVehicles,
      onTrip: onTripVehicles,
      inMaintenance: inShopVehicles,
      retired: retiredVehicles,
    },
    trips: { active: activeTrips, pending: pendingTrips },
    drivers: { onDuty: driversOnDuty, total: totalDrivers },
    fleetUtilization,
  };
};

module.exports = { getKPIs };
