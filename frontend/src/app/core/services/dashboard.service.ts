import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { DashboardKPIs } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);
  getKPIs() { return this.api.get<DashboardKPIs>('/dashboard/kpis'); }
}
