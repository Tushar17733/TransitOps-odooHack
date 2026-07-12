import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MaintenanceService } from '../../core/services/maintenance.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { AuthService } from '../../core/auth/auth.service';
import { MaintenanceLog, Vehicle } from '../../core/models';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDialogModule, MatProgressSpinnerModule, MatTooltipModule, MatCardModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1>Maintenance</h1></div>

      <div class="filters" style="justify-content:space-between;">
        <mat-form-field appearance="outline" style="width:240px;height:54px">
          <mat-label>Select Vehicle</mat-label>
          <mat-select [(value)]="selectedVehicleId" (selectionChange)="load()">
            <mat-option [value]="null">— All Vehicles —</mat-option>
            @for (v of vehicles; track v.id){ <mat-option [value]="v.id">{{v.registrationNumber}} — {{v.name}}</mat-option> }
          </mat-select>
        </mat-form-field>
        @if (auth.hasRole('fleet_manager', 'safety_officer') && selectedVehicleId) {
          <button mat-flat-button color="primary" (click)="showForm=!showForm">
            <mat-icon>add</mat-icon> Log Maintenance
          </button>
        }
      </div>

      @if (showForm) {
        <mat-card style="margin-bottom:16px;padding:16px">
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                @for (t of types; track t){ <mat-option [value]="t">{{t | titlecase}}</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Estimated Cost (₹)</mat-label>
              <input matInput type="number" formControlName="cost">
            </mat-form-field>
            <mat-form-field appearance="outline" style="grid-column:1/-1">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>
            <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px">
              <button mat-button type="button" (click)="showForm=false">Cancel</button>
              <button mat-flat-button color="primary" type="submit">Open Maintenance</button>
            </div>
          </form>
        </mat-card>
      }

      <div class="table-container">
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:48px"><mat-spinner diameter="40"/></div>
        } @else {
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="vehicle">
              <th mat-header-cell *matHeaderCellDef>Vehicle</th>
              <td mat-cell *matCellDef="let m">{{m.vehicle?.registrationNumber || '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let m">{{m.type | titlecase}}</td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let m">{{m.description || '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="cost">
              <th mat-header-cell *matHeaderCellDef>Cost (₹)</th>
              <td mat-cell *matCellDef="let m">{{m.cost | number:'1.2-2'}}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let m"><span class="status-chip {{m.status}}">{{m.status}}</span></td>
            </ng-container>
            <ng-container matColumnDef="openedAt">
              <th mat-header-cell *matHeaderCellDef>Opened</th>
              <td mat-cell *matCellDef="let m">{{m.openedAt | date:'dd/MM/yy'}}</td>
            </ng-container>
            <ng-container matColumnDef="closedAt">
              <th mat-header-cell *matHeaderCellDef>Closed</th>
              <td mat-cell *matCellDef="let m">{{m.closedAt ? (m.closedAt | date:'dd/MM/yy') : '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let m">
                @if (auth.hasRole('fleet_manager', 'safety_officer') && m.status === 'active') {
                  <button mat-stroked-button color="primary" (click)="close(m)" matTooltip="Close maintenance">
                    <mat-icon>check</mat-icon> Close
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td colspan="8"><div class="empty-state"><mat-icon>build</mat-icon><p>No maintenance records</p></div></td>
            </tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10,25]" showFirstLastButtons/>
        }
      </div>
    </div>
  `
})
export class MaintenanceComponent implements OnInit {
  private svc = inject(MaintenanceService);
  private vehicleSvc = inject(VehicleService);
  auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  cols = ['vehicle', 'type', 'description', 'cost', 'status', 'openedAt', 'closedAt', 'actions'];
  types = ['preventive', 'corrective', 'emergency'];
  vehicles: Vehicle[] = [];
  selectedVehicleId: number | null = null;
  loading = true;
  showForm = false;

  dataSource = new MatTableDataSource<MaintenanceLog>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form = this.fb.group({
    type: ['preventive', Validators.required],
    description: [''],
    cost: [0],
  });

  ngOnInit() {
    this.vehicleSvc.list().subscribe(v => { this.vehicles = v; this.cdr.detectChanges(); });
    this.load();
  }
  ngAfterViewInit() { this.dataSource.paginator = this.paginator; }

  load() {
    if (!this.selectedVehicleId) { this.loading = false; this.dataSource.data = []; this.cdr.detectChanges(); return; }
    this.loading = true;
    this.svc.listByVehicle(this.selectedVehicleId).subscribe({
      next: l => { this.dataSource.data = l; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  submit() {
    if (!this.selectedVehicleId || this.form.invalid) return;
    const payload = { vehicleId: this.selectedVehicleId, ...this.form.value as any };
    this.svc.create(payload).subscribe({
      next: () => { this.snack.open('Maintenance opened, vehicle moved to In Shop', '', { duration: 3000 }); this.showForm = false; this.cdr.detectChanges(); this.load(); }
    });
  }

  close(m: MaintenanceLog) {
    const cost = prompt('Final cost (₹)?', String(m.cost));
    if (cost === null) return;
    this.svc.close(m.id, parseFloat(cost)).subscribe({
      next: () => { this.snack.open('Maintenance closed, vehicle restored to Available', '', { duration: 3000 }); this.load(); }
    });
  }
}
