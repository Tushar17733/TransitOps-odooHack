import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardKPIs } from '../../core/models';

interface KPICard {
  label: string;
  value: () => number | string;
  icon: string;
  gradClass: string;
}

interface RoleConfig {
  title: string;
  subtitle: string;
  roleLabel: string;
  roleColor: string;
  roleIcon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page-container">

      <!-- ── Hero Header ─────────────────────────────────────────────────────── -->
      <div class="dash-header">
        <div class="dash-header-text">
          <div class="greeting">Good {{timeOfDay}}, {{userName}} 👋</div>
          <h1>{{config.title}}</h1>
          <p>{{config.subtitle}}</p>
        </div>
        <div class="dash-right">
          <div class="role-badge" [style.background]="config.roleColor + '18'" [style.border-color]="config.roleColor + '33'" [style.color]="config.roleColor">
            <mat-icon>{{config.roleIcon}}</mat-icon>
            <span>{{config.roleLabel}}</span>
          </div>
          <div class="live-badge">
            <mat-icon>sensors</mat-icon>
            <span>Live</span>
          </div>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="44"/>
          <p>Loading {{config.title | lowercase}}…</p>
        </div>
      } @else if (kpis) {

        <!-- ── KPI Grid ─────────────────────────────────────────────────────── -->
        <div class="kpi-grid">
          @for (card of visibleKpiCards; track card.label) {
            <div class="kpi-card" [matTooltip]="card.label">
              <div class="kpi-left">
                <div class="kpi-value">{{card.value()}}</div>
                <div class="kpi-label">{{card.label}}</div>
              </div>
              <div class="kpi-icon-wrap {{card.gradClass}}">
                <mat-icon>{{card.icon}}</mat-icon>
              </div>
            </div>
          }
        </div>

        <!-- ── Breakdown Sections (role-controlled) ──────────────────────────── -->
        <div class="section-header">
          <h2>{{breakdownTitle}}</h2>
        </div>

        <div class="breakdown-grid">

          <!-- Vehicles (fleet_manager + safety_officer) -->
          @if (auth.hasRole('fleet_manager', 'safety_officer')) {
            <div class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-icon grad-indigo"><mat-icon>directions_bus</mat-icon></div>
                <h3>Vehicles</h3>
              </div>
              <div class="stat-rows">
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot" style="background:#10B981"></span><span>Available</span></div>
                  <span class="stat-val">{{kpis.vehicles.available}}</span>
                </div>
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot pulse" style="background:#3B82F6"></span><span>On Trip</span></div>
                  <span class="stat-val">{{kpis.vehicles.onTrip}}</span>
                </div>
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot" style="background:#F59E0B"></span><span>In Maintenance</span></div>
                  <span class="stat-val stat-warn">{{kpis.vehicles.inMaintenance}}</span>
                </div>
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot" style="background:#8B5CF6"></span><span>Retired</span></div>
                  <span class="stat-val">{{kpis.vehicles.retired}}</span>
                </div>
              </div>
              <div class="util-bar-wrap">
                <div class="util-bar-label">
                  <span>Fleet Utilization</span>
                  <span class="util-pct">{{kpis.fleetUtilization}}%</span>
                </div>
                <div class="util-bar">
                  <div class="util-bar-fill" [style.width.%]="kpis.fleetUtilization"></div>
                </div>
              </div>
            </div>
          }

          <!-- Trips (fleet_manager + financial_analyst + driver) -->
          @if (auth.hasRole('fleet_manager', 'financial_analyst', 'driver')) {
            <div class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-icon grad-blue"><mat-icon>route</mat-icon></div>
                <h3>{{auth.hasRole('driver') ? 'Trip Overview' : 'Trips'}}</h3>
              </div>
              <div class="stat-rows">
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot pulse" style="background:#3B82F6"></span><span>Active (Dispatched)</span></div>
                  <span class="stat-val">{{kpis.trips.active}}</span>
                </div>
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot" style="background:#94A3B8"></span><span>Pending (Draft)</span></div>
                  <span class="stat-val">{{kpis.trips.pending}}</span>
                </div>
              </div>
              @if (auth.hasRole('driver')) {
                <div class="driver-note">
                  <mat-icon>info</mat-icon>
                  <span>Check the Trips section for your assigned trips</span>
                </div>
              }
            </div>
          }

          <!-- Drivers (fleet_manager + safety_officer) -->
          @if (auth.hasRole('fleet_manager', 'safety_officer')) {
            <div class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-icon grad-violet"><mat-icon>person</mat-icon></div>
                <h3>Drivers</h3>
              </div>
              <div class="stat-rows">
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot pulse" style="background:#3B82F6"></span><span>On Duty</span></div>
                  <span class="stat-val">{{kpis.drivers.onDuty}}</span>
                </div>
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot" style="background:#10B981"></span><span>Total Active</span></div>
                  <span class="stat-val">{{kpis.drivers.total}}</span>
                </div>
              </div>
            </div>
          }

          <!-- Financial summary card (financial_analyst only) -->
          @if (auth.hasRole('financial_analyst')) {
            <div class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-icon grad-emerald"><mat-icon>account_balance_wallet</mat-icon></div>
                <h3>Fleet Overview</h3>
              </div>
              <div class="stat-rows">
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot" style="background:#6366F1"></span><span>Total Vehicles</span></div>
                  <span class="stat-val">{{kpis.vehicles.total}}</span>
                </div>
                <div class="stat-row">
                  <div class="stat-row-left"><span class="stat-dot" style="background:#F59E0B"></span><span>In Maintenance</span></div>
                  <span class="stat-val stat-warn">{{kpis.vehicles.inMaintenance}}</span>
                </div>
              </div>
              <div class="util-bar-wrap">
                <div class="util-bar-label">
                  <span>Fleet Utilization</span>
                  <span class="util-pct">{{kpis.fleetUtilization}}%</span>
                </div>
                <div class="util-bar">
                  <div class="util-bar-fill" [style.width.%]="kpis.fleetUtilization"></div>
                </div>
              </div>
            </div>
          }

        </div>
      }
    </div>
  `,
  styles: [`
    // ── Header ────────────────────────────────────────────────────────────────
    .dash-header {
      display: flex; align-items: flex-start;
      justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
    }
    .greeting {
      font-size: 13px; color: #64748B; font-weight: 500; margin-bottom: 4px;
    }
    .dash-header-text h1 {
      font-size: 26px; font-weight: 800; color: #0F172A;
      margin: 0 0 4px; font-family: 'Plus Jakarta Sans','Inter',sans-serif; letter-spacing: -0.5px;
    }
    .dash-header-text p { margin: 0; color: #64748B; font-size: 14px; }

    .dash-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .role-badge {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 20px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;
      border: 1px solid; white-space: nowrap;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .live-badge {
      display: flex; align-items: center; gap: 6px;
      background: rgba(16,185,129,0.1); color: #059669;
      padding: 6px 14px; border-radius: 20px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;
      border: 1px solid rgba(16,185,129,0.2);
      mat-icon { font-size: 14px; width: 14px; height: 14px; animation: statusPulse 2s ease-in-out infinite; }
    }

    // ── Loading ────────────────────────────────────────────────────────────────
    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 80px 0;
      p { color: #94A3B8; font-size: 14px; margin: 0; }
    }

    // ── KPI Grid ──────────────────────────────────────────────────────────────
    .kpi-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 16px; margin-bottom: 32px;
    }

    .kpi-card {
      background: #fff; border-radius: 16px; padding: 20px 18px;
      display: flex; align-items: center; justify-content: space-between;
      border: 1px solid rgba(0,0,0,0.055); box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1); cursor: default; gap: 12px;
      &:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.10); }
    }

    .kpi-left { flex: 1; min-width: 0; }
    .kpi-value {
      font-size: 34px; font-weight: 800; color: #0F172A; line-height: 1;
      font-family: 'Plus Jakarta Sans','Inter',sans-serif; letter-spacing: -1.5px;
    }
    .kpi-label {
      font-size: 11px; color: #64748B; margin-top: 7px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.6px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .kpi-icon-wrap {
      width: 50px; height: 50px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #fff; font-size: 24px; width: 24px; height: 24px; }
    }

    .grad-indigo  { background: linear-gradient(135deg,#6366F1,#8B5CF6); box-shadow: 0 6px 18px rgba(99,102,241,0.40); }
    .grad-emerald { background: linear-gradient(135deg,#10B981,#059669); box-shadow: 0 6px 18px rgba(16,185,129,0.40); }
    .grad-amber   { background: linear-gradient(135deg,#F59E0B,#D97706); box-shadow: 0 6px 18px rgba(245,158,11,0.40); }
    .grad-blue    { background: linear-gradient(135deg,#3B82F6,#2563EB); box-shadow: 0 6px 18px rgba(59,130,246,0.40); }
    .grad-slate   { background: linear-gradient(135deg,#64748B,#475569); box-shadow: 0 6px 18px rgba(100,116,139,0.28); }
    .grad-violet  { background: linear-gradient(135deg,#8B5CF6,#7C3AED); box-shadow: 0 6px 18px rgba(139,92,246,0.40); }
    .grad-cyan    { background: linear-gradient(135deg,#06B6D4,#0891B2); box-shadow: 0 6px 18px rgba(6,182,212,0.40); }
    .grad-rose    { background: linear-gradient(135deg,#F43F5E,#E11D48); box-shadow: 0 6px 18px rgba(244,63,94,0.40); }

    // ── Section Header ────────────────────────────────────────────────────────
    .section-header {
      margin-bottom: 16px;
      h2 { font-size: 17px; font-weight: 700; color: #0F172A; margin: 0; font-family:'Plus Jakarta Sans','Inter',sans-serif; }
    }

    // ── Breakdown Grid ────────────────────────────────────────────────────────
    .breakdown-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 16px;
    }

    .stat-card {
      background: #fff; border-radius: 16px; padding: 20px;
      border: 1px solid rgba(0,0,0,0.055); box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
      &:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.09); }
    }

    .stat-card-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 18px;
      h3 { margin: 0; font-size: 15px; font-weight: 700; color: #0F172A; font-family:'Plus Jakarta Sans','Inter',sans-serif; }
    }

    .stat-card-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #fff; font-size: 18px; width: 18px; height: 18px; }
    }

    .stat-rows { display: flex; flex-direction: column; gap: 2px; }

    .stat-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 0; border-bottom: 1px solid #F1F5F9;
      &:last-child { border-bottom: none; }
    }

    .stat-row-left {
      display: flex; align-items: center; gap: 9px; font-size: 13.5px; color: #475569;
    }

    .stat-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      &.pulse { animation: statusPulse 2s ease-in-out infinite; }
    }

    .stat-val { font-size: 18px; font-weight: 700; color: #0F172A; font-family:'Plus Jakarta Sans','Inter',sans-serif; }
    .stat-warn { color: #D97706; }

    .driver-note {
      display: flex; align-items: center; gap: 6px;
      margin-top: 14px; padding: 8px 12px; border-radius: 8px;
      background: #EFF6FF; color: #1D4ED8; font-size: 12px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }
    }

    // ── Utilization Bar ───────────────────────────────────────────────────────
    .util-bar-wrap { margin-top: 16px; }
    .util-bar-label {
      display: flex; justify-content: space-between;
      font-size: 12px; color: #64748B; margin-bottom: 7px; font-weight: 500;
    }
    .util-pct { font-weight: 700; color: #6366F1; }
    .util-bar { height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
    .util-bar-fill {
      height: 100%; background: linear-gradient(90deg,#6366F1,#8B5CF6); border-radius: 3px;
      transition: width 1s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 0 8px rgba(99,102,241,0.4);
    }

    @keyframes statusPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.45; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private svc = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  auth = inject(AuthService);

  kpis: DashboardKPIs | null = null;
  loading = true;

  get userName(): string {
    const name = this.auth.user()?.name ?? '';
    return name.split(' ')[0]; // first name only
  }

  get timeOfDay(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  get config(): RoleConfig {
    const role = this.auth.role();
    switch (role) {
      case 'safety_officer':
        return {
          title:      'Safety Dashboard',
          subtitle:   'Monitor vehicle maintenance and driver compliance',
          roleLabel:  'Safety Officer',
          roleColor:  '#10B981',
          roleIcon:   'verified_user',
        };
      case 'financial_analyst':
        return {
          title:      'Financial Dashboard',
          subtitle:   'Fleet cost tracking and operational efficiency',
          roleLabel:  'Financial Analyst',
          roleColor:  '#F59E0B',
          roleIcon:   'bar_chart',
        };
      case 'driver':
        return {
          title:      'My Dashboard',
          subtitle:   'Your trip assignments and current status',
          roleLabel:  'Driver',
          roleColor:  '#06B6D4',
          roleIcon:   'person',
        };
      default: // fleet_manager
        return {
          title:      'Fleet Dashboard',
          subtitle:   'Live overview of your entire transport operation',
          roleLabel:  'Fleet Manager',
          roleColor:  '#6366F1',
          roleIcon:   'directions_bus',
        };
    }
  }

  get breakdownTitle(): string {
    const role = this.auth.role();
    if (role === 'safety_officer')     return 'Vehicle & Driver Status';
    if (role === 'financial_analyst')  return 'Operational Summary';
    if (role === 'driver')             return 'Trip Status';
    return 'Fleet Status Breakdown';
  }

  get visibleKpiCards(): KPICard[] {
    if (!this.kpis) return [];
    const role = this.auth.role();

    const all: Record<string, KPICard> = {
      totalVehicles:    { label: 'Total Vehicles',    value: () => this.kpis!.vehicles.total,         icon: 'directions_bus',   gradClass: 'grad-indigo' },
      available:        { label: 'Available',         value: () => this.kpis!.vehicles.available,      icon: 'check_circle',     gradClass: 'grad-emerald' },
      inMaintenance:    { label: 'In Maintenance',    value: () => this.kpis!.vehicles.inMaintenance,  icon: 'build',            gradClass: 'grad-amber' },
      activeTrips:      { label: 'Active Trips',      value: () => this.kpis!.trips.active,            icon: 'route',            gradClass: 'grad-blue' },
      pendingTrips:     { label: 'Pending Trips',     value: () => this.kpis!.trips.pending,           icon: 'pending_actions',  gradClass: 'grad-slate' },
      driversOnDuty:    { label: 'Drivers On Duty',   value: () => this.kpis!.drivers.onDuty,         icon: 'person',           gradClass: 'grad-violet' },
      fleetUtilization: { label: 'Fleet Utilization', value: () => this.kpis!.fleetUtilization + '%', icon: 'speed',            gradClass: 'grad-cyan' },
    };

    switch (role) {
      case 'safety_officer':
        return [all['totalVehicles'], all['inMaintenance'], all['available'], all['driversOnDuty']];
      case 'financial_analyst':
        return [all['totalVehicles'], all['activeTrips'], all['pendingTrips'], all['fleetUtilization']];
      case 'driver':
        return [all['activeTrips'], all['pendingTrips']];
      default: // fleet_manager — full set
        return Object.values(all);
    }
  }

  ngOnInit() {
    this.svc.getKPIs().subscribe({
      next: d => { this.kpis = d; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }
}
