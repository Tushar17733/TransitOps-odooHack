import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Driver } from '../models';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private api = inject(ApiService);

  list(filters: Record<string, string> = {}) {
    return this.api.get<Driver[]>('/drivers', filters);
  }
  getDispatchable() {
    return this.api.get<Driver[]>('/drivers/dispatchable');
  }
  getById(id: number) {
    return this.api.get<Driver>(`/drivers/${id}`);
  }
  create(data: Partial<Driver>) {
    return this.api.post<Driver>('/drivers', data);
  }
  update(id: number, data: Partial<Driver>) {
    return this.api.put<Driver>(`/drivers/${id}`, data);
  }
}
