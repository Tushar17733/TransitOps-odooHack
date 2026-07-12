import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehicleService } from '../../core/services/vehicle.service';
import { AuthService } from '../../core/auth/auth.service';
import { Vehicle } from '../../core/models';
import { VehicleDialogComponent } from './vehicle-dialog.component';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Vehicles</h1>
        @if (auth.hasRole('fleet_manager')) {
          <button mat-flat-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon> Add Vehicle
          </button>
        }
      </div>

      <div class="filters" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
        <mat-form-field appearance="outline" style="width:200px">
          <mat-label>Filter by Status</mat-label>
          <mat-select [(value)]="filterStatus" (selectionChange)="applyFilters()">
            <mat-option value="">All</mat-option>
            @for (s of statuses; track s) { <mat-option [value]="s">{{s | titlecase}}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" style="width:200px">
          <mat-label>Filter by Type</mat-label>
          <mat-select [(value)]="filterType" (selectionChange)="applyFilters()">
            <mat-option value="">All</mat-option>
            @for (t of types; track t) { <mat-option [value]="t">{{t | titlecase}}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" style="width:200px">
          <mat-label>Search</mat-label>
          <input matInput (input)="search($event)" placeholder="Name, reg number…">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="table-container">
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:48px"><mat-spinner diameter="40"/></div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="registrationNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Reg. Number</th>
              <td mat-cell *matCellDef="let v"><strong>{{v.registrationNumber}}</strong></td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name / Model</th>
              <td mat-cell *matCellDef="let v">{{v.name}}<br><small class="text-muted">{{v.model}}</small></td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let v">{{v.type | titlecase}}</td>
            </ng-container>
            <ng-container matColumnDef="maxLoadCapacity">
              <th mat-header-cell *matHeaderCellDef>Max Load (kg)</th>
              <td mat-cell *matCellDef="let v">{{v.maxLoadCapacity | number}}</td>
            </ng-container>
            <ng-container matColumnDef="odometer">
              <th mat-header-cell *matHeaderCellDef>Odometer (km)</th>
              <td mat-cell *matCellDef="let v">{{v.odometer | number}}</td>
            </ng-container>
            <ng-container matColumnDef="region">
              <th mat-header-cell *matHeaderCellDef>Region</th>
              <td mat-cell *matCellDef="let v">{{v.region || '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let v"><span class="status-chip {{v.status}}">{{v.status}}</span></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let v">
                <div class="actions-cell">
                  @if (auth.hasRole('fleet_manager')) {
                    <button mat-icon-button matTooltip="Edit" (click)="openDialog(v)"><mat-icon>edit</mat-icon></button>
                    @if (v.status !== 'retired') {
                      <button mat-icon-button matTooltip="Retire" color="warn" (click)="retire(v)"><mat-icon>block</mat-icon></button>
                    }
                  }
                </div>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td colspan="8">
                <div class="empty-state"><mat-icon>directions_bus</mat-icon><p>No vehicles found</p></div>
              </td>
            </tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10,25,50]" showFirstLastButtons/>
        }
      </div>
    </div>
  `,
  styles: [``]
})
export class VehiclesComponent implements OnInit {
  private svc = inject(VehicleService);
  auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  cols = ['registrationNumber', 'name', 'type', 'maxLoadCapacity', 'odometer', 'region', 'status', 'actions'];
  statuses = ['available', 'on_trip', 'in_shop', 'retired'];
  types = ['truck', 'van', 'bus', 'car', 'motorcycle'];
  filterStatus = '';
  filterType = '';
  loading = true;

  dataSource = new MatTableDataSource<Vehicle>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load() {
    this.loading = true;
    const f: Record<string, string> = {};
    if (this.filterStatus) f['status'] = this.filterStatus;
    if (this.filterType) f['type'] = this.filterType;
    this.svc.list(f).subscribe({ next: v => { this.dataSource.data = v; this.loading = false; this.cdr.detectChanges(); }, error: () => { this.loading = false; this.cdr.detectChanges(); } });
  }

  applyFilters() { this.load(); }

  search(e: Event) {
    this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
  }

  openDialog(vehicle?: Vehicle) {
    this.dialog.open(VehicleDialogComponent, { width: '640px', data: { vehicle } })
      .afterClosed().subscribe(result => {
        if (!result) return;
        const op = vehicle ? this.svc.update(vehicle.id, result) : this.svc.create(result);
        op.subscribe({ next: () => { this.snack.open('Vehicle saved!', '', { duration: 3000 }); this.load(); }, error: () => {} });
      });
  }

  retire(v: Vehicle) {
    if (!confirm(`Retire ${v.name} (${v.registrationNumber})?`)) return;
    this.svc.retire(v.id).subscribe({ next: () => { this.snack.open('Vehicle retired', '', { duration: 3000 }); this.load(); } });
  }
}
