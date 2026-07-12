import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <div class="login-brand">
          <mat-icon>directions_bus</mat-icon>
          <h1>TransitOps</h1>
          <p>Smart Transport Operations Platform</p>
        </div>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" autocomplete="email">
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="showPass ? 'text' : 'password'" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="showPass=!showPass">
                <mat-icon>{{showPass ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" [disabled]="loading" class="submit-btn">
              @if (loading) { <mat-spinner diameter="20"/> }
              @else { Login }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1A2233 0%, #1565C0 100%); padding: 16px; }
    .login-card { width: 100%; max-width: 420px; padding: 32px; border-radius: 12px; }
    .login-brand { text-align: center; margin-bottom: 32px;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #1565C0; }
      h1 { margin: 8px 0 4px; font-size: 28px; font-weight: 700; color: #1A2233; }
      p { margin: 0; color: #5A6478; font-size: 13px; }
    }
    mat-form-field { width: 100%; margin-bottom: 4px; }
    .submit-btn { width: 100%; height: 44px; margin-top: 8px; font-size: 15px; font-weight: 600; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  showPass = false;

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => { this.loading = false; },
    });
  }
}
