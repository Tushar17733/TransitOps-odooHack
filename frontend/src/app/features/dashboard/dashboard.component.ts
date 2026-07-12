import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardKPIs } from '../../core/models';

interface KPICard { label: string; value: () => number | string; icon: string; color: string; bg: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1>Dashboard</h1></div>

      @if (loading) {
        <div style="display:flex;justify-content:center;padding:60px">
          <mat-spinner diameter="48"/>
        </div>
      } @else if (kpis) {
        <div class="kpi-grid">
          @for (card of kpiCards; track card.label) {
            <mat-card class="kpi-card" [style.borderTop]="'4px solid ' + card.color">
              <mat-card-content>
                <div class="kpi-inner">
                  <div>
                    <div class="kpi-value">{{card.value()}}</div>
                    <div class="kpi-label">{{card.label}}</div>
                  </div>
                  <div class="kpi-icon" [style.background]="card.bg">
                    <mat-icon [style.color]="card.color">{{card.icon}}</mat-icon>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <div class="section-title">Fleet Status Breakdown</div>
        <div class="breakdown-grid">
          <mat-card>
            <mat-card-header><mat-card-title>Vehicles</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="breakdown-row"><span>Available</span><span class="status-chip available">{{kpis.vehicles.available}}</span></div>
              <div class="breakdown-row"><span>On Trip</span><span class="status-chip on_trip">{{kpis.vehicles.onTrip}}</span></div>
              <div class="breakdown-row"><span>In Maintenance</span><span class="status-chip in_shop">{{kpis.vehicles.inMaintenance}}</span></div>
              <div class="breakdown-row"><span>Retired</span><span class="status-chip retired">{{kpis.vehicles.retired}}</span></div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>Trips</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="breakdown-row"><span>Active (Dispatched)</span><span class="status-chip dispatched">{{kpis.trips.active}}</span></div>
              <div class="breakdown-row"><span>Pending (Draft)</span><span class="status-chip draft">{{kpis.trips.pending}}</span></div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-header><mat-card-title>Drivers</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="breakdown-row"><span>On Duty</span><span class="status-chip on_trip">{{kpis.drivers.onDuty}}</span></div>
              <div class="breakdown-row"><span>Total Active</span><span class="status-chip available">{{kpis.drivers.total}}</span></div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .kpi-card { cursor: default; }
    .kpi-inner { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
    .kpi-value { font-size: 32px; font-weight: 700; color: #1A2233; line-height: 1; }
    .kpi-label { font-size: 12px; color: #5A6478; margin-top: 4px; text-transform: uppercase; letter-spacing: .5px; }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-icon mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .section-title { font-size: 18px; font-weight: 600; color: #1A2233; margin-bottom: 16px; }
    .breakdown-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F0F2F5;
      &:last-child { border-bottom: none; } font-size: 14px; color: #5A6478; }
  `]
})
export class DashboardComponent implements OnInit {
  private svc = inject(DashboardService);
  kpis: DashboardKPIs | null = null;
  loading = true;

  get kpiCards(): KPICard[] {
    if (!this.kpis) return [];
    return [
      { label: 'Total Vehicles', value: () => this.kpis!.vehicles.total, icon: 'directions_bus', color: '#1565C0', bg: '#E3F2FD' },
      { label: 'Available Vehicles', value: () => this.kpis!.vehicles.available, icon: 'check_circle', color: '#2E7D32', bg: '#E8F5E9' },
      { label: 'In Maintenance', value: () => this.kpis!.vehicles.inMaintenance, icon: 'build', color: '#E65100', bg: '#FFF3E0' },
      { label: 'Active Trips', value: () => this.kpis!.trips.active, icon: 'route', color: '#1565C0', bg: '#E3F2FD' },
      { label: 'Pending Trips', value: () => this.kpis!.trips.pending, icon: 'pending', color: '#616161', bg: '#F5F5F5' },
      { label: 'Drivers On Duty', value: () => this.kpis!.drivers.onDuty, icon: 'person', color: '#6A1B9A', bg: '#F3E5F5' },
      { label: 'Fleet Utilization', value: () => this.kpis!.fleetUtilization + '%', icon: 'speed', color: '#00838F', bg: '#E0F7FA' },
    ];
  }

  ngOnInit() {
    this.svc.getKPIs().subscribe({
      next: d => { this.kpis = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
