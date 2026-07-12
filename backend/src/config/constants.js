module.exports = {
  ROLES: {
    FLEET_MANAGER: 'fleet_manager',
    DRIVER: 'driver',
    SAFETY_OFFICER: 'safety_officer',
    FINANCIAL_ANALYST: 'financial_analyst',
  },
  VEHICLE_STATUS: {
    AVAILABLE: 'available',
    ON_TRIP: 'on_trip',
    IN_SHOP: 'in_shop',
    RETIRED: 'retired',
  },
  VEHICLE_TYPES: ['truck', 'van', 'bus', 'car', 'motorcycle'],
  DRIVER_STATUS: {
    AVAILABLE: 'available',
    ON_TRIP: 'on_trip',
    OFF_DUTY: 'off_duty',
    SUSPENDED: 'suspended',
  },
  TRIP_STATUS: {
    DRAFT: 'draft',
    DISPATCHED: 'dispatched',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  MAINTENANCE_TYPES: ['preventive', 'corrective', 'emergency'],
  MAINTENANCE_STATUS: {
    ACTIVE: 'active',
    CLOSED: 'closed',
  },
  EXPENSE_TYPES: ['toll', 'parking', 'other'],
};
