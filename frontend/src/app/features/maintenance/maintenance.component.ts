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
import { MatDialogModule } from '@angular/material/dialog';
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
        <mat-form-field appearance="outline" style="width:280px">
          <mat-label>Select Vehicle</mat-label>
          <mat-icon matPrefix style="color:#94A3B8;margin-right:4px">directions_bus</mat-icon>
          <mat-select [(value)]="selectedVehicleId" (selectionChange)="load()">
            <mat-option [value]="null">— All Vehicles —</mat-option>
            @for (v of vehicles; track v.id) {
              <mat-option [value]="v.id">{{v.registrationNumber}} — {{v.name}}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (auth.hasRole('fleet_manager', 'safety_officer') && selectedVehicleId) {
          <button mat-flat-button color="primary" (click)="showForm=!showForm">
            <mat-icon>{{showForm ? 'close' : 'add'}}</mat-icon>
            {{showForm ? 'Cancel' : 'Log Maintenance'}}
          </button>
        }
      </div>

      <!-- ── Log Maintenance Form ─────────────────────────────────────────── -->
      @if (showForm) {
        <mat-card class="form-card">
          <div class="form-card-header">
            <mat-icon>build</mat-icon>
            <span>New Maintenance Record</span>
          </div>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-row-grid">
            <mat-form-field appearance="outline">
              <mat-label>Maintenance Type</mat-label>
              <mat-select formControlName="type">
                @for (t of types; track t.value) {
                  <mat-option [value]="t.value">
                    <mat-icon style="font-size:16px;vertical-align:middle;margin-right:6px">{{t.icon}}</mat-icon>
                    {{t.label}}
                  </mat-option>
                }
              </mat-select>
              @if (form.get('type')?.hasError('required') && form.get('type')?.touched) {
                <mat-error>Please select a maintenance type</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estimated Cost (₹)</mat-label>
              <mat-icon matPrefix style="color:#94A3B8;margin-right:4px">currency_rupee</mat-icon>
              <input matInput type="number" formControlName="cost" min="0" placeholder="0"
                (keypress)="numericOnly($event)">
              <span matSuffix style="color:#94A3B8;font-size:13px;margin-right:4px">₹</span>
              @if (!form.get('cost')?.invalid || !form.get('cost')?.touched) {
                <mat-hint>Leave 0 if not yet known</mat-hint>
              }
              @if (form.get('cost')?.hasError('min') && form.get('cost')?.touched) {
                <mat-error>Cost cannot be negative</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="grid-column:1/-1">
              <mat-label>Description</mat-label>
              <mat-icon matPrefix style="color:#94A3B8;margin-right:4px">description</mat-icon>
              <textarea matInput formControlName="description" rows="2"
                placeholder="Describe the issue or maintenance task…" maxlength="500"></textarea>
              <mat-hint align="end">{{form.get('description')?.value?.length || 0}}/500</mat-hint>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="showForm=false">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                <mat-icon>add_task</mat-icon> Open Maintenance
              </button>
            </div>
          </form>
        </mat-card>
      }

      <!-- ── Close Maintenance Inline Form ──────────────────────────────────── -->
      @if (closingRecord) {
        <mat-card class="form-card close-card">
          <div class="form-card-header close-header">
            <mat-icon>check_circle</mat-icon>
            <span>Close Maintenance — {{closingRecord.vehicle?.registrationNumber}}</span>
          </div>
          <form [formGroup]="closeForm" (ngSubmit)="submitClose()" class="form-row-grid">
            <mat-form-field appearance="outline">
              <mat-label>Final Cost (₹)</mat-label>
              <mat-icon matPrefix style="color:#94A3B8;margin-right:4px">currency_rupee</mat-icon>
              <input matInput type="number" formControlName="finalCost" min="0" placeholder="0"
                (keypress)="numericOnly($event)">
              @if (!closeForm.get('finalCost')?.invalid || !closeForm.get('finalCost')?.touched) {
                <mat-hint>Actual cost incurred</mat-hint>
              }
              @if (closeForm.get('finalCost')?.hasError('required') && closeForm.get('finalCost')?.touched) {
                <mat-error>Final cost is required</mat-error>
              } @else if (closeForm.get('finalCost')?.hasError('min') && closeForm.get('finalCost')?.touched) {
                <mat-error>Cost cannot be negative</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="closingRecord=null">Cancel</button>
              <button mat-flat-button color="accent" type="submit" [disabled]="closeForm.invalid">
                <mat-icon>check</mat-icon> Confirm Close
              </button>
            </div>
          </form>
        </mat-card>
      }

      <!-- ── Table ───────────────────────────────────────────────────────────── -->
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
              <td mat-cell *matCellDef="let m">
                <span class="type-chip {{m.type}}">{{m.type | titlecase}}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let m">{{m.description || '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="cost">
              <th mat-header-cell *matHeaderCellDef>Cost (₹)</th>
              <td mat-cell *matCellDef="let m">₹ {{m.cost | number:'1.2-2'}}</td>
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
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let m">
                @if (auth.hasRole('fleet_manager', 'safety_officer') && m.status === 'active') {
                  <button mat-stroked-button color="primary" (click)="startClose(m)"
                    matTooltip="Mark as closed and enter final cost">
                    <mat-icon>check</mat-icon> Close
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td colspan="8">
                <div class="empty-state">
                  <mat-icon>build</mat-icon>
                  <p>{{selectedVehicleId ? 'No maintenance records for this vehicle' : 'Select a vehicle to view records'}}</p>
                </div>
              </td>
            </tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10,25]" showFirstLastButtons/>
        }
      </div>
    </div>
  `,
  styles: [`
    .form-card {
      margin-bottom: 16px; padding: 16px;
      border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: none;
    }
    .form-card-header {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 14px;
      mat-icon { color: #6366F1; }
    }
    .close-card { border-color: #BBF7D0; }
    .close-header { mat-icon { color: #10B981; } }

    .form-row-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      mat-form-field { width: 100%; }
    }
    .form-actions {
      grid-column: 1/-1; display: flex; justify-content: flex-end; gap: 8px;
    }

    .type-chip {
      display: inline-block; padding: 2px 10px; border-radius: 12px;
      font-size: 12px; font-weight: 600;
      &.preventive { background: #DBEAFE; color: #1E40AF; }
      &.corrective  { background: #FEF3C7; color: #92400E; }
      &.emergency   { background: #FEE2E2; color: #991B1B; }
    }
  `]
})
export class MaintenanceComponent implements OnInit {
  private svc = inject(MaintenanceService);
  private vehicleSvc = inject(VehicleService);
  auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  cols = ['vehicle', 'type', 'description', 'cost', 'status', 'openedAt', 'closedAt', 'actions'];

  types = [
    { value: 'preventive', label: 'Preventive', icon: 'shield' },
    { value: 'corrective',  label: 'Corrective',  icon: 'build' },
    { value: 'emergency',   label: 'Emergency',   icon: 'warning' },
  ];

  vehicles: Vehicle[] = [];
  selectedVehicleId: number | null = null;
  loading = true;
  showForm = false;
  closingRecord: MaintenanceLog | null = null;

  dataSource = new MatTableDataSource<MaintenanceLog>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form = this.fb.group({
    type:        ['preventive', Validators.required],
    description: ['', Validators.maxLength(500)],
    cost:        [0,  Validators.min(0)],
  });

  closeForm = this.fb.group({
    finalCost: [null as number | null, [Validators.required, Validators.min(0)]],
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
    if (!this.selectedVehicleId || this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload = { vehicleId: this.selectedVehicleId, ...this.form.value as any };
    this.svc.create(payload).subscribe({
      next: () => {
        this.snack.open('Maintenance opened — vehicle moved to In Shop', '', { duration: 3000 });
        this.showForm = false;
        this.form.reset({ type: 'preventive', description: '', cost: 0 });
        this.cdr.detectChanges();
        this.load();
      }
    });
  }

  startClose(record: MaintenanceLog) {
    this.closingRecord = record;
    this.closeForm.reset({ finalCost: record.cost ?? null });
    this.showForm = false;
  }

  submitClose() {
    if (!this.closingRecord || this.closeForm.invalid) { this.closeForm.markAllAsTouched(); return; }
    const cost = this.closeForm.value.finalCost ?? 0;
    this.svc.close(this.closingRecord.id, cost).subscribe({
      next: () => {
        this.snack.open('Maintenance closed — vehicle restored to Available', '', { duration: 3000 });
        this.closingRecord = null;
        this.load();
      }
    });
  }

  numericOnly(event: KeyboardEvent) {
    if (!/[0-9.]/.test(event.key) && !['Backspace','Tab','Enter','ArrowLeft','ArrowRight','Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }
}
