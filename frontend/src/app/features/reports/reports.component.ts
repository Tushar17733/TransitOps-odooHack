import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1>Reports</h1></div>
      <mat-tab-group>

        <mat-tab label="Fuel Efficiency">
          <div style="padding:16px">
            <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
              <button mat-stroked-button (click)="exportCsv(fuelData, 'fuel-efficiency')">
                <mat-icon>download</mat-icon> Export CSV
              </button>
            </div>
            @if (loadingFuel) { <div style="text-align:center;padding:40px"><mat-spinner diameter="36"/></div> }
            @else {
              <div class="table-container">
                <table mat-table [dataSource]="fuelSource">
                  <ng-container matColumnDef="vehicle"><th mat-header-cell *matHeaderCellDef>Vehicle</th><td mat-cell *matCellDef="let r">{{r.vehicle?.registrationNumber}} — {{r.vehicle?.name}}</td></ng-container>
                  <ng-container matColumnDef="totalLiters"><th mat-header-cell *matHeaderCellDef>Total Liters</th><td mat-cell *matCellDef="let r">{{r.totalLiters | number:'1.2-2'}}</td></ng-container>
                  <ng-container matColumnDef="totalFuelCost"><th mat-header-cell *matHeaderCellDef>Total Cost (₹)</th><td mat-cell *matCellDef="let r"><strong>{{r.totalFuelCost | number:'1.2-2'}}</strong></td></ng-container>
                  <ng-container matColumnDef="fillUps"><th mat-header-cell *matHeaderCellDef>Fill-Ups</th><td mat-cell *matCellDef="let r">{{r.fillUps}}</td></ng-container>
                  <tr mat-header-row *matHeaderRowDef="fuelCols"></tr>
                  <tr mat-row *matRowDef="let r; columns:fuelCols;"></tr>
                  <tr class="mat-row" *matNoDataRow><td colspan="4"><div class="empty-state"><mat-icon>local_gas_station</mat-icon><p>No fuel data yet</p></div></td></tr>
                </table>
              </div>
            }
          </div>
        </mat-tab>

        <mat-tab label="Operational Cost">
          <div style="padding:32px;text-align:center">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#9AA0AE;display:block;margin:0 auto 12px">construction</mat-icon>
            <h3 style="color:#5A6478">Coming Soon</h3>
            <p style="color:#9AA0AE">Operational cost aggregation (fuel + maintenance + expenses per vehicle) is under development.</p>
          </div>
        </mat-tab>

        <mat-tab label="Fleet Utilization">
          <div style="padding:32px;text-align:center">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#9AA0AE;display:block;margin:0 auto 12px">construction</mat-icon>
            <h3 style="color:#5A6478">Coming Soon</h3>
            <p style="color:#9AA0AE">Fleet utilization report (trips per vehicle, active days %) is under development.</p>
          </div>
        </mat-tab>

        <mat-tab label="Vehicle ROI">
          <div style="padding:32px;text-align:center">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#9AA0AE;display:block;margin:0 auto 12px">construction</mat-icon>
            <h3 style="color:#5A6478">Coming Soon</h3>
            <p style="color:#9AA0AE">Vehicle ROI (acquisition cost vs operational cost) is under development.</p>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  fuelCols = ['vehicle', 'totalLiters', 'totalFuelCost', 'fillUps'];
  fuelData: any[] = [];
  fuelSource = new MatTableDataSource<any>();
  loadingFuel = true;

  ngOnInit() {
    this.api.get<any[]>('/reports/fuel-efficiency').subscribe({
      next: d => { this.fuelData = d; this.fuelSource.data = d; this.loadingFuel = false; },
      error: () => this.loadingFuel = false
    });
  }

  exportCsv(data: any[], name: string) {
    if (!data.length) return;
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    const csv = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `${name}.csv`;
    a.click();
  }
}
