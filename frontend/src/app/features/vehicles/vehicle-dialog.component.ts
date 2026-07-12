import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Vehicle } from '../../core/models';

@Component({
  selector: 'app-vehicle-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{data.vehicle ? 'Edit Vehicle' : 'Add Vehicle'}}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-row" style="margin-top:8px">
        <mat-form-field appearance="outline">
          <mat-label>Registration Number</mat-label>
          <input matInput formControlName="registrationNumber">
          @if (form.get('registrationNumber')?.hasError('required') && form.get('registrationNumber')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Vehicle Name</mat-label>
          <input matInput formControlName="name">
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Model</mat-label>
          <input matInput formControlName="model">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            @for (t of types; track t) { <mat-option [value]="t">{{t | titlecase}}</mat-option> }
          </mat-select>
          @if (form.get('type')?.hasError('required') && form.get('type')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Max Load Capacity (kg)</mat-label>
          <input matInput type="number" formControlName="maxLoadCapacity">
          @if (form.get('maxLoadCapacity')?.hasError('required') && form.get('maxLoadCapacity')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Acquisition Cost (₹)</mat-label>
          <input matInput type="number" formControlName="acquisitionCost">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Odometer (km)</mat-label>
          <input matInput type="number" formControlName="odometer">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Region</mat-label>
          <input matInput formControlName="region">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <div class="dialog-actions">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Save</button>
    </div>
  `
})
export class VehicleDialogComponent {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<VehicleDialogComponent>);
  data: { vehicle?: Vehicle } = inject(MAT_DIALOG_DATA);

  types = ['truck', 'van', 'bus', 'car', 'motorcycle'];

  form = this.fb.group({
    registrationNumber: [this.data.vehicle?.registrationNumber ?? '', Validators.required],
    name: [this.data.vehicle?.name ?? '', Validators.required],
    model: [this.data.vehicle?.model ?? ''],
    type: [this.data.vehicle?.type ?? '', Validators.required],
    maxLoadCapacity: [this.data.vehicle?.maxLoadCapacity ?? null, [Validators.required, Validators.min(0)]],
    acquisitionCost: [this.data.vehicle?.acquisitionCost ?? null],
    odometer: [this.data.vehicle?.odometer ?? 0],
    region: [this.data.vehicle?.region ?? ''],
  });

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value);
  }
}
