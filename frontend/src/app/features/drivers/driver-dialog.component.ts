import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Driver } from '../../core/models';
import { AuthService } from '../../core/auth/auth.service';
import { noWhitespace, phoneNumber, licenseNumber } from '../../core/validators/app.validators';

@Component({
  selector: 'app-driver-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="dialog-header">
      <div class="dialog-icon">
        <mat-icon>{{data.driver ? 'edit' : 'person_add'}}</mat-icon>
      </div>
      <div>
        <h2 mat-dialog-title>{{data.driver ? 'Edit Driver' : 'Add New Driver'}}</h2>
        <p class="dialog-subtitle">{{data.driver ? 'Update driver details' : 'Register a new driver'}}</p>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <div class="section-label">Personal Details</div>
        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <mat-icon matPrefix class="field-prefix">person</mat-icon>
            <input matInput formControlName="name" placeholder="e.g. Rajesh Kumar" maxlength="100">
            <mat-hint align="end">{{f('name').value?.length || 0}}/100</mat-hint>
            @if (f('name').hasError('required') && f('name').touched) {
              <mat-error>Full name is required</mat-error>
            } @else if (f('name').hasError('whitespace') && f('name').touched) {
              <mat-error>Name cannot be blank spaces</mat-error>
            } @else if (f('name').hasError('minlength') && f('name').touched) {
              <mat-error>Name must be at least 2 characters</mat-error>
            } @else if (f('name').hasError('pattern') && f('name').touched) {
              <mat-error>Name can only contain letters and spaces</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contact Number</mat-label>
            <mat-icon matPrefix class="field-prefix">phone</mat-icon>
            <input matInput formControlName="contactNumber"
              placeholder="10-digit mobile number"
              maxlength="10"
              inputmode="numeric"
              (input)="digitsOnly('contactNumber', $event)">
            @if (!f('contactNumber').invalid || !f('contactNumber').touched) {
              <mat-hint>Enter 10-digit mobile number</mat-hint>
            }
            @if (f('contactNumber').hasError('required') && f('contactNumber').touched) {
              <mat-error>Contact number is required</mat-error>
            } @else if (f('contactNumber').hasError('phone') && f('contactNumber').touched) {
              <mat-error>Enter a valid 10-digit mobile number</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-divider style="margin:4px 0 16px"/>
        <div class="section-label">License Details</div>

        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>License Number</mat-label>
            <mat-icon matPrefix class="field-prefix">credit_card</mat-icon>
            <input matInput formControlName="licenseNumber"
              placeholder="e.g. GJ0120110149868"
              (input)="toUpper('licenseNumber', $event)"
              maxlength="20">
            @if (!f('licenseNumber').invalid || !f('licenseNumber').touched) {
              <mat-hint>Uppercase letters, digits, hyphens</mat-hint>
            }
            @if (f('licenseNumber').hasError('required') && f('licenseNumber').touched) {
              <mat-error>License number is required</mat-error>
            } @else if (f('licenseNumber').hasError('licenseNum') && f('licenseNumber').touched) {
              <mat-error>Invalid format — 5 to 20 alphanumeric characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>License Category</mat-label>
            <mat-icon matPrefix class="field-prefix">class</mat-icon>
            <mat-select formControlName="licenseCategory">
              <mat-option value="">— Not specified —</mat-option>
              @for (c of licenseCategories; track c.value) {
                <mat-option [value]="c.value">
                  <strong>{{c.value}}</strong>&nbsp;&nbsp;<span class="cat-desc">{{c.desc}}</span>
                </mat-option>
              }
            </mat-select>
            <mat-hint>Select the highest applicable category</mat-hint>
          </mat-form-field>
        </div>

        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>License Expiry Date</mat-label>
            <mat-icon matPrefix class="field-prefix">event</mat-icon>
            <input matInput type="date" formControlName="licenseExpiryDate"
              [min]="isNew ? today : ''"
              [class.expiry-warn]="isExpiringSoon">
            @if (!f('licenseExpiryDate').invalid || !f('licenseExpiryDate').touched || isExpiringSoon) {
              <mat-hint>{{isExpiringSoon ? '⚠ License expiring soon' : 'Must be a future date for new drivers'}}</mat-hint>
            }
            @if (f('licenseExpiryDate').hasError('required') && f('licenseExpiryDate').touched) {
              <mat-error>Expiry date is required</mat-error>
            } @else if (f('licenseExpiryDate').hasError('min') && f('licenseExpiryDate').touched) {
              <mat-error>License must not be expired for new drivers</mat-error>
            }
          </mat-form-field>

          @if (data.driver && auth.hasRole('safety_officer')) {
            <mat-form-field appearance="outline">
              <mat-label>Safety Score</mat-label>
              <mat-icon matPrefix class="field-prefix">verified_user</mat-icon>
              <input matInput type="number" formControlName="safetyScore"
                min="0" max="100" placeholder="0–100"
                (keypress)="numericOnly($event)">
              <span matSuffix class="unit-suffix">/100</span>
              <mat-hint>Driving safety rating</mat-hint>
              @if (f('safetyScore').hasError('min') && f('safetyScore').touched) {
                <mat-error>Score must be 0 or above</mat-error>
              } @else if (f('safetyScore').hasError('max') && f('safetyScore').touched) {
                <mat-error>Score cannot exceed 100</mat-error>
              }
            </mat-form-field>
          }
        </div>

        @if (data.driver) {
          <mat-divider style="margin:4px 0 16px"/>
          <div class="section-label">Status</div>
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Driver Status</mat-label>
            <mat-icon matPrefix class="field-prefix">toggle_on</mat-icon>
            <mat-select formControlName="status">
              @for (s of statuses; track s.value) {
                <mat-option [value]="s.value">
                  <span class="status-dot {{s.value}}"></span> {{s.label}}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

      </form>
    </mat-dialog-content>

    <div class="dialog-actions">
      <button mat-button mat-dialog-close>
        <mat-icon>close</mat-icon> Cancel
      </button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        <mat-icon>{{data.driver ? 'save' : 'person_add'}}</mat-icon>
        {{data.driver ? 'Save Changes' : 'Add Driver'}}
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
      background: linear-gradient(135deg, #10B981, #059669);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #fff; }
    }
    h2[mat-dialog-title] { margin: 0 0 2px; font-size: 17px; font-weight: 700; }
    .dialog-subtitle { margin: 0; font-size: 12px; color: #64748B; }

    mat-dialog-content { padding: 16px 24px !important; max-height: 65vh; }

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
    .cat-desc { font-size: 11px; color: #94A3B8; }

    .status-dot {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px;
      &.available   { background: #10B981; }
      &.off_duty    { background: #F59E0B; }
      &.suspended   { background: #EF4444; }
    }

    input.expiry-warn { color: #D97706; }

    .dialog-actions {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 12px 24px 16px; border-top: 1px solid #F1F5F9;
    }
  `]
})
export class DriverDialogComponent {
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  dialogRef = inject(MatDialogRef<DriverDialogComponent>);
  data: { driver?: Driver } = inject(MAT_DIALOG_DATA);

  today = new Date().toISOString().split('T')[0];
  get isNew() { return !this.data.driver; }

  get isExpiringSoon() {
    const val = this.f('licenseExpiryDate').value as string;
    if (!val) return false;
    const diff = (new Date(val).getTime() - Date.now()) / 86_400_000;
    return diff >= 0 && diff < 30;
  }

  licenseCategories = [
    { value: 'LMV',   desc: 'Light Motor Vehicle' },
    { value: 'HMV',   desc: 'Heavy Motor Vehicle' },
    { value: 'MCWG',  desc: 'Motorcycle with gear' },
    { value: 'TRANS', desc: 'Transport vehicle' },
    { value: 'PSV',   desc: 'Public Service Vehicle' },
  ];

  statuses = [
    { value: 'available', label: 'Available' },
    { value: 'off_duty',  label: 'Off Duty' },
    { value: 'suspended', label: 'Suspended' },
  ];

  form = this.fb.group({
    name: [
      this.data.driver?.name ?? '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100),
       noWhitespace(), Validators.pattern(/^[a-zA-Z\s'.]+$/)]
    ],
    contactNumber: [
      this.data.driver?.contactNumber ?? '',
      [Validators.required, phoneNumber()]
    ],
    licenseNumber: [
      (this.data.driver?.licenseNumber ?? '').toUpperCase(),
      [Validators.required, licenseNumber()]
    ],
    licenseCategory: [this.data.driver?.licenseCategory ?? ''],
    licenseExpiryDate: [
      this.data.driver?.licenseExpiryDate ?? '',
      this.isNew
        ? [Validators.required, Validators.min(this.today as any)]
        : [Validators.required]
    ],
    safetyScore: [
      this.data.driver?.safetyScore ?? 100,
      [Validators.min(0), Validators.max(100)]
    ],
    status: [this.data.driver?.status ?? 'available'],
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

  digitsOnly(field: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/[^0-9]/g, '').slice(0, 10);
    this.form.get(field)?.setValue(digits, { emitEvent: true });
    input.value = digits;
  }

  numericOnly(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key) && !['Backspace','Tab','Enter','ArrowLeft','ArrowRight','Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value);
  }
}
