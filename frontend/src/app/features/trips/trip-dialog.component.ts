import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleService } from '../../core/services/vehicle.service';
import { DriverService } from '../../core/services/driver.service';
import { Vehicle, Driver } from '../../core/models';

@Component({
  selector: 'app-trip-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Create Trip</h2>
    <mat-dialog-content>
      @if (loadingData) {
        <div style="display:flex;justify-content:center;padding:32px"><mat-spinner diameter="36"/></div>
      } @else {
        <form [formGroup]="form" class="form-row" style="margin-top:8px">
          <mat-form-field appearance="outline">
            <mat-label>Source</mat-label>
            <input matInput formControlName="source">
            @if(form.get('source')?.hasError('required') && form.get('source')?.touched){<mat-error>Required</mat-error>}
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Destination</mat-label>
            <input matInput formControlName="destination">
            @if(form.get('destination')?.hasError('required') && form.get('destination')?.touched){<mat-error>Required</mat-error>}
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Vehicle (Available only)</mat-label>
            <mat-select formControlName="vehicleId" (selectionChange)="onVehicleChange()">
              @for (v of vehicles; track v.id){
                <mat-option [value]="v.id">{{v.registrationNumber}} — {{v.name}} (Max: {{v.maxLoadCapacity}}kg)</mat-option>
              }
            </mat-select>
            @if(form.get('vehicleId')?.hasError('required') && form.get('vehicleId')?.touched){<mat-error>Required</mat-error>}
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Driver (Available only)</mat-label>
            <mat-select formControlName="driverId">
              @for (d of drivers; track d.id){
                <mat-option [value]="d.id">{{d.name}} — {{d.licenseNumber}}</mat-option>
              }
            </mat-select>
            @if(form.get('driverId')?.hasError('required') && form.get('driverId')?.touched){<mat-error>Required</mat-error>}
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Cargo Weight (kg)</mat-label>
            <input matInput type="number" formControlName="cargoWeight" min="0">
            @if(form.get('cargoWeight')?.hasError('required') && form.get('cargoWeight')?.touched){<mat-error>Required</mat-error>}
            @if(form.get('cargoWeight')?.hasError('max')){
              <mat-error>Exceeds vehicle max load capacity ({{selectedVehicle?.maxLoadCapacity}}kg)</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Planned Distance (km)</mat-label>
            <input matInput type="number" formControlName="plannedDistance" min="0">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column: 1 / -1">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>
    <div class="dialog-actions">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="loadingData">Save</button>
    </div>
  `
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
    source: ['', Validators.required],
    destination: ['', Validators.required],
    vehicleId: [null as number | null, Validators.required],
    driverId: [null as number | null, Validators.required],
    cargoWeight: [0, [Validators.required, Validators.min(0)]],
    plannedDistance: [0],
    notes: [''],
  });

  ngOnInit() {
    Promise.all([
      this.vehicleSvc.getDispatchable().toPromise(),
      this.driverSvc.getDispatchable().toPromise(),
    ]).then(([v, d]) => {
      this.vehicles = v ?? [];
      this.drivers = d ?? [];
      this.loadingData = false;
      this.cdr.detectChanges();
    });
  }

  onVehicleChange() {
    const id = this.form.value.vehicleId;
    this.selectedVehicle = this.vehicles.find(v => v.id === id) ?? null;
    if (this.selectedVehicle) {
      this.form.get('cargoWeight')?.setValidators([
        Validators.required, Validators.min(0), Validators.max(this.selectedVehicle.maxLoadCapacity)
      ]);
      this.form.get('cargoWeight')?.updateValueAndValidity();
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value);
  }
}
