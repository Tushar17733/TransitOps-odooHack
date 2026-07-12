import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, LoginResponse, User, Role } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(null);
  private _user = signal<User | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly role = computed(() => this._user()?.role ?? null);

  login(email: string, password: string) {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}/auth/login`, { email, password }
    ).pipe(
      map(r => r.data),
      tap(data => {
        this._token.set(data.token);
        this._user.set(data.user);
      })
    );
  }

  register(payload: { name: string; email: string; password: string; role?: Role }) {
    return this.http.post<ApiResponse<User>>(
      `${environment.apiUrl}/auth/register`, payload
    ).pipe(map(r => r.data));
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  hasRole(...roles: Role[]): boolean {
    const r = this.role();
    return r !== null && roles.includes(r);
  }

  getToken(): string | null {
    return this._token();
  }
}
