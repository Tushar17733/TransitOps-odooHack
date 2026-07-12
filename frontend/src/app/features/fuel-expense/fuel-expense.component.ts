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
        <!-- FUEL TAB -->
        <mat-tab label="Fuel Logs">
          <div style="padding:16px">
            <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-end;flex-wrap:wrap">
              <mat-form-field appearance="outline" style="width:240px">
                <mat-label>Select Vehicle</mat-label>
                <mat-select [(value)]="fuelVehicleId" (selectionChange)="loadFuel()">
                  @for (v of vehicles; track v.id){ <mat-option [value]="v.id">{{v.registrationNumber}} — {{v.name}}</mat-option> }
                </mat-select>
              </mat-form-field>
              @if (auth.hasRole('fleet_manager', 'driver')) {
                <button mat-flat-button color="primary" (click)="showFuelForm=!showFuelForm" [disabled]="!fuelVehicleId">
                  <mat-icon>add</mat-icon> Log Fuel
                </button>
              }
            </div>
            @if (showFuelForm) {
              <mat-card style="margin-bottom:16px;padding:16px">
                <form [formGroup]="fuelForm" (ngSubmit)="submitFuel()" class="form-row">
                  <mat-form-field appearance="outline"><mat-label>Liters</mat-label><input matInput type="number" formControlName="liters"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Cost/Liter (₹)</mat-label><input matInput type="number" formControlName="costPerLiter"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Date</mat-label><input matInput type="date" formControlName="date"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Odometer (km)</mat-label><input matInput type="number" formControlName="odometer"></mat-form-field>
                  <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px">
                    <button mat-button type="button" (click)="showFuelForm=false">Cancel</button>
                    <button mat-flat-button color="primary" type="submit">Save</button>
                  </div>
                </form>
              </mat-card>
            }
            <div class="table-container">
              <table mat-table [dataSource]="fuelSource">
                <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let f">{{f.date}}</td></ng-container>
                <ng-container matColumnDef="liters"><th mat-header-cell *matHeaderCellDef>Liters</th><td mat-cell *matCellDef="let f">{{f.liters}}</td></ng-container>
                <ng-container matColumnDef="costPerLiter"><th mat-header-cell *matHeaderCellDef>₹/L</th><td mat-cell *matCellDef="let f">{{f.costPerLiter}}</td></ng-container>
                <ng-container matColumnDef="totalCost"><th mat-header-cell *matHeaderCellDef>Total (₹)</th><td mat-cell *matCellDef="let f"><strong>{{f.totalCost | number:'1.2-2'}}</strong></td></ng-container>
                <ng-container matColumnDef="odometer"><th mat-header-cell *matHeaderCellDef>Odometer</th><td mat-cell *matCellDef="let f">{{f.odometer || '—'}}</td></ng-container>
                <tr mat-header-row *matHeaderRowDef="fuelCols"></tr>
                <tr mat-row *matRowDef="let r; columns:fuelCols;"></tr>
                <tr class="mat-row" *matNoDataRow><td colspan="5"><div class="empty-state"><mat-icon>local_gas_station</mat-icon><p>No fuel logs — select a vehicle</p></div></td></tr>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- EXPENSES TAB -->
        <mat-tab label="Expenses">
          <div style="padding:16px">
            <div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-end;flex-wrap:wrap">
              <mat-form-field appearance="outline" style="width:240px">
                <mat-label>Select Vehicle</mat-label>
                <mat-select [(value)]="expVehicleId" (selectionChange)="loadExpenses()">
                  @for (v of vehicles; track v.id){ <mat-option [value]="v.id">{{v.registrationNumber}} — {{v.name}}</mat-option> }
                </mat-select>
              </mat-form-field>
              @if (auth.hasRole('fleet_manager', 'financial_analyst')) {
                <button mat-flat-button color="primary" (click)="showExpForm=!showExpForm" [disabled]="!expVehicleId">
                  <mat-icon>add</mat-icon> Log Expense
                </button>
              }
            </div>
            @if (showExpForm) {
              <mat-card style="margin-bottom:16px;padding:16px">
                <form [formGroup]="expForm" (ngSubmit)="submitExp()" class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Type</mat-label>
                    <mat-select formControlName="type">
                      @for (t of expTypes; track t){ <mat-option [value]="t">{{t | titlecase}}</mat-option> }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Amount (₹)</mat-label><input matInput type="number" formControlName="amount"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Date</mat-label><input matInput type="date" formControlName="date"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Description</mat-label><input matInput formControlName="description"></mat-form-field>
                  <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px">
                    <button mat-button type="button" (click)="showExpForm=false">Cancel</button>
                    <button mat-flat-button color="primary" type="submit">Save</button>
                  </div>
                </form>
              </mat-card>
            }
            <div class="table-container">
              <table mat-table [dataSource]="expSource">
                <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let e">{{e.date}}</td></ng-container>
                <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Type</th><td mat-cell *matCellDef="let e">{{e.type | titlecase}}</td></ng-container>
                <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount (₹)</th><td mat-cell *matCellDef="let e"><strong>{{e.amount | number:'1.2-2'}}</strong></td></ng-container>
                <ng-container matColumnDef="description"><th mat-header-cell *matHeaderCellDef>Description</th><td mat-cell *matCellDef="let e">{{e.description || '—'}}</td></ng-container>
                <tr mat-header-row *matHeaderRowDef="expCols"></tr>
                <tr mat-row *matRowDef="let r; columns:expCols;"></tr>
                <tr class="mat-row" *matNoDataRow><td colspan="4"><div class="empty-state"><mat-icon>receipt</mat-icon><p>No expenses — select a vehicle</p></div></td></tr>
              </table>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
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
  expTypes = ['toll', 'parking', 'other'];

  fuelCols = ['date', 'liters', 'costPerLiter', 'totalCost', 'odometer'];
  expCols = ['date', 'type', 'amount', 'description'];
  fuelSource = new MatTableDataSource<FuelLog>();
  expSource = new MatTableDataSource<Expense>();

  today = new Date().toISOString().split('T')[0];

  fuelForm = this.fb.group({
    liters: [null, [Validators.required, Validators.min(0.01)]],
    costPerLiter: [null, [Validators.required, Validators.min(0)]],
    date: [this.today, Validators.required],
    odometer: [null],
  });

  expForm = this.fb.group({
    type: ['toll', Validators.required],
    amount: [null, [Validators.required, Validators.min(0)]],
    date: [this.today, Validators.required],
    description: [''],
  });

  ngOnInit() { this.vehicleSvc.list().subscribe(v => { this.vehicles = v; this.cdr.detectChanges(); }); }

  loadFuel() {
    if (!this.fuelVehicleId) return;
    this.svc.getFuelByVehicle(this.fuelVehicleId).subscribe(l => { this.fuelSource.data = l; this.cdr.detectChanges(); });
  }

  loadExpenses() {
    if (!this.expVehicleId) return;
    this.svc.getExpensesByVehicle(this.expVehicleId).subscribe(e => { this.expSource.data = e; this.cdr.detectChanges(); });
  }

  submitFuel() {
    if (!this.fuelVehicleId || this.fuelForm.invalid) return;
    this.svc.logFuel({ vehicleId: this.fuelVehicleId, ...this.fuelForm.value as any }).subscribe({
      next: () => { this.snack.open('Fuel logged!', '', { duration: 3000 }); this.showFuelForm = false; this.cdr.detectChanges(); this.loadFuel(); }
    });
  }

  submitExp() {
    if (!this.expVehicleId || this.expForm.invalid) return;
    this.svc.logExpense({ vehicleId: this.expVehicleId, ...this.expForm.value as any }).subscribe({
      next: () => { this.snack.open('Expense logged!', '', { duration: 3000 }); this.showExpForm = false; this.cdr.detectChanges(); this.loadExpenses(); }
    });
  }
}
