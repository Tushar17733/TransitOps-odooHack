import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Vehicle } from '../models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private api = inject(ApiService);

  list(filters: Record<string, string> = {}) {
    return this.api.get<Vehicle[]>('/vehicles', filters);
  }
  getDispatchable() {
    return this.api.get<Vehicle[]>('/vehicles/dispatchable');
  }
  getById(id: number) {
    return this.api.get<Vehicle>(`/vehicles/${id}`);
  }
  create(data: Partial<Vehicle>) {
    return this.api.post<Vehicle>('/vehicles', data);
  }
  update(id: number, data: Partial<Vehicle>) {
    return this.api.put<Vehicle>(`/vehicles/${id}`, data);
  }
  retire(id: number) {
    return this.api.patch<Vehicle>(`/vehicles/${id}/retire`, {});
  }
}
