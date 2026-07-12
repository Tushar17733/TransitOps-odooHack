import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Trip } from '../models';

@Injectable({ providedIn: 'root' })
export class TripService {
  private api = inject(ApiService);

  list(filters: Record<string, string | number> = {}) {
    return this.api.get<Trip[]>('/trips', filters);
  }
  getById(id: number) {
    return this.api.get<Trip>(`/trips/${id}`);
  }
  create(data: Partial<Trip>) {
    return this.api.post<Trip>('/trips', data);
  }
  dispatch(id: number) {
    return this.api.patch<Trip>(`/trips/${id}/dispatch`, {});
  }
  complete(id: number, actualDistance?: number) {
    return this.api.patch<Trip>(`/trips/${id}/complete`, { actualDistance });
  }
  cancel(id: number) {
    return this.api.patch<Trip>(`/trips/${id}/cancel`, {});
  }
}
