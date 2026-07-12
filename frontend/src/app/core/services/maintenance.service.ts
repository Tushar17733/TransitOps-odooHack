import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { MaintenanceLog } from '../models';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private api = inject(ApiService);

  listByVehicle(vehicleId: number) {
    return this.api.get<MaintenanceLog[]>('/maintenance', { vehicleId });
  }
  getById(id: number) {
    return this.api.get<MaintenanceLog>(`/maintenance/${id}`);
  }
  create(data: { vehicleId: number; type: string; description?: string; cost?: number }) {
    return this.api.post<MaintenanceLog>('/maintenance', data);
  }
  close(id: number, cost?: number) {
    return this.api.patch<MaintenanceLog>(`/maintenance/${id}/close`, { cost });
  }
}
