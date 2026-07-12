export type Role = 'fleet_manager' | 'driver' | 'safety_officer' | 'financial_analyst';
export type VehicleStatus = 'available' | 'on_trip' | 'in_shop' | 'retired';
export type VehicleType = 'truck' | 'van' | 'bus' | 'car' | 'motorcycle';
export type DriverStatus = 'available' | 'on_trip' | 'off_duty' | 'suspended';
export type TripStatus = 'draft' | 'dispatched' | 'completed' | 'cancelled';
export type MaintenanceType = 'preventive' | 'corrective' | 'emergency';
export type MaintenanceStatus = 'active' | 'closed';
export type ExpenseType = 'toll' | 'parking' | 'other';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  registrationNumber: string;
  name: string;
  model?: string;
  type: VehicleType;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  licenseCategory?: string;
  licenseExpiryDate: string;
  contactNumber?: string;
  safetyScore: number;
  status: DriverStatus;
  userId?: number;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: number;
  source: string;
  destination: string;
  vehicleId: number;
  driverId: number;
  cargoWeight: number;
  plannedDistance: number;
  actualDistance?: number;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdBy: number;
  vehicle?: Pick<Vehicle, 'id' | 'registrationNumber' | 'name' | 'type'>;
  driver?: Pick<Driver, 'id' | 'name' | 'licenseNumber'>;
  creator?: Pick<User, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: number;
  vehicleId: number;
  type: MaintenanceType;
  description?: string;
  cost: number;
  status: MaintenanceStatus;
  openedAt: string;
  closedAt?: string;
  vehicle?: Pick<Vehicle, 'id' | 'registrationNumber' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  id: number;
  vehicleId: number;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  date: string;
  odometer?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: number;
  vehicleId: number;
  tripId?: number;
  type: ExpenseType;
  amount: number;
  date: string;
  description?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardKPIs {
  vehicles: {
    total: number;
    available: number;
    onTrip: number;
    inMaintenance: number;
    retired: number;
  };
  trips: { active: number; pending: number };
  drivers: { onDuty: number; total: number };
  fleetUtilization: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface LoginResponse {
  token: string;
  user: User;
}
