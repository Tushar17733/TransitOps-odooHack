import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../core/auth/auth.service';

interface NavItem { label: string; icon: string; route: string; roles?: string[]; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule,
    MatListModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav #sidenav [mode]="mobile ? 'over' : 'side'" [opened]="!mobile"
        class="sidenav">
        <div class="brand">
          <mat-icon>directions_bus</mat-icon>
          <span>TransitOps</span>
        </div>
        <mat-nav-list>
          @for (item of visibleNav; track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
              (click)="mobile && sidenav.close()">
              <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
              <span matListItemTitle>{{item.label}}</span>
            </a>
          }
        </mat-nav-list>
        <div class="sidenav-footer">
          <mat-divider/>
          <div class="user-info">
            <mat-icon>account_circle</mat-icon>
            <div>
              <div class="user-name">{{auth.user()?.name}}</div>
              <div class="user-role">{{formatRole(auth.user()?.role)}}</div>
            </div>
          </div>
          <button mat-button (click)="auth.logout()" class="logout-btn">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <mat-toolbar class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">TransitOps</span>
        </mat-toolbar>
        <div class="content-area">
          <router-outlet/>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container { height: 100vh; }
    .sidenav { width: 240px; background: #1A2233; color: #fff; display: flex; flex-direction: column; }
    .brand { display: flex; align-items: center; gap: 10px; padding: 20px 16px 12px;
      font-size: 18px; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255,255,255,.1); }
    .brand mat-icon { color: #42A5F5; }
    mat-nav-list { flex: 1; padding-top: 8px; }
    ::ng-deep .sidenav .mat-mdc-list-item { color: rgba(255,255,255,.7) !important; border-radius: 8px; margin: 2px 8px; }
    ::ng-deep .sidenav .active-link { background: rgba(255,255,255,.12) !important; color: #fff !important; }
    ::ng-deep .sidenav .mat-mdc-list-item mat-icon { color: rgba(255,255,255,.7); }
    ::ng-deep .sidenav .active-link mat-icon { color: #42A5F5; }
    .sidenav-footer { padding: 8px; }
    .user-info { display: flex; align-items: center; gap: 10px; padding: 8px;
      color: rgba(255,255,255,.7); font-size: 12px; }
    .user-name { font-weight: 600; color: #fff; font-size: 13px; }
    .user-role { font-size: 11px; text-transform: capitalize; }
    .logout-btn { width: 100%; color: rgba(255,255,255,.6) !important; }
    .toolbar { background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.08); position: sticky; top: 0; z-index: 10; }
    .toolbar-title { font-weight: 600; color: #1A2233; }
    .main-content { display: flex; flex-direction: column; }
    .content-area { flex: 1; overflow-y: auto; }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  private bp = inject(BreakpointObserver);
  mobile = false;

  ngOnInit() {
    this.bp.observe(['(max-width: 768px)']).subscribe(r => this.mobile = r.matches);
  }

  nav: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Vehicles', icon: 'directions_bus', route: '/vehicles' },
    { label: 'Drivers', icon: 'person', route: '/drivers' },
    { label: 'Trips', icon: 'route', route: '/trips' },
    { label: 'Maintenance', icon: 'build', route: '/maintenance' },
    { label: 'Fuel & Expenses', icon: 'local_gas_station', route: '/fuel-expense' },
    { label: 'Reports', icon: 'bar_chart', route: '/reports', roles: ['fleet_manager', 'financial_analyst'] },
  ];

  get visibleNav() {
    return this.nav.filter(n => !n.roles || this.auth.hasRole(...(n.roles as any)));
  }

  formatRole(role?: string) {
    return role?.replace(/_/g, ' ') ?? '';
  }
}
