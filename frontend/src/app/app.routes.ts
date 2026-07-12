import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      {
        path: 'vehicles',
        canActivate: [roleGuard('fleet_manager', 'safety_officer')],
        loadComponent: () => import('./features/vehicles/vehicles.component').then(m => m.VehiclesComponent),
      },
      {
        path: 'drivers',
        canActivate: [roleGuard('fleet_manager', 'safety_officer')],
        loadComponent: () => import('./features/drivers/drivers.component').then(m => m.DriversComponent),
      },
      {
        path: 'trips',
        canActivate: [roleGuard('fleet_manager', 'driver')],
        loadComponent: () => import('./features/trips/trips.component').then(m => m.TripsComponent),
      },
      {
        path: 'maintenance',
        canActivate: [roleGuard('fleet_manager', 'safety_officer')],
        loadComponent: () => import('./features/maintenance/maintenance.component').then(m => m.MaintenanceComponent),
      },
      {
        path: 'fuel-expense',
        canActivate: [roleGuard('fleet_manager', 'driver', 'financial_analyst')],
        loadComponent: () => import('./features/fuel-expense/fuel-expense.component').then(m => m.FuelExpenseComponent),
      },
      {
        path: 'reports',
        canActivate: [roleGuard('fleet_manager', 'financial_analyst')],
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
