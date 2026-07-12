import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DriverService } from '../../core/services/driver.service';
import { AuthService } from '../../core/auth/auth.service';
import { Driver } from '../../core/models';
import { DriverDialogComponent } from './driver-dialog.component';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
    MatInputModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Drivers</h1>
        @if (auth.hasRole('fleet_manager', 'safety_officer')) {
          <button mat-flat-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon> Add Driver
          </button>
        }
      </div>

      <div class="filters">
        <mat-form-field appearance="outline" style="width:200px">
          <mat-label>Filter by Status</mat-label>
          <mat-select [(value)]="filterStatus" (selectionChange)="load()">
            <mat-option value="">All</mat-option>
            @for (s of statuses; track s){ <mat-option [value]="s">{{s | titlecase}}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" style="width:200px">
          <mat-label>Search</mat-label>
          <input matInput (input)="search($event)" placeholder="Name, license…">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="table-container">
        @if (loading) {
          <div style="display:flex;justify-content:center;padding:48px"><mat-spinner diameter="40"/></div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let d"><strong>{{d.name}}</strong></td>
            </ng-container>
            <ng-container matColumnDef="licenseNumber">
              <th mat-header-cell *matHeaderCellDef>License No.</th>
              <td mat-cell *matCellDef="let d">{{d.licenseNumber}}</td>
            </ng-container>
            <ng-container matColumnDef="licenseCategory">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let d">{{d.licenseCategory || '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="licenseExpiryDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>License Expiry</th>
              <td mat-cell *matCellDef="let d">
                <span [class.text-warn]="isExpired(d.licenseExpiryDate)" [class.text-success]="!isExpired(d.licenseExpiryDate)">
                  {{d.licenseExpiryDate}}
                  @if (isExpired(d.licenseExpiryDate)) { ⚠️ Expired }
                  @else if (isExpiringSoon(d.licenseExpiryDate)) { ⚠️ Expiring soon }
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="safetyScore">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Safety Score</th>
              <td mat-cell *matCellDef="let d">
                <span [class.text-warn]="d.safetyScore < 70" [class.text-success]="d.safetyScore >= 70">
                  {{d.safetyScore}}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="contactNumber">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let d">{{d.contactNumber || '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let d"><span class="status-chip {{d.status}}">{{d.status}}</span></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let d">
                @if (auth.hasRole('fleet_manager', 'safety_officer')) {
                  <button mat-icon-button matTooltip="Edit" (click)="openDialog(d)"><mat-icon>edit</mat-icon></button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td colspan="8"><div class="empty-state"><mat-icon>person</mat-icon><p>No drivers found</p></div></td>
            </tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10,25,50]" showFirstLastButtons/>
        }
      </div>
    </div>
  `
})
export class DriversComponent implements OnInit {
  private svc = inject(DriverService);
  auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  cols = ['name', 'licenseNumber', 'licenseCategory', 'licenseExpiryDate', 'safetyScore', 'contactNumber', 'status', 'actions'];
  statuses = ['available', 'on_trip', 'off_duty', 'suspended'];
  filterStatus = '';
  loading = true;

  dataSource = new MatTableDataSource<Driver>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() { this.load(); }
  ngAfterViewInit() { this.dataSource.sort = this.sort; this.dataSource.paginator = this.paginator; }

  load() {
    this.loading = true;
    const f: Record<string, string> = {};
    if (this.filterStatus) f['status'] = this.filterStatus;
    this.svc.list(f).subscribe({ next: d => { this.dataSource.data = d; this.loading = false; this.cdr.detectChanges(); }, error: () => { this.loading = false; this.cdr.detectChanges(); } });
  }

  search(e: Event) { this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase(); }

  isExpired(date: string) { return new Date(date) < new Date(); }
  isExpiringSoon(date: string) {
    const d = new Date(date); const now = new Date();
    const days = (d.getTime() - now.getTime()) / 86400000;
    return days >= 0 && days <= 30;
  }

  openDialog(driver?: Driver) {
    this.dialog.open(DriverDialogComponent, { width: '640px', data: { driver } })
      .afterClosed().subscribe(result => {
        if (!result) return;
        const op = driver ? this.svc.update(driver.id, result) : this.svc.create(result);
        op.subscribe({ next: () => { this.snack.open('Driver saved!', '', { duration: 3000 }); this.load(); } });
      });
  }
}
