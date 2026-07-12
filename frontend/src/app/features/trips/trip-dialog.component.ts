import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { VehicleService } from '../../core/services/vehicle.service';
import { DriverService } from '../../core/services/driver.service';
import { Vehicle, Driver } from '../../core/models';
import { noWhitespace, minIfPresent } from '../../core/validators/app.validators';

@Component({
  selector: 'app-trip-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
    MatIconModule, MatDividerModule],
  template: `
    <div class="dialog-header">
      <div class="dialog-icon">
        <mat-icon>route</mat-icon>
      </div>
      <div>
        <h2 mat-dialog-title>Create Trip</h2>
        <p class="dialog-subtitle">Assign a vehicle and driver for this trip</p>
      </div>
    </div>

    <mat-dialog-content>
      @if (loadingData) {
        <div class="loading-center">
          <mat-spinner diameter="36"/>
          <p>Loading available vehicles and drivers…</p>
        </div>
      } @else {
        <form [formGroup]="form" class="dialog-form">

          <div class="section-label">Route</div>
          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Origin / Source</mat-label>
              <mat-icon matPrefix class="field-prefix">trip_origin</mat-icon>
              <input matInput formControlName="source" placeholder="e.g. Mumbai Warehouse" maxlength="200">
              <mat-hint align="end">{{f('source').value?.length || 0}}/200</mat-hint>
              @if (f('source').hasError('required') && f('source').touched) {
                <mat-error>Origin is required</mat-error>
              } @else if (f('source').hasError('whitespace') && f('source').touched) {
                <mat-error>Origin cannot be blank spaces</mat-error>
              } @else if (f('source').hasError('minlength') && f('source').touched) {
                <mat-error>Origin must be at least 2 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Destination</mat-label>
              <mat-icon matPrefix class="field-prefix">place</mat-icon>
              <input matInput formControlName="destination" placeholder="e.g. Pune Depot" maxlength="200">
              <mat-hint align="end">{{f('destination').value?.length || 0}}/200</mat-hint>
              @if (f('destination').hasError('required') && f('destination').touched) {
                <mat-error>Destination is required</mat-error>
              } @else if (f('destination').hasError('whitespace') && f('destination').touched) {
                <mat-error>Destination cannot be blank spaces</mat-error>
              } @else if (f('destination').hasError('minlength') && f('destination').touched) {
                <mat-error>Destination must be at least 2 characters</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-divider style="margin:4px 0 16px"/>
          <div class="section-label">Assignment</div>

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Vehicle</mat-label>
              <mat-icon matPrefix class="field-prefix">directions_bus</mat-icon>
              <mat-select formControlName="vehicleId" (selectionChange)="onVehicleChange()">
                @for (v of vehicles; track v.id) {
                  <mat-option [value]="v.id">
                    <strong>{{v.registrationNumber}}</strong> — {{v.name}}
                    <span class="option-hint">(Max: {{v.maxLoadCapacity}}kg)</span>
                  </mat-option>
                }
              </mat-select>
              <mat-hint>Only available vehicles shown</mat-hint>
              @if (f('vehicleId').hasError('required') && f('vehicleId').touched) {
                <mat-error>Please select a vehicle</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Driver</mat-label>
              <mat-icon matPrefix class="field-prefix">person</mat-icon>
              <mat-select formControlName="driverId">
                @for (d of drivers; track d.id) {
                  <mat-option [value]="d.id">
                    {{d.name}}
                    <span class="option-hint">{{d.licenseNumber}}</span>
                  </mat-option>
                }
              </mat-select>
              <mat-hint>Only available drivers shown</mat-hint>
              @if (f('driverId').hasError('required') && f('driverId').touched) {
                <mat-error>Please select a driver</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-divider style="margin:4px 0 16px"/>
          <div class="section-label">Load & Distance</div>

          @if (selectedVehicle) {
            <div class="vehicle-info-banner">
              <mat-icon>info</mat-icon>
              <span><strong>{{selectedVehicle.registrationNumber}}</strong> — Max capacity: <strong>{{selectedVehicle.maxLoadCapacity}} kg</strong></span>
            </div>
          }

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Cargo Weight (kg)</mat-label>
              <mat-icon matPrefix class="field-prefix">inventory_2</mat-icon>
              <input matInput type="number" formControlName="cargoWeight"
                min="0" placeholder="0"
                (keypress)="numericOnly($event, true)">
              <span matSuffix class="unit-suffix">kg</span>
              @if (selectedVehicle && (!f('cargoWeight').invalid || !f('cargoWeight').touched)) {
                <mat-hint>Max allowed: {{selectedVehicle.maxLoadCapacity}} kg</mat-hint>
              }
              @if (f('cargoWeight').hasError('required') && f('cargoWeight').touched) {
                <mat-error>Cargo weight is required</mat-error>
              } @else if (f('cargoWeight').hasError('min') && f('cargoWeight').touched) {
                <mat-error>Weight cannot be negative</mat-error>
              } @else if (f('cargoWeight').hasError('max')) {
                <mat-error>Exceeds vehicle capacity of {{selectedVehicle?.maxLoadCapacity}} kg</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Planned Distance (km)</mat-label>
              <mat-icon matPrefix class="field-prefix">straighten</mat-icon>
              <input matInput type="number" formControlName="plannedDistance"
                min="0" placeholder="0"
                (keypress)="numericOnly($event, true)">
              <span matSuffix class="unit-suffix">km</span>
              @if (f('plannedDistance').hasError('min') && f('plannedDistance').touched) {
                <mat-error>Distance cannot be negative</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Notes (optional)</mat-label>
            <mat-icon matPrefix class="field-prefix">notes</mat-icon>
            <textarea matInput formControlName="notes" rows="2"
              placeholder="Any special instructions or remarks…" maxlength="500"></textarea>
            <mat-hint align="end">{{f('notes').value?.length || 0}}/500</mat-hint>
          </mat-form-field>

        </form>
      }
    </mat-dialog-content>

    <div class="dialog-actions">
      <button mat-button mat-dialog-close>
        <mat-icon>close</mat-icon> Cancel
      </button>
      <button mat-flat-button color="primary" (click)="save()"
        [disabled]="loadingData || form.invalid">
        <mat-icon>add_road</mat-icon> Create Trip
      </button>
    </div>
  `,
  styles: [`
    .dialog-header {
      display: flex; align-items: center; gap: 14px;
      padding: 20px 24px 12px; border-bottom: 1px solid #F1F5F9;
    }
    .dialog-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #06B6D4, #0891B2);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #fff; }
    }
    h2[mat-dialog-title] { margin: 0 0 2px; font-size: 17px; font-weight: 700; }
    .dialog-subtitle { margin: 0; font-size: 12px; color: #64748B; }

    mat-dialog-content { padding: 16px 24px !important; max-height: 65vh; }

    .loading-center {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 40px; color: #64748B; font-size: 13px;
    }

    .dialog-form { display: flex; flex-direction: column; }
    .section-label {
      font-size: 10px; font-weight: 700; color: #94A3B8;
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;
    }
    .form-row-2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;
    }
    mat-form-field { width: 100%; }
    .field-prefix { font-size: 18px; color: #94A3B8; margin-right: 4px; }
    .unit-suffix { font-size: 13px; color: #94A3B8; font-weight: 500; margin-right: 4px; }
    .option-hint { font-size: 11px; color: #94A3B8; margin-left: 4px; }

    .vehicle-info-banner {
      display: flex; align-items: center; gap: 8px;
      background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px;
      padding: 8px 12px; font-size: 13px; color: #1D4ED8; margin-bottom: 12px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .dialog-actions {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 12px 24px 16px; border-top: 1px solid #F1F5F9;
    }
  `]
})
export class TripDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<TripDialogComponent>);
  data = inject(MAT_DIALOG_DATA);
  private vehicleSvc = inject(VehicleService);
  private driverSvc = inject(DriverService);
  private cdr = inject(ChangeDetectorRef);

  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  selectedVehicle: Vehicle | null = null;
  loadingData = true;

  form = this.fb.group({
    source:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200), noWhitespace()]],
    destination:     ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200), noWhitespace()]],
    vehicleId:       [null as number | null, Validators.required],
    driverId:        [null as number | null, Validators.required],
    cargoWeight:     [0,  [Validators.required, Validators.min(0)]],
    plannedDistance: [0,  minIfPresent(0)],
    notes:           ['', Validators.maxLength(500)],
  });

  f(name: string) { return this.form.get(name)!; }

  ngOnInit() {
    Promise.all([
      this.vehicleSvc.getDispatchable().toPromise(),
      this.driverSvc.getDispatchable().toPromise(),
    ]).then(([v, d]) => {
      this.vehicles = v ?? [];
      this.drivers  = d ?? [];
      this.loadingData = false;
      this.cdr.detectChanges();
    });
  }

  onVehicleChange() {
    const id = this.form.value.vehicleId;
    this.selectedVehicle = this.vehicles.find(v => v.id === id) ?? null;
    if (this.selectedVehicle) {
      this.f('cargoWeight').setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(this.selectedVehicle.maxLoadCapacity)
      ]);
      this.f('cargoWeight').updateValueAndValidity();
    }
  }

  numericOnly(event: KeyboardEvent, allowDecimal = false) {
    const allowed = allowDecimal ? /[0-9.]/ : /[0-9]/;
    if (!allowed.test(event.key) && !['Backspace','Tab','Enter','ArrowLeft','ArrowRight','Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value);
  }
}
