import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuelExpenseService } from '../../core/services/fuel-expense.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { AuthService } from '../../core/auth/auth.service';
import { Vehicle, FuelLog, Expense } from '../../core/models';
import { minIfPresent } from '../../core/validators/app.validators';

@Component({
  selector: 'app-fuel-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1>Fuel & Expenses</h1></div>

      <mat-tab-group>

        <!-- ── FUEL TAB ──────────────────────────────────────────────────────── -->
        @if (auth.hasRole('fleet_manager', 'driver')) {
          <mat-tab label="Fuel Logs">
            <div style="padding:16px">
              <div class="tab-toolbar">
                <mat-form-field appearance="outline" style="width:280px">
                  <mat-label>Select Vehicle</mat-label>
                  <mat-icon matPrefix class="field-prefix">directions_bus</mat-icon>
                  <mat-select [(value)]="fuelVehicleId" (selectionChange)="loadFuel()">
                    @for (v of vehicles; track v.id) {
                      <mat-option [value]="v.id">{{v.registrationNumber}} — {{v.name}}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <button mat-flat-button color="primary"
                  (click)="showFuelForm=!showFuelForm" [disabled]="!fuelVehicleId">
                  <mat-icon>{{showFuelForm ? 'close' : 'add'}}</mat-icon>
                  {{showFuelForm ? 'Cancel' : 'Log Fuel'}}
                </button>
              </div>

              @if (showFuelForm) {
                <mat-card class="form-card">
                  <div class="form-card-header">
                    <mat-icon>local_gas_station</mat-icon>
                    <span>New Fuel Entry</span>
                  </div>
                  <form [formGroup]="fuelForm" (ngSubmit)="submitFuel()" class="form-row-grid">

                    <mat-form-field appearance="outline">
                      <mat-label>Liters Filled</mat-label>
                      <mat-icon matPrefix class="field-prefix">opacity</mat-icon>
                      <input matInput type="number" formControlName="liters"
                        min="0.01" placeholder="e.g. 45.5"
                        (keypress)="numericOnly($event, true)">
                      <span matSuffix class="unit-suffix">L</span>
                      @if (!fuelForm.get('liters')?.invalid || !fuelForm.get('liters')?.touched) {
                        <mat-hint>Quantity of fuel added</mat-hint>
                      }
                      @if (fuelForm.get('liters')?.hasError('required') && fuelForm.get('liters')?.touched) {
                        <mat-error>Liters is required</mat-error>
                      } @else if (fuelForm.get('liters')?.hasError('min') && fuelForm.get('liters')?.touched) {
                        <mat-error>Must be greater than 0</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Cost per Liter (₹)</mat-label>
                      <mat-icon matPrefix class="field-prefix">currency_rupee</mat-icon>
                      <input matInput type="number" formControlName="costPerLiter"
                        min="0" placeholder="e.g. 96.50"
                        (keypress)="numericOnly($event, true)">
                      <span matSuffix class="unit-suffix">₹/L</span>
                      @if (!fuelForm.get('costPerLiter')?.invalid || !fuelForm.get('costPerLiter')?.touched) {
                        <mat-hint>Price at the pump</mat-hint>
                      }
                      @if (fuelForm.get('costPerLiter')?.hasError('required') && fuelForm.get('costPerLiter')?.touched) {
                        <mat-error>Cost per liter is required</mat-error>
                      } @else if (fuelForm.get('costPerLiter')?.hasError('min') && fuelForm.get('costPerLiter')?.touched) {
                        <mat-error>Must be 0 or greater</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Date</mat-label>
                      <mat-icon matPrefix class="field-prefix">event</mat-icon>
                      <input matInput type="date" formControlName="date" [max]="today">
                      <mat-hint>Cannot be a future date</mat-hint>
                      @if (fuelForm.get('date')?.hasError('required') && fuelForm.get('date')?.touched) {
                        <mat-error>Date is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Odometer Reading (km)</mat-label>
                      <mat-icon matPrefix class="field-prefix">speed</mat-icon>
                      <input matInput type="number" formControlName="odometer"
                        min="0" placeholder="e.g. 47500"
                        (keypress)="numericOnly($event)">
                      <span matSuffix class="unit-suffix">km</span>
                      <mat-hint>Optional — for mileage tracking</mat-hint>
                      @if (fuelForm.get('odometer')?.hasError('min') && fuelForm.get('odometer')?.touched) {
                        <mat-error>Odometer cannot be negative</mat-error>
                      }
                    </mat-form-field>

                    @if (totalFuelCost > 0) {
                      <div class="cost-preview">
                        <mat-icon>calculate</mat-icon>
                        Total: <strong>₹ {{totalFuelCost | number:'1.2-2'}}</strong>
                      </div>
                    }

                    <div class="form-actions" [style.grid-column]="totalFuelCost > 0 ? '2' : '1/-1'">
                      <button mat-button type="button" (click)="showFuelForm=false">Cancel</button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="fuelForm.invalid">
                        <mat-icon>save</mat-icon> Save Fuel Log
                      </button>
                    </div>
                  </form>
                </mat-card>
              }

              <div class="table-container">
                <table mat-table [dataSource]="fuelSource">
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let f">{{f.date}}</td>
                  </ng-container>
                  <ng-container matColumnDef="liters">
                    <th mat-header-cell *matHeaderCellDef>Liters</th>
                    <td mat-cell *matCellDef="let f">{{f.liters}} L</td>
                  </ng-container>
                  <ng-container matColumnDef="costPerLiter">
                    <th mat-header-cell *matHeaderCellDef>₹/L</th>
                    <td mat-cell *matCellDef="let f">₹ {{f.costPerLiter}}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalCost">
                    <th mat-header-cell *matHeaderCellDef>Total (₹)</th>
                    <td mat-cell *matCellDef="let f"><strong class="amount">₹ {{f.totalCost | number:'1.2-2'}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="odometer">
                    <th mat-header-cell *matHeaderCellDef>Odometer</th>
                    <td mat-cell *matCellDef="let f">{{f.odometer ? (f.odometer + ' km') : '—'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="fuelCols"></tr>
                  <tr mat-row *matRowDef="let r; columns:fuelCols;"></tr>
                  <tr class="mat-row" *matNoDataRow>
                    <td colspan="5">
                      <div class="empty-state">
                        <mat-icon>local_gas_station</mat-icon>
                        <p>{{fuelVehicleId ? 'No fuel logs yet' : 'Select a vehicle to view logs'}}</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </mat-tab>
        }

        <!-- ── EXPENSES TAB ──────────────────────────────────────────────────── -->
        @if (auth.hasRole('fleet_manager', 'financial_analyst')) {
          <mat-tab label="Expenses">
            <div style="padding:16px">
              <div class="tab-toolbar">
                <mat-form-field appearance="outline" style="width:280px">
                  <mat-label>Select Vehicle</mat-label>
                  <mat-icon matPrefix class="field-prefix">directions_bus</mat-icon>
                  <mat-select [(value)]="expVehicleId" (selectionChange)="loadExpenses()">
                    @for (v of vehicles; track v.id) {
                      <mat-option [value]="v.id">{{v.registrationNumber}} — {{v.name}}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <button mat-flat-button color="primary"
                  (click)="showExpForm=!showExpForm" [disabled]="!expVehicleId">
                  <mat-icon>{{showExpForm ? 'close' : 'add'}}</mat-icon>
                  {{showExpForm ? 'Cancel' : 'Log Expense'}}
                </button>
              </div>

              @if (showExpForm) {
                <mat-card class="form-card">
                  <div class="form-card-header">
                    <mat-icon>receipt_long</mat-icon>
                    <span>New Expense Entry</span>
                  </div>
                  <form [formGroup]="expForm" (ngSubmit)="submitExp()" class="form-row-grid">

                    <mat-form-field appearance="outline">
                      <mat-label>Expense Type</mat-label>
                      <mat-icon matPrefix class="field-prefix">category</mat-icon>
                      <mat-select formControlName="type">
                        @for (t of expTypes; track t.value) {
                          <mat-option [value]="t.value">
                            <mat-icon style="font-size:16px;vertical-align:middle;margin-right:6px">{{t.icon}}</mat-icon>
                            {{t.label}}
                          </mat-option>
                        }
                      </mat-select>
                      @if (expForm.get('type')?.hasError('required') && expForm.get('type')?.touched) {
                        <mat-error>Please select an expense type</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Amount (₹)</mat-label>
                      <mat-icon matPrefix class="field-prefix">currency_rupee</mat-icon>
                      <input matInput type="number" formControlName="amount"
                        min="0" placeholder="e.g. 250"
                        (keypress)="numericOnly($event, true)">
                      <span matSuffix class="unit-suffix">₹</span>
                      @if (expForm.get('amount')?.hasError('required') && expForm.get('amount')?.touched) {
                        <mat-error>Amount is required</mat-error>
                      } @else if (expForm.get('amount')?.hasError('min') && expForm.get('amount')?.touched) {
                        <mat-error>Amount cannot be negative</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Date</mat-label>
                      <mat-icon matPrefix class="field-prefix">event</mat-icon>
                      <input matInput type="date" formControlName="date" [max]="today">
                      <mat-hint>Cannot be a future date</mat-hint>
                      @if (expForm.get('date')?.hasError('required') && expForm.get('date')?.touched) {
                        <mat-error>Date is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Description (optional)</mat-label>
                      <mat-icon matPrefix class="field-prefix">notes</mat-icon>
                      <input matInput formControlName="description"
                        placeholder="e.g. NH-48 toll gate" maxlength="200">
                      <mat-hint align="end">{{expForm.get('description')?.value?.length || 0}}/200</mat-hint>
                    </mat-form-field>

                    <div class="form-actions" style="grid-column:1/-1">
                      <button mat-button type="button" (click)="showExpForm=false">Cancel</button>
                      <button mat-flat-button color="primary" type="submit" [disabled]="expForm.invalid">
                        <mat-icon>save</mat-icon> Save Expense
                      </button>
                    </div>
                  </form>
                </mat-card>
              }

              <div class="table-container">
                <table mat-table [dataSource]="expSource">
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let e">{{e.date}}</td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let e">{{e.type | titlecase}}</td>
                  </ng-container>
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount (₹)</th>
                    <td mat-cell *matCellDef="let e"><strong class="amount">₹ {{e.amount | number:'1.2-2'}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let e">{{e.description || '—'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="expCols"></tr>
                  <tr mat-row *matRowDef="let r; columns:expCols;"></tr>
                  <tr class="mat-row" *matNoDataRow>
                    <td colspan="4">
                      <div class="empty-state">
                        <mat-icon>receipt</mat-icon>
                        <p>{{expVehicleId ? 'No expenses yet' : 'Select a vehicle to view expenses'}}</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </mat-tab>
        }

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tab-toolbar {
      display: flex; gap: 12px; margin-bottom: 16px;
      justify-content: space-between; flex-wrap: wrap; align-items: center;
    }
    .field-prefix { font-size: 18px; color: #94A3B8; margin-right: 4px; }
    .unit-suffix { font-size: 13px; color: #94A3B8; font-weight: 500; margin-right: 4px; }
    .amount { color: #6366F1; }

    .form-card {
      margin-bottom: 16px; padding: 16px;
      border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: none;
    }
    .form-card-header {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 14px;
      mat-icon { color: #6366F1; }
    }
    .form-row-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      mat-form-field { width: 100%; }
    }
    .form-actions {
      display: flex; justify-content: flex-end; gap: 8px; align-items: center;
    }
    .cost-preview {
      display: flex; align-items: center; gap: 6px;
      background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px;
      padding: 8px 14px; font-size: 13px; color: #1D4ED8;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `]
})
export class FuelExpenseComponent implements OnInit {
  private svc = inject(FuelExpenseService);
  private vehicleSvc = inject(VehicleService);
  auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  vehicles: Vehicle[] = [];
  fuelVehicleId: number | null = null;
  expVehicleId: number | null = null;
  showFuelForm = false;
  showExpForm = false;
  today = new Date().toISOString().split('T')[0];

  expTypes = [
    { value: 'toll',    label: 'Toll',    icon: 'toll' },
    { value: 'parking', label: 'Parking', icon: 'local_parking' },
    { value: 'other',   label: 'Other',   icon: 'more_horiz' },
  ];

  fuelCols = ['date', 'liters', 'costPerLiter', 'totalCost', 'odometer'];
  expCols  = ['date', 'type', 'amount', 'description'];
  fuelSource = new MatTableDataSource<FuelLog>();
  expSource  = new MatTableDataSource<Expense>();

  fuelForm = this.fb.group({
    liters:       [null as number | null, [Validators.required, Validators.min(0.01)]],
    costPerLiter: [null as number | null, [Validators.required, Validators.min(0)]],
    date:         [this.today, Validators.required],
    odometer:     [null as number | null, minIfPresent(0)],
  });

  expForm = this.fb.group({
    type:        ['toll', Validators.required],
    amount:      [null as number | null, [Validators.required, Validators.min(0)]],
    date:        [this.today, Validators.required],
    description: [''],
  });

  get totalFuelCost(): number {
    const l = +(this.fuelForm.value.liters ?? 0);
    const c = +(this.fuelForm.value.costPerLiter ?? 0);
    return l > 0 && c > 0 ? l * c : 0;
  }

  ngOnInit() {
    this.vehicleSvc.list().subscribe(v => { this.vehicles = v; this.cdr.detectChanges(); });
  }

  loadFuel() {
    if (!this.fuelVehicleId) return;
    this.svc.getFuelByVehicle(this.fuelVehicleId).subscribe(l => { this.fuelSource.data = l; this.cdr.detectChanges(); });
  }

  loadExpenses() {
    if (!this.expVehicleId) return;
    this.svc.getExpensesByVehicle(this.expVehicleId).subscribe(e => { this.expSource.data = e; this.cdr.detectChanges(); });
  }

  submitFuel() {
    if (!this.fuelVehicleId || this.fuelForm.invalid) { this.fuelForm.markAllAsTouched(); return; }
    this.svc.logFuel({ vehicleId: this.fuelVehicleId, ...this.fuelForm.value as any }).subscribe({
      next: () => {
        this.snack.open('Fuel logged!', '', { duration: 3000 });
        this.showFuelForm = false;
        this.fuelForm.reset({ date: this.today });
        this.cdr.detectChanges();
        this.loadFuel();
      }
    });
  }

  submitExp() {
    if (!this.expVehicleId || this.expForm.invalid) { this.expForm.markAllAsTouched(); return; }
    this.svc.logExpense({ vehicleId: this.expVehicleId, ...this.expForm.value as any }).subscribe({
      next: () => {
        this.snack.open('Expense logged!', '', { duration: 3000 });
        this.showExpForm = false;
        this.expForm.reset({ type: 'toll', date: this.today });
        this.cdr.detectChanges();
        this.loadExpenses();
      }
    });
  }

  numericOnly(event: KeyboardEvent, allowDecimal = false) {
    const ok = allowDecimal ? /[0-9.]/ : /[0-9]/;
    if (!ok.test(event.key) && !['Backspace','Tab','Enter','ArrowLeft','ArrowRight','Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }
}
