import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatCardModule, MatProgressSpinnerModule, MatProgressBarModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p class="page-subtitle">Financial and operational insights for your fleet</p>
        </div>
      </div>

      <mat-tab-group class="reports-tabs" animationDuration="200ms">

        <!-- ── TAB 1: FUEL EFFICIENCY ──────────────────────────────────────── -->
        <mat-tab>
          <ng-template mat-tab-label><mat-icon class="tab-icon">local_gas_station</mat-icon> Fuel Efficiency</ng-template>
          <div class="tab-content">
            @if (loadingFuel) { <div class="loading-center"><mat-spinner diameter="36"/></div> }
            @else {
              <!-- Summary cards -->
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-icon grad-indigo"><mat-icon>local_gas_station</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{fuelTotal.cost | number:'1.0-0'}}</div>
                    <div class="summary-label">Total Fuel Cost</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-cyan"><mat-icon>opacity</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">{{fuelTotal.liters | number:'1.0-0'}} L</div>
                    <div class="summary-label">Total Liters</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-emerald"><mat-icon>ev_station</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">{{fuelTotal.fillUps}}</div>
                    <div class="summary-label">Total Fill-Ups</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-amber"><mat-icon>calculate</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{fuelTotal.avgCostPerLiter | number:'1.2-2'}}</div>
                    <div class="summary-label">Avg ₹ / Liter</div>
                  </div>
                </div>
              </div>

              <div class="table-toolbar">
                <span class="table-count">{{fuelData.length}} vehicle(s)</span>
                <button mat-stroked-button (click)="exportCsv(fuelExport(), 'fuel-efficiency')">
                  <mat-icon>download</mat-icon> Export CSV
                </button>
              </div>
              <div class="table-container">
                <table mat-table [dataSource]="fuelSource">
                  <ng-container matColumnDef="vehicle">
                    <th mat-header-cell *matHeaderCellDef>Vehicle</th>
                    <td mat-cell *matCellDef="let r">
                      <strong>{{r.vehicle?.registrationNumber}}</strong>
                      <span class="cell-sub">{{r.vehicle?.name}}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="fillUps">
                    <th mat-header-cell *matHeaderCellDef>Fill-Ups</th>
                    <td mat-cell *matCellDef="let r">{{r.fillUps}}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalLiters">
                    <th mat-header-cell *matHeaderCellDef>Total Liters</th>
                    <td mat-cell *matCellDef="let r">{{r.totalLiters | number:'1.2-2'}} L</td>
                  </ng-container>
                  <ng-container matColumnDef="avgCostPerLiter">
                    <th mat-header-cell *matHeaderCellDef>Avg ₹/L</th>
                    <td mat-cell *matCellDef="let r">₹ {{r.avgCostPerLiter | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalFuelCost">
                    <th mat-header-cell *matHeaderCellDef>Total Cost (₹)</th>
                    <td mat-cell *matCellDef="let r"><strong class="amount">₹ {{r.totalFuelCost | number:'1.2-2'}}</strong></td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="fuelCols"></tr>
                  <tr mat-row *matRowDef="let r; columns:fuelCols;"></tr>
                  <tr class="mat-row" *matNoDataRow>
                    <td colspan="5"><div class="empty-state"><mat-icon>local_gas_station</mat-icon><p>No fuel logs recorded yet</p></div></td>
                  </tr>
                </table>
              </div>
            }
          </div>
        </mat-tab>

        <!-- ── TAB 2: OPERATIONAL COST ─────────────────────────────────────── -->
        <mat-tab>
          <ng-template mat-tab-label><mat-icon class="tab-icon">account_balance_wallet</mat-icon> Operational Cost</ng-template>
          <div class="tab-content">
            @if (loadingOps) { <div class="loading-center"><mat-spinner diameter="36"/></div> }
            @else {
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-icon grad-indigo"><mat-icon>local_gas_station</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{opsTotal.fuel | number:'1.0-0'}}</div>
                    <div class="summary-label">Total Fuel Cost</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-amber"><mat-icon>build</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{opsTotal.maintenance | number:'1.0-0'}}</div>
                    <div class="summary-label">Maintenance Cost</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-cyan"><mat-icon>receipt_long</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{opsTotal.expenses | number:'1.0-0'}}</div>
                    <div class="summary-label">Other Expenses</div>
                  </div>
                </div>
                <div class="summary-card highlight">
                  <div class="summary-icon grad-violet"><mat-icon>payments</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{opsTotal.total | number:'1.0-0'}}</div>
                    <div class="summary-label">Grand Total Cost</div>
                  </div>
                </div>
              </div>

              <div class="table-toolbar">
                <span class="table-count">{{opsData.length}} vehicle(s)</span>
                <button mat-stroked-button (click)="exportCsv(opsExport(), 'operational-cost')">
                  <mat-icon>download</mat-icon> Export CSV
                </button>
              </div>
              <div class="table-container">
                <table mat-table [dataSource]="opsSource">
                  <ng-container matColumnDef="vehicle">
                    <th mat-header-cell *matHeaderCellDef>Vehicle</th>
                    <td mat-cell *matCellDef="let r">
                      <strong>{{r.vehicle?.registrationNumber}}</strong>
                      <span class="cell-sub">{{r.vehicle?.name}}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="fuelCost">
                    <th mat-header-cell *matHeaderCellDef>Fuel (₹)</th>
                    <td mat-cell *matCellDef="let r">₹ {{r.fuelCost | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="maintenanceCost">
                    <th mat-header-cell *matHeaderCellDef>Maintenance (₹)</th>
                    <td mat-cell *matCellDef="let r">₹ {{r.maintenanceCost | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="expenseCost">
                    <th mat-header-cell *matHeaderCellDef>Expenses (₹)</th>
                    <td mat-cell *matCellDef="let r">₹ {{r.expenseCost | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalCost">
                    <th mat-header-cell *matHeaderCellDef>Total (₹)</th>
                    <td mat-cell *matCellDef="let r"><strong class="amount">₹ {{r.totalCost | number:'1.2-2'}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="costBreakdown">
                    <th mat-header-cell *matHeaderCellDef>Breakdown</th>
                    <td mat-cell *matCellDef="let r">
                      <div class="breakdown-bar" matTooltip="Fuel: {{r.fuelCost | number:'1.0-0'}} | Maint: {{r.maintenanceCost | number:'1.0-0'}} | Exp: {{r.expenseCost | number:'1.0-0'}}">
                        @if (r.totalCost > 0) {
                          <div class="bar-fuel"  [style.width.%]="r.totalCost > 0 ? (r.fuelCost/r.totalCost*100) : 0"></div>
                          <div class="bar-maint" [style.width.%]="r.totalCost > 0 ? (r.maintenanceCost/r.totalCost*100) : 0"></div>
                          <div class="bar-exp"   [style.width.%]="r.totalCost > 0 ? (r.expenseCost/r.totalCost*100) : 0"></div>
                        } @else {
                          <div class="bar-empty">—</div>
                        }
                      </div>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="opsCols"></tr>
                  <tr mat-row *matRowDef="let r; columns:opsCols;"></tr>
                  <tr class="mat-row" *matNoDataRow>
                    <td colspan="6"><div class="empty-state"><mat-icon>account_balance_wallet</mat-icon><p>No cost data yet</p></div></td>
                  </tr>
                </table>
              </div>
            }
          </div>
        </mat-tab>

        <!-- ── TAB 3: FLEET UTILIZATION ────────────────────────────────────── -->
        <mat-tab>
          <ng-template mat-tab-label><mat-icon class="tab-icon">bar_chart</mat-icon> Fleet Utilization</ng-template>
          <div class="tab-content">
            @if (loadingUtil) { <div class="loading-center"><mat-spinner diameter="36"/></div> }
            @else {
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-icon grad-indigo"><mat-icon>route</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">{{utilTotal.trips}}</div>
                    <div class="summary-label">Total Trips</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-emerald"><mat-icon>check_circle</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">{{utilTotal.completed}}</div>
                    <div class="summary-label">Completed Trips</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-cyan"><mat-icon>social_distance</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">{{utilTotal.distance | number:'1.0-0'}} km</div>
                    <div class="summary-label">Total Distance</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-violet"><mat-icon>percent</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">{{utilTotal.rate}}%</div>
                    <div class="summary-label">Avg Completion Rate</div>
                  </div>
                </div>
              </div>

              <div class="table-toolbar">
                <span class="table-count">{{utilData.length}} vehicle(s)</span>
                <button mat-stroked-button (click)="exportCsv(utilExport(), 'fleet-utilization')">
                  <mat-icon>download</mat-icon> Export CSV
                </button>
              </div>
              <div class="table-container">
                <table mat-table [dataSource]="utilSource">
                  <ng-container matColumnDef="vehicle">
                    <th mat-header-cell *matHeaderCellDef>Vehicle</th>
                    <td mat-cell *matCellDef="let r">
                      <strong>{{r.vehicle?.registrationNumber}}</strong>
                      <span class="cell-sub">{{r.vehicle?.name}}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let r"><span class="status-chip {{r.vehicle?.status}}">{{r.vehicle?.status}}</span></td>
                  </ng-container>
                  <ng-container matColumnDef="totalTrips">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let r">{{r.totalTrips}}</td>
                  </ng-container>
                  <ng-container matColumnDef="completedTrips">
                    <th mat-header-cell *matHeaderCellDef>Completed</th>
                    <td mat-cell *matCellDef="let r"><span class="badge-success">{{r.completedTrips}}</span></td>
                  </ng-container>
                  <ng-container matColumnDef="cancelledTrips">
                    <th mat-header-cell *matHeaderCellDef>Cancelled</th>
                    <td mat-cell *matCellDef="let r"><span class="badge-warn">{{r.cancelledTrips}}</span></td>
                  </ng-container>
                  <ng-container matColumnDef="totalDistance">
                    <th mat-header-cell *matHeaderCellDef>Distance (km)</th>
                    <td mat-cell *matCellDef="let r">{{r.totalDistance | number:'1.0-0'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="utilizationRate">
                    <th mat-header-cell *matHeaderCellDef>Completion Rate</th>
                    <td mat-cell *matCellDef="let r">
                      <div class="util-rate">
                        <mat-progress-bar mode="determinate" [value]="r.utilizationRate"
                          [color]="r.utilizationRate >= 70 ? 'primary' : 'warn'"/>
                        <span class="util-pct">{{r.utilizationRate}}%</span>
                      </div>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="utilCols"></tr>
                  <tr mat-row *matRowDef="let r; columns:utilCols;"></tr>
                  <tr class="mat-row" *matNoDataRow>
                    <td colspan="7"><div class="empty-state"><mat-icon>bar_chart</mat-icon><p>No trip data yet</p></div></td>
                  </tr>
                </table>
              </div>
            }
          </div>
        </mat-tab>

        <!-- ── TAB 4: VEHICLE ROI ──────────────────────────────────────────── -->
        <mat-tab>
          <ng-template mat-tab-label><mat-icon class="tab-icon">trending_up</mat-icon> Vehicle ROI</ng-template>
          <div class="tab-content">
            @if (loadingRoi) { <div class="loading-center"><mat-spinner diameter="36"/></div> }
            @else {
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-icon grad-indigo"><mat-icon>price_change</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{roiTotal.acquisition | number:'1.0-0'}}</div>
                    <div class="summary-label">Total Investment</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-amber"><mat-icon>payments</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{roiTotal.opCost | number:'1.0-0'}}</div>
                    <div class="summary-label">Total Op. Cost</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-emerald"><mat-icon>savings</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">₹ {{roiTotal.netInvestment | number:'1.0-0'}}</div>
                    <div class="summary-label">Net Investment</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon grad-violet"><mat-icon>percent</mat-icon></div>
                  <div class="summary-body">
                    <div class="summary-value">{{roiTotal.avgCostRatio}}%</div>
                    <div class="summary-label">Avg Cost Ratio</div>
                  </div>
                </div>
              </div>

              <div class="roi-legend">
                <span><span class="dot dot-low"></span> Low cost (&lt;30%)</span>
                <span><span class="dot dot-mid"></span> Moderate (30–70%)</span>
                <span><span class="dot dot-high"></span> High (&gt;70%)</span>
              </div>

              <div class="table-toolbar">
                <span class="table-count">{{roiData.length}} vehicle(s)</span>
                <button mat-stroked-button (click)="exportCsv(roiExport(), 'vehicle-roi')">
                  <mat-icon>download</mat-icon> Export CSV
                </button>
              </div>
              <div class="table-container">
                <table mat-table [dataSource]="roiSource">
                  <ng-container matColumnDef="vehicle">
                    <th mat-header-cell *matHeaderCellDef>Vehicle</th>
                    <td mat-cell *matCellDef="let r">
                      <strong>{{r.vehicle?.registrationNumber}}</strong>
                      <span class="cell-sub">{{r.vehicle?.name}}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="acquisitionCost">
                    <th mat-header-cell *matHeaderCellDef>Acquisition (₹)</th>
                    <td mat-cell *matCellDef="let r">₹ {{r.acquisitionCost | number:'1.0-0'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="fuelCost">
                    <th mat-header-cell *matHeaderCellDef>Fuel (₹)</th>
                    <td mat-cell *matCellDef="let r">₹ {{r.fuelCost | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="maintenanceCost">
                    <th mat-header-cell *matHeaderCellDef>Maintenance (₹)</th>
                    <td mat-cell *matCellDef="let r">₹ {{r.maintenanceCost | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="expenseCost">
                    <th mat-header-cell *matHeaderCellDef>Expenses (₹)</th>
                    <td mat-cell *matCellDef="let r">₹ {{r.expenseCost | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalOperationalCost">
                    <th mat-header-cell *matHeaderCellDef>Total Op. Cost</th>
                    <td mat-cell *matCellDef="let r"><strong class="amount">₹ {{r.totalOperationalCost | number:'1.2-2'}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="costRatio">
                    <th mat-header-cell *matHeaderCellDef>Cost Ratio</th>
                    <td mat-cell *matCellDef="let r">
                      <span class="roi-badge"
                        [class.roi-low]="r.costRatio < 30"
                        [class.roi-mid]="r.costRatio >= 30 && r.costRatio < 70"
                        [class.roi-high]="r.costRatio >= 70">
                        {{r.costRatio}}%
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="netInvestment">
                    <th mat-header-cell *matHeaderCellDef>Net Investment</th>
                    <td mat-cell *matCellDef="let r">
                      <span [class.text-success]="r.netInvestment >= 0" [class.text-warn]="r.netInvestment < 0">
                        ₹ {{r.netInvestment | number:'1.0-0'}}
                      </span>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="roiCols"></tr>
                  <tr mat-row *matRowDef="let r; columns:roiCols;"></tr>
                  <tr class="mat-row" *matNoDataRow>
                    <td colspan="8"><div class="empty-state"><mat-icon>trending_up</mat-icon><p>No vehicle data yet</p></div></td>
                  </tr>
                </table>
              </div>
            }
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-subtitle { margin: 2px 0 0; font-size: 13px; color: #64748B; }

    // ── Tabs ──────────────────────────────────────────────────────────────────
    .reports-tabs { margin-top: 4px; }
    .tab-content  { padding: 20px 0 0; }
    .tab-icon     { font-size: 18px; width: 18px; height: 18px; margin-right: 6px; vertical-align: middle; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }

    // ── Summary cards ─────────────────────────────────────────────────────────
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }

    .summary-card {
      background: #fff;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      border: 1px solid #F1F5F9;
      transition: box-shadow 0.2s ease;
      &:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.1); }
      &.highlight { border-color: rgba(99,102,241,0.25); background: linear-gradient(135deg, #F5F3FF, #EEF2FF); }
    }

    .summary-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #fff; font-size: 22px; width: 22px; height: 22px; }
    }
    .grad-indigo  { background: linear-gradient(135deg,#6366F1,#8B5CF6); }
    .grad-emerald { background: linear-gradient(135deg,#10B981,#059669); }
    .grad-amber   { background: linear-gradient(135deg,#F59E0B,#D97706); }
    .grad-cyan    { background: linear-gradient(135deg,#06B6D4,#0891B2); }
    .grad-violet  { background: linear-gradient(135deg,#8B5CF6,#7C3AED); }

    .summary-body { flex: 1; min-width: 0; }
    .summary-value { font-size: 20px; font-weight: 700; color: #0F172A; line-height: 1.2; }
    .summary-label { font-size: 11px; color: #64748B; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600; }

    // ── Table toolbar ─────────────────────────────────────────────────────────
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .table-count { font-size: 13px; color: #64748B; font-weight: 500; }

    // ── Cell helpers ──────────────────────────────────────────────────────────
    .cell-sub { display: block; font-size: 11px; color: #94A3B8; margin-top: 1px; }
    .amount   { color: #6366F1; }
    .text-success { color: #10B981; font-weight: 600; }
    .text-warn    { color: #EF4444; font-weight: 600; }

    // ── Breakdown bar ─────────────────────────────────────────────────────────
    .breakdown-bar {
      display: flex;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      background: #F1F5F9;
      width: 120px;
      gap: 1px;
    }
    .bar-fuel  { background: #6366F1; border-radius: 4px 0 0 4px; transition: width 0.4s ease; }
    .bar-maint { background: #F59E0B; transition: width 0.4s ease; }
    .bar-exp   { background: #06B6D4; border-radius: 0 4px 4px 0; transition: width 0.4s ease; }
    .bar-empty { color: #CBD5E1; font-size: 12px; display: flex; align-items: center; padding: 0 6px; }

    // ── Utilization rate ──────────────────────────────────────────────────────
    .util-rate {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
      mat-progress-bar { flex: 1; border-radius: 4px; }
    }
    .util-pct { font-size: 12px; font-weight: 600; color: #334155; min-width: 36px; }

    // ── ROI badge ─────────────────────────────────────────────────────────────
    .roi-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .roi-low  { background: #D1FAE5; color: #065F46; }
    .roi-mid  { background: #FEF3C7; color: #92400E; }
    .roi-high { background: #FEE2E2; color: #991B1B; }

    // ── ROI legend ────────────────────────────────────────────────────────────
    .roi-legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #64748B;
      margin-bottom: 12px;
      align-items: center;
    }
    .dot {
      display: inline-block;
      width: 8px; height: 8px;
      border-radius: 50%;
      margin-right: 4px;
    }
    .dot-low  { background: #10B981; }
    .dot-mid  { background: #F59E0B; }
    .dot-high { background: #EF4444; }

    // ── Badges ────────────────────────────────────────────────────────────────
    .badge-success { color: #10B981; font-weight: 600; }
    .badge-warn    { color: #EF4444; font-weight: 600; }

    @media (max-width: 900px) {
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  // Fuel Efficiency
  fuelCols = ['vehicle', 'fillUps', 'totalLiters', 'avgCostPerLiter', 'totalFuelCost'];
  fuelData: any[] = [];
  fuelSource = new MatTableDataSource<any>();
  loadingFuel = true;
  fuelTotal = { cost: 0, liters: 0, fillUps: 0, avgCostPerLiter: 0 };

  // Operational Cost
  opsCols = ['vehicle', 'fuelCost', 'maintenanceCost', 'expenseCost', 'totalCost', 'costBreakdown'];
  opsData: any[] = [];
  opsSource = new MatTableDataSource<any>();
  loadingOps = true;
  opsTotal = { fuel: 0, maintenance: 0, expenses: 0, total: 0 };

  // Fleet Utilization
  utilCols = ['vehicle', 'status', 'totalTrips', 'completedTrips', 'cancelledTrips', 'totalDistance', 'utilizationRate'];
  utilData: any[] = [];
  utilSource = new MatTableDataSource<any>();
  loadingUtil = true;
  utilTotal = { trips: 0, completed: 0, distance: 0, rate: 0 };

  // Vehicle ROI
  roiCols = ['vehicle', 'acquisitionCost', 'fuelCost', 'maintenanceCost', 'expenseCost', 'totalOperationalCost', 'costRatio', 'netInvestment'];
  roiData: any[] = [];
  roiSource = new MatTableDataSource<any>();
  loadingRoi = true;
  roiTotal = { acquisition: 0, opCost: 0, netInvestment: 0, avgCostRatio: 0 };

  ngOnInit() {
    this.api.get<any[]>('/reports/fuel-efficiency').subscribe({
      next: d => {
        this.fuelData = d;
        this.fuelSource.data = d;
        this.fuelTotal = {
          cost:           d.reduce((s, r) => s + +r.totalFuelCost, 0),
          liters:         d.reduce((s, r) => s + +r.totalLiters, 0),
          fillUps:        d.reduce((s, r) => s + +r.fillUps, 0),
          avgCostPerLiter: d.length ? d.reduce((s, r) => s + +r.avgCostPerLiter, 0) / d.length : 0,
        };
        this.loadingFuel = false; this.cdr.detectChanges();
      },
      error: () => { this.loadingFuel = false; this.cdr.detectChanges(); }
    });

    this.api.get<any[]>('/reports/operational-cost').subscribe({
      next: d => {
        this.opsData = d;
        this.opsSource.data = d;
        this.opsTotal = {
          fuel:        d.reduce((s, r) => s + r.fuelCost, 0),
          maintenance: d.reduce((s, r) => s + r.maintenanceCost, 0),
          expenses:    d.reduce((s, r) => s + r.expenseCost, 0),
          total:       d.reduce((s, r) => s + r.totalCost, 0),
        };
        this.loadingOps = false; this.cdr.detectChanges();
      },
      error: () => { this.loadingOps = false; this.cdr.detectChanges(); }
    });

    this.api.get<any[]>('/reports/fleet-utilization').subscribe({
      next: d => {
        this.utilData = d;
        this.utilSource.data = d;
        const totalTrips = d.reduce((s, r) => s + r.totalTrips, 0);
        this.utilTotal = {
          trips:     totalTrips,
          completed: d.reduce((s, r) => s + r.completedTrips, 0),
          distance:  d.reduce((s, r) => s + r.totalDistance, 0),
          rate:      d.length ? Math.round(d.reduce((s, r) => s + r.utilizationRate, 0) / d.length) : 0,
        };
        this.loadingUtil = false; this.cdr.detectChanges();
      },
      error: () => { this.loadingUtil = false; this.cdr.detectChanges(); }
    });

    this.api.get<any[]>('/reports/vehicle-roi').subscribe({
      next: d => {
        this.roiData = d;
        this.roiSource.data = d;
        this.roiTotal = {
          acquisition:    d.reduce((s, r) => s + r.acquisitionCost, 0),
          opCost:         d.reduce((s, r) => s + r.totalOperationalCost, 0),
          netInvestment:  d.reduce((s, r) => s + r.netInvestment, 0),
          avgCostRatio:   d.length ? Math.round(d.reduce((s, r) => s + r.costRatio, 0) / d.length) : 0,
        };
        this.loadingRoi = false; this.cdr.detectChanges();
      },
      error: () => { this.loadingRoi = false; this.cdr.detectChanges(); }
    });
  }

  fuelExport() {
    return this.fuelData.map(r => ({
      Vehicle: r.vehicle?.registrationNumber, Name: r.vehicle?.name,
      FillUps: r.fillUps, TotalLiters: r.totalLiters,
      AvgCostPerLiter: (+r.avgCostPerLiter).toFixed(2), TotalFuelCost: (+r.totalFuelCost).toFixed(2),
    }));
  }

  opsExport() {
    return this.opsData.map(r => ({
      Vehicle: r.vehicle?.registrationNumber, Name: r.vehicle?.name,
      FuelCost: r.fuelCost.toFixed(2), MaintenanceCost: r.maintenanceCost.toFixed(2),
      ExpenseCost: r.expenseCost.toFixed(2), TotalCost: r.totalCost.toFixed(2),
    }));
  }

  utilExport() {
    return this.utilData.map(r => ({
      Vehicle: r.vehicle?.registrationNumber, Name: r.vehicle?.name, Status: r.vehicle?.status,
      TotalTrips: r.totalTrips, Completed: r.completedTrips, Cancelled: r.cancelledTrips,
      TotalDistance_km: r.totalDistance, UtilizationRate_pct: r.utilizationRate,
    }));
  }

  roiExport() {
    return this.roiData.map(r => ({
      Vehicle: r.vehicle?.registrationNumber, Name: r.vehicle?.name,
      AcquisitionCost: r.acquisitionCost, FuelCost: r.fuelCost.toFixed(2),
      MaintenanceCost: r.maintenanceCost.toFixed(2), ExpenseCost: r.expenseCost.toFixed(2),
      TotalOpCost: r.totalOperationalCost.toFixed(2), CostRatio_pct: r.costRatio,
      NetInvestment: r.netInvestment.toFixed(2),
    }));
  }

  exportCsv(data: any[], name: string) {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `${name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }
}
