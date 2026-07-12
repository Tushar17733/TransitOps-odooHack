import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../core/auth/auth.service';

interface NavItem { label: string; icon: string; route: string; roles?: string[]; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule,
    MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav #sidenav [mode]="mobile ? 'over' : 'side'" [opened]="!mobile" class="sidenav">

        <!-- Brand -->
        <div class="brand">
          <div class="brand-icon"><mat-icon>directions_bus</mat-icon></div>
          <div class="brand-text">
            <span class="brand-name">TransitOps</span>
            <span class="brand-sub">Fleet Management</span>
          </div>
        </div>

        <!-- Navigation -->
        <div class="nav-label">NAVIGATION</div>
        <mat-nav-list class="nav-list">
          @for (item of visibleNav; track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
              (click)="mobile && sidenav.close()" class="nav-item">
              <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
              <span matListItemTitle>{{item.label}}</span>
            </a>
          }
        </mat-nav-list>

        <!-- User Footer -->
        <div class="sidenav-footer">
          <div class="user-card">
            <div class="user-avatar">{{getInitials()}}</div>
            <div class="user-info-text">
              <div class="user-name">{{auth.user()?.name}}</div>
              <div class="user-role">{{formatRole(auth.user()?.role)}}</div>
            </div>
          </div>
          <button mat-button (click)="auth.logout()" class="logout-btn">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <mat-toolbar class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-btn">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="toolbar-brand">
            <mat-icon class="toolbar-brand-icon">directions_bus</mat-icon>
            <span class="toolbar-title">TransitOps</span>
          </div>
          <span style="flex:1"></span>
          <div class="toolbar-user">
            <div class="toolbar-avatar">{{getInitials()}}</div>
          </div>
        </mat-toolbar>
        <div class="content-area">
          <router-outlet/>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    // ── Shell Layout ───────────────────────────────────────────────────────────
    .shell-container { height: 100vh; }
    .main-content { display: flex; flex-direction: column; height: 100%; }
    .content-area { flex: 1; overflow-y: auto; background: #F1F5F9; }

    // ── Sidenav ────────────────────────────────────────────────────────────────
    .sidenav {
      width: 260px;
      background: linear-gradient(175deg, #0D1117 0%, #131929 55%, #19213A 100%);
      display: flex;
      flex-direction: column;
      border-right: none;
      overflow: hidden;
    }

    .sidenav::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent);
    }

