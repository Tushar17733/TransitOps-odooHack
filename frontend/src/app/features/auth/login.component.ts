import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-page">
      <!-- Animated background orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <!-- Centered card -->
      <div class="login-card">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo-icon">
            <mat-icon>directions_bus</mat-icon>
          </div>
          <h1 class="logo-title">TransitOps</h1>
          <p class="logo-subtitle">Sign in to your fleet dashboard</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="field">
            <mat-label>Email address</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email" />
            <mat-icon matSuffix class="field-icon">mail_outline</mat-icon>
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="showPass ? 'text' : 'password'" autocomplete="current-password" />
            <button mat-icon-button matSuffix type="button" (click)="showPass=!showPass" class="vis-btn">
              <mat-icon>{{showPass ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>

          <button mat-flat-button color="primary" type="submit" [disabled]="loading" class="submit-btn">
            @if (loading) {
              <mat-spinner diameter="18" class="btn-spinner"/>
              <span>Signing in…</span>
            } @else {
              <mat-icon>lock_open</mat-icon>
              <span>Sign In</span>
            }
          </button>
        </form>

        <!-- Footer -->
        <div class="card-footer">
          <div class="footer-badges">
            <span class="badge"><mat-icon>directions_bus</mat-icon>Fleet</span>
            <span class="badge"><mat-icon>route</mat-icon>Trips</span>
            <span class="badge"><mat-icon>bar_chart</mat-icon>Reports</span>
          </div>
          <p class="footer-text">Smart Transport Operations Platform</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    // ── Page ──────────────────────────────────────────────────────────────────
    .login-page {
      min-height: 100vh;
      background: #070C14;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 24px;
    }

    // ── Orbs ──────────────────────────────────────────────────────────────────
    .orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(50px);
    }

    .orb-1 {
      width: 520px; height: 520px;
      background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%);
      top: -180px; left: -120px;
      animation: orbFloat1 14s ease-in-out infinite alternate;
    }

    .orb-2 {
      width: 420px; height: 420px;
      background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
      bottom: -120px; right: -80px;
      animation: orbFloat2 18s ease-in-out infinite alternate;
    }

    .orb-3 {
      width: 280px; height: 280px;
      background: radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%);
      top: 55%; left: 55%;
      animation: orbFloat3 11s ease-in-out infinite alternate;
    }

    // ── Card ──────────────────────────────────────────────────────────────────
    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 24px;
      padding: 36px 36px 28px;
      box-shadow:
        0 25px 80px rgba(0,0,0,0.45),
        0 8px 24px rgba(0,0,0,0.25),
        inset 0 1px 0 rgba(255,255,255,0.8);
      animation: scaleInUp 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    // ── Logo ──────────────────────────────────────────────────────────────────
    .logo-section { text-align: center; margin-bottom: 28px; }

    .logo-icon {
      width: 58px; height: 58px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
      box-shadow: 0 8px 24px rgba(99,102,241,0.45);

      mat-icon {
        color: #fff;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .logo-title {
      font-size: 26px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 6px;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      letter-spacing: -0.6px;
    }

    .logo-subtitle {
      margin: 0;
      color: #64748B;
      font-size: 14px;
    }

    // ── Fields ────────────────────────────────────────────────────────────────
    .field { width: 100%; margin-bottom: 4px; }

    .field-icon { color: #94A3B8 !important; font-size: 20px !important; }
    .vis-btn { color: #94A3B8 !important; }

    // ── Submit ────────────────────────────────────────────────────────────────
    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 15px;
      font-weight: 700;
      margin-top: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: 0.2px;
    }

    ::ng-deep .btn-spinner circle { stroke: #fff !important; }

    // ── Footer ────────────────────────────────────────────────────────────────
    .card-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #F1F5F9;
      text-align: center;
    }

    .footer-badges {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #F1F5F9;
      color: #64748B;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.4px;

      mat-icon {
        font-size: 13px;
        width: 13px;
        height: 13px;
        color: #6366F1;
      }
    }

    .footer-text {
      margin: 0;
      font-size: 12px;
      color: #94A3B8;
    }

    // ── Animations ────────────────────────────────────────────────────────────
    @keyframes orbFloat1 {
      0%   { transform: translate(0, 0) scale(1); }
      100% { transform: translate(60px, 80px) scale(1.12); }
    }
    @keyframes orbFloat2 {
      0%   { transform: translate(0, 0) scale(1); }
      100% { transform: translate(-70px, -50px) scale(1.18); }
    }
    @keyframes orbFloat3 {
      0%   { transform: translate(0, 0) scale(0.9); }
      100% { transform: translate(-40px, 50px) scale(1.05); }
    }
    @keyframes scaleInUp {
      from { opacity: 0; transform: scale(0.92) translateY(20px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

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
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }
}
