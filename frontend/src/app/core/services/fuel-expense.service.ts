import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { FuelLog, Expense } from '../models';

@Injectable({ providedIn: 'root' })
export class FuelExpenseService {
  private api = inject(ApiService);

  logFuel(data: { vehicleId: number; liters: number; costPerLiter: number; date: string; odometer?: number }) {
    return this.api.post<FuelLog>('/fuel-expenses/fuel', data);
  }
  getFuelByVehicle(vehicleId: number) {
    return this.api.get<FuelLog[]>(`/fuel-expenses/fuel/vehicle/${vehicleId}`);
  }
  logExpense(data: { vehicleId: number; type: string; amount: number; date: string; description?: string; tripId?: number }) {
    return this.api.post<Expense>('/fuel-expenses/expense', data);
  }
  getExpensesByVehicle(vehicleId: number) {
    return this.api.get<Expense[]>(`/fuel-expenses/expense/vehicle/${vehicleId}`);
  }
}
