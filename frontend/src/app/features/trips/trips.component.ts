import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TripService } from '../../core/services/trip.service';
import { AuthService } from '../../core/auth/auth.service';
import { Trip } from '../../core/models';
import { TripDialogComponent } from './trip-dialog.component';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Trips</h1>
        @if (auth.hasRole('fleet_manager')) {
          <button mat-flat-button color="primary" (click)="openCreate()">
            <mat-icon>add</mat-icon> Create Trip
          </button>
        }
      </div>

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
        <mat-form-field appearance="outline" style="width:200px">
          <mat-label>Filter by Status</mat-label>
          <mat-select [(value)]="filterStatus" (selectionChange)="load()">
            <mat-option value="">All</mat-option>
            @for (s of statuses; track s){ <mat-option [value]="s">{{s | titlecase}}</mat-option> }
          </mat-select>
        </mat-form-field>
      </div>

      <div class="table-container">
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:48px"><mat-spinner diameter="40"/></div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let t">{{t.id}}</td>
            </ng-container>
            <ng-container matColumnDef="route">
              <th mat-header-cell *matHeaderCellDef>Route</th>
              <td mat-cell *matCellDef="let t"><strong>{{t.source}}</strong> → {{t.destination}}</td>
            </ng-container>
            <ng-container matColumnDef="vehicle">
              <th mat-header-cell *matHeaderCellDef>Vehicle</th>
              <td mat-cell *matCellDef="let t">{{t.vehicle?.registrationNumber}}<br><small class="text-muted">{{t.vehicle?.name}}</small></td>
            </ng-container>
            <ng-container matColumnDef="driver">
              <th mat-header-cell *matHeaderCellDef>Driver</th>
              <td mat-cell *matCellDef="let t">{{t.driver?.name}}</td>
            </ng-container>
            <ng-container matColumnDef="cargoWeight">
              <th mat-header-cell *matHeaderCellDef>Cargo (kg)</th>
              <td mat-cell *matCellDef="let t">{{t.cargoWeight | number}}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let t"><span class="status-chip {{t.status}}">{{t.status}}</span></td>
            </ng-container>
            <ng-container matColumnDef="startTime">
              <th mat-header-cell *matHeaderCellDef>Start</th>
              <td mat-cell *matCellDef="let t">{{t.startTime ? (t.startTime | date:'dd/MM/yy HH:mm') : '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let t">
                @if (auth.hasRole('fleet_manager')) {
                  <div class="actions-cell">
                    @if (t.status === 'draft') {
                      <button mat-stroked-button color="primary" (click)="dispatch(t)" matTooltip="Dispatch">
                        <mat-icon>send</mat-icon> Dispatch
                      </button>
                      <button mat-icon-button color="warn" (click)="cancel(t)" matTooltip="Cancel"><mat-icon>cancel</mat-icon></button>
                    }
                    @if (t.status === 'dispatched') {
                      <button mat-stroked-button color="accent" (click)="complete(t)" matTooltip="Complete">
                        <mat-icon>check_circle</mat-icon> Complete
                      </button>
                      <button mat-icon-button color="warn" (click)="cancel(t)" matTooltip="Cancel"><mat-icon>cancel</mat-icon></button>
                    }
                  </div>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td colspan="8"><div class="empty-state"><mat-icon>route</mat-icon><p>No trips found</p></div></td>
            </tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10,25,50]" showFirstLastButtons/>
        }
      </div>
    </div>
  `
})
export class TripsComponent implements OnInit {
  private svc = inject(TripService);
  auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  cols = ['id', 'route', 'vehicle', 'driver', 'cargoWeight', 'status', 'startTime', 'actions'];
  statuses = ['draft', 'dispatched', 'completed', 'cancelled'];
  filterStatus = '';
  loading = true;

  dataSource = new MatTableDataSource<Trip>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() { this.load(); }
  ngAfterViewInit() { this.dataSource.sort = this.sort; this.dataSource.paginator = this.paginator; }

  load() {
    this.loading = true;
    const f: Record<string, string> = {};
    if (this.filterStatus) f['status'] = this.filterStatus;
    this.svc.list(f).subscribe({ next: t => { this.dataSource.data = t; this.loading = false; }, error: () => this.loading = false });
  }

  openCreate() {
    this.dialog.open(TripDialogComponent, { width: '680px', data: {} })
      .afterClosed().subscribe(result => {
        if (!result) return;
        this.svc.create(result).subscribe({ next: () => { this.snack.open('Trip created!', '', { duration: 3000 }); this.load(); } });
      });
  }

  dispatch(t: Trip) {
    this.svc.dispatch(t.id).subscribe({ next: () => { this.snack.open('Trip dispatched!', '', { duration: 3000 }); this.load(); } });
  }

  complete(t: Trip) {
    this.svc.complete(t.id).subscribe({ next: () => { this.snack.open('Trip completed!', '', { duration: 3000 }); this.load(); } });
  }

  cancel(t: Trip) {
    if (!confirm('Cancel this trip?')) return;
    this.svc.cancel(t.id).subscribe({ next: () => { this.snack.open('Trip cancelled', '', { duration: 3000 }); this.load(); } });
  }
}
