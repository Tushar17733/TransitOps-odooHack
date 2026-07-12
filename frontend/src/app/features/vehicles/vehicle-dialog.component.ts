import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Vehicle } from '../../core/models';
import { noWhitespace, registrationNumber, minIfPresent } from '../../core/validators/app.validators';

@Component({
  selector: 'app-vehicle-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="dialog-header">
      <div class="dialog-icon">
        <mat-icon>{{data.vehicle ? 'edit' : 'directions_bus'}}</mat-icon>
      </div>
      <div>
        <h2 mat-dialog-title>{{data.vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}}</h2>
        <p class="dialog-subtitle">{{data.vehicle ? 'Update vehicle details' : 'Register a new vehicle in the fleet'}}</p>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <div class="section-label">Identity</div>
        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>Registration Number</mat-label>
            <mat-icon matPrefix class="field-prefix">pin</mat-icon>
            <input matInput formControlName="registrationNumber"
              placeholder="e.g. GJ01AB1234"
              (input)="toUpper('registrationNumber', $event)" maxlength="20">
            @if (!f('registrationNumber').invalid || !f('registrationNumber').touched) {
              <mat-hint>Uppercase letters, digits, hyphens only</mat-hint>
            }
            @if (f('registrationNumber').hasError('required') && f('registrationNumber').touched) {
              <mat-error>Registration number is required</mat-error>
            } @else if (f('registrationNumber').hasError('regNumber') && f('registrationNumber').touched) {
              <mat-error>Use uppercase letters and digits only (e.g. GJ01AB1234)</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Vehicle Name</mat-label>
            <mat-icon matPrefix class="field-prefix">label</mat-icon>
            <input matInput formControlName="name" placeholder="e.g. Main Delivery Van" maxlength="100">
            <mat-hint align="end">{{f('name').value?.length || 0}}/100</mat-hint>
            @if (f('name').hasError('required') && f('name').touched) {
              <mat-error>Vehicle name is required</mat-error>
            } @else if (f('name').hasError('whitespace') && f('name').touched) {
              <mat-error>Name cannot be blank spaces</mat-error>
            } @else if (f('name').hasError('minlength') && f('name').touched) {
              <mat-error>Name must be at least 2 characters</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>Model</mat-label>
            <mat-icon matPrefix class="field-prefix">directions_car</mat-icon>
            <input matInput formControlName="model" placeholder="e.g. Tata Ace 2022" maxlength="100">
            <mat-hint align="end">{{f('model').value?.length || 0}}/100</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Vehicle Type</mat-label>
            <mat-icon matPrefix class="field-prefix">category</mat-icon>
            <mat-select formControlName="type">
              @for (t of types; track t.value) {
                <mat-option [value]="t.value">
                  <mat-icon style="font-size:16px;margin-right:6px;vertical-align:middle">{{t.icon}}</mat-icon>
                  {{t.label}}
                </mat-option>
              }
            </mat-select>
            @if (f('type').hasError('required') && f('type').touched) {
              <mat-error>Please select a vehicle type</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-divider style="margin:8px 0 16px"/>
        <div class="section-label">Capacity & Financials</div>

        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>Max Load Capacity (kg)</mat-label>
            <mat-icon matPrefix class="field-prefix">weight</mat-icon>
            <input matInput type="number" formControlName="maxLoadCapacity"
              min="0" placeholder="e.g. 1000"
              (keypress)="numericOnly($event, true)">
            <span matSuffix class="unit-suffix">kg</span>
            @if (!f('maxLoadCapacity').invalid || !f('maxLoadCapacity').touched) {
              <mat-hint>Maximum cargo weight this vehicle can carry</mat-hint>
            }
            @if (f('maxLoadCapacity').hasError('required') && f('maxLoadCapacity').touched) {
              <mat-error>Max load capacity is required</mat-error>
            } @else if (f('maxLoadCapacity').hasError('min') && f('maxLoadCapacity').touched) {
              <mat-error>Must be 0 or greater</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Acquisition Cost (₹)</mat-label>
            <mat-icon matPrefix class="field-prefix">currency_rupee</mat-icon>
            <input matInput type="number" formControlName="acquisitionCost"
              min="0" placeholder="e.g. 800000"
              (keypress)="numericOnly($event, true)">
            <span matSuffix class="unit-suffix">₹</span>
            @if (!f('acquisitionCost').invalid || !f('acquisitionCost').touched) {
              <mat-hint>Purchase price — used for ROI reports</mat-hint>
            }
            @if (f('acquisitionCost').hasError('min') && f('acquisitionCost').touched) {
              <mat-error>Cost cannot be negative</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>Current Odometer (km)</mat-label>
            <mat-icon matPrefix class="field-prefix">speed</mat-icon>
            <input matInput type="number" formControlName="odometer"
              min="0" placeholder="e.g. 45000"
              (keypress)="numericOnly($event, true)">
            <span matSuffix class="unit-suffix">km</span>
            @if (f('odometer').hasError('min') && f('odometer').touched) {
              <mat-error>Odometer cannot be negative</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Region / Area</mat-label>
            <mat-icon matPrefix class="field-prefix">location_on</mat-icon>
            <input matInput formControlName="region" placeholder="e.g. Mumbai North" maxlength="100">
          </mat-form-field>
        </div>

      </form>
    </mat-dialog-content>

    <div class="dialog-actions">
      <button mat-button mat-dialog-close>
        <mat-icon>close</mat-icon> Cancel
      </button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        <mat-icon>{{data.vehicle ? 'save' : 'add'}}</mat-icon>
        {{data.vehicle ? 'Save Changes' : 'Add Vehicle'}}
      </button>
    </div>
  `,
  styles: [`
    .dialog-header {
      display: flex; align-items: center; gap: 14px;
      padding: 20px 24px 12px;
      border-bottom: 1px solid #F1F5F9;
    }
    .dialog-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #fff; }
    }
    h2[mat-dialog-title] { margin: 0 0 2px; font-size: 17px; font-weight: 700; }
    .dialog-subtitle { margin: 0; font-size: 12px; color: #64748B; }

    mat-dialog-content { padding: 16px 24px !important; max-height: 65vh; }

    .dialog-form { display: flex; flex-direction: column; gap: 0; }
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

    .dialog-actions {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 12px 24px 16px;
      border-top: 1px solid #F1F5F9;
    }
  `]
})
export class VehicleDialogComponent {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<VehicleDialogComponent>);
  data: { vehicle?: Vehicle } = inject(MAT_DIALOG_DATA);

  types = [
    { value: 'truck',      label: 'Truck',      icon: 'local_shipping' },
    { value: 'van',        label: 'Van',         icon: 'airport_shuttle' },
    { value: 'bus',        label: 'Bus',         icon: 'directions_bus' },
    { value: 'car',        label: 'Car',         icon: 'directions_car' },
    { value: 'motorcycle', label: 'Motorcycle',  icon: 'two_wheeler' },
  ];

  form = this.fb.group({
    registrationNumber: [
      (this.data.vehicle?.registrationNumber ?? '').toUpperCase(),
      [Validators.required, registrationNumber()]
    ],
    name: [
      this.data.vehicle?.name ?? '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100), noWhitespace()]
    ],
    model:           [this.data.vehicle?.model ?? '', Validators.maxLength(100)],
    type:            [this.data.vehicle?.type ?? '', Validators.required],
    maxLoadCapacity: [this.data.vehicle?.maxLoadCapacity ?? null, [Validators.required, Validators.min(0)]],
    acquisitionCost: [this.data.vehicle?.acquisitionCost ?? null, minIfPresent(0)],
    odometer:        [this.data.vehicle?.odometer ?? 0, minIfPresent(0)],
    region:          [this.data.vehicle?.region ?? '', Validators.maxLength(100)],
  });

  f(name: string) { return this.form.get(name)!; }

  toUpper(field: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const pos = input.selectionStart ?? input.value.length;
    const upper = input.value.toUpperCase();
    this.form.get(field)?.setValue(upper, { emitEvent: false });
    input.value = upper;
    input.setSelectionRange(pos, pos);
  }

  numericOnly(event: KeyboardEvent, allowDecimal = false) {
    const allowed = allowDecimal ? /[0-9.]/ : /[0-9]/;
    if (!allowed.test(event.key) && !['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value);
  }
}
