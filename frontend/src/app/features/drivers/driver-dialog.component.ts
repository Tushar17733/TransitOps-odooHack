import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Driver } from '../../core/models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-driver-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{data.driver ? 'Edit Driver' : 'Add Driver'}}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-row" style="margin-top:8px">
        <mat-form-field appearance="outline">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name">
          @if(form.get('name')?.hasError('required') && form.get('name')?.touched){<mat-error>Required</mat-error>}
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>License Number</mat-label>
          <input matInput formControlName="licenseNumber">
          @if(form.get('licenseNumber')?.hasError('required') && form.get('licenseNumber')?.touched){<mat-error>Required</mat-error>}
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>License Category</mat-label>
          <input matInput formControlName="licenseCategory" placeholder="HMV, LMV…">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>License Expiry Date</mat-label>
          <input matInput type="date" formControlName="licenseExpiryDate">
          @if(form.get('licenseExpiryDate')?.hasError('required') && form.get('licenseExpiryDate')?.touched){<mat-error>Required</mat-error>}
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Contact Number</mat-label>
          <input matInput formControlName="contactNumber">
        </mat-form-field>
        @if (data.driver && auth.hasRole('safety_officer')) {
          <mat-form-field appearance="outline">
            <mat-label>Safety Score (0–100)</mat-label>
            <input matInput type="number" formControlName="safetyScore" min="0" max="100">
          </mat-form-field>
        }
        @if (data.driver) {
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              @for (s of statuses; track s){ <mat-option [value]="s">{{s | titlecase}}</mat-option> }
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <div class="dialog-actions">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Save</button>
    </div>
  `
})
export class DriverDialogComponent {
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  dialogRef = inject(MatDialogRef<DriverDialogComponent>);
  data: { driver?: Driver } = inject(MAT_DIALOG_DATA);

  statuses = ['available', 'off_duty', 'suspended'];

  form = this.fb.group({
    name: [this.data.driver?.name ?? '', Validators.required],
    licenseNumber: [this.data.driver?.licenseNumber ?? '', Validators.required],
    licenseCategory: [this.data.driver?.licenseCategory ?? ''],
    licenseExpiryDate: [this.data.driver?.licenseExpiryDate ?? '', Validators.required],
    contactNumber: [this.data.driver?.contactNumber ?? ''],
    safetyScore: [this.data.driver?.safetyScore ?? 100],
    status: [this.data.driver?.status ?? 'available'],
  });

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value);
  }
}