    // ── Brand ──────────────────────────────────────────────────────────────────
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 18px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(99,102,241,0.45);
      flex-shrink: 0;
    }

    .brand-icon mat-icon {
      color: #fff;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .brand-name {
      display: block;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.3px;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      line-height: 1.1;
    }

    .brand-sub {
      display: block;
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    // ── Nav ────────────────────────────────────────────────────────────────────
    .nav-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255,255,255,0.22);
      letter-spacing: 1.2px;
      padding: 16px 18px 6px;
      text-transform: uppercase;
    }

    .nav-list {
      flex: 1;
      padding: 4px 10px 12px !important;
      overflow-y: auto;
    }

    .nav-list::-webkit-scrollbar { width: 0; }

    ::ng-deep .sidenav .mat-mdc-list-item {
      border-radius: 10px !important;
      margin-bottom: 2px !important;
      height: 44px !important;
      transition: all 0.2s cubic-bezier(0.4,0,0.2,1) !important;
    }

    ::ng-deep .sidenav .mdc-list-item__primary-text {
      color: rgba(255,255,255,0.55) !important;
      font-size: 13.5px !important;
      font-weight: 500 !important;
      letter-spacing: 0.01em !important;
    }

    ::ng-deep .sidenav .mat-mdc-list-item:hover {
      background: rgba(255,255,255,0.07) !important;
      transform: translateX(3px);
    }

    ::ng-deep .sidenav .mat-mdc-list-item:hover .mdc-list-item__primary-text {
      color: rgba(255,255,255,0.9) !important;
    }

    ::ng-deep .sidenav .mat-mdc-list-item:hover mat-icon {
      color: rgba(255,255,255,0.75) !important;
    }

    ::ng-deep .sidenav .active-link {
      background: linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9)) !important;
      box-shadow: 0 4px 16px rgba(99,102,241,0.38), inset 0 1px 0 rgba(255,255,255,0.15) !important;
    }

    ::ng-deep .sidenav .active-link .mdc-list-item__primary-text {
      color: #fff !important;
    }

    ::ng-deep .sidenav .active-link mat-icon {
      color: #fff !important;
    }

    ::ng-deep .sidenav .mat-mdc-list-item mat-icon {
      color: rgba(255,255,255,0.4) !important;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      transition: color 0.2s ease !important;
      margin-right: 2px !important;
    }

    // ── User Footer ────────────────────────────────────────────────────────────
    .sidenav-footer {
      padding: 10px 10px 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 10px;
      margin-bottom: 4px;
      background: rgba(255,255,255,0.04);
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(99,102,241,0.35);
    }

    .user-info-text { flex: 1; min-width: 0; }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 11px;
      color: rgba(255,255,255,0.32);
      text-transform: capitalize;
      margin-top: 1px;
    }

    .logout-btn {
      width: 100% !important;
      color: rgba(255,255,255,0.38) !important;
      font-size: 13px !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
      height: 36px !important;
      justify-content: flex-start !important;
      padding-left: 12px !important;
    }

    .logout-btn:hover {
      background: rgba(239,68,68,0.1) !important;
      color: #F87171 !important;
    }

    ::ng-deep .logout-btn mat-icon {
      font-size: 17px !important;
      width: 17px !important;
      height: 17px !important;
      margin-right: 8px !important;
    }

    // ── Toolbar ────────────────────────────────────────────────────────────────
    .toolbar {
      background: rgba(255,255,255,0.96) !important;
      backdrop-filter: blur(12px) !important;
      border-bottom: 1px solid rgba(0,0,0,0.07) !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05) !important;
      height: 60px !important;
      padding: 0 16px !important;
    }

    .menu-btn {
      color: #475569 !important;
      border-radius: 10px !important;
      &:hover { background: rgba(99,102,241,0.08) !important; }
    }

    .toolbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
    }

    .toolbar-brand-icon {
      color: #6366F1;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .toolbar-title {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      letter-spacing: -0.2px;
    }

    .toolbar-user { display: flex; align-items: center; gap: 8px; }

    .toolbar-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      cursor: default;
    }

    // Material drawer shadow override
    ::ng-deep .mat-drawer {
      box-shadow: 4px 0 30px rgba(0,0,0,0.25) !important;
    }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  private bp = inject(BreakpointObserver);
  private cdr = inject(ChangeDetectorRef);
  mobile = false;

  ngOnInit() {
    this.bp.observe(['(max-width: 768px)']).subscribe(r => {
      this.mobile = r.matches;
      this.cdr.detectChanges();
    });
  }

  nav: NavItem[] = [
    { label: 'Dashboard',      icon: 'dashboard',        route: '/dashboard' },
    { label: 'Vehicles',       icon: 'directions_bus',   route: '/vehicles' },
    { label: 'Drivers',        icon: 'person',           route: '/drivers' },
    { label: 'Trips',          icon: 'route',            route: '/trips' },
    { label: 'Maintenance',    icon: 'build',            route: '/maintenance' },
    { label: 'Fuel & Expenses',icon: 'local_gas_station',route: '/fuel-expense' },
    { label: 'Reports',        icon: 'bar_chart',        route: '/reports', roles: ['fleet_manager', 'financial_analyst'] },
  ];

  get visibleNav() {
    return this.nav.filter(n => !n.roles || this.auth.hasRole(...(n.roles as any)));
  }

  getInitials(): string {
    const name = this.auth.user()?.name ?? '';
    if (!name) return '?';
    return name.split(' ').filter(w => w.length > 0).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  }

  formatRole(role?: string) {
    return role?.replace(/_/g, ' ') ?? '';
  }
}
