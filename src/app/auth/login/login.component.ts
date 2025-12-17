import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

declare global {
  interface Window { google: any; }
}

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  private clientId = '516221880647-jnaelj0glcuqs5uc8b5q819p84ik0rr7.apps.googleusercontent.com';
  loading = false;
  // Disable Google Identity initialization by default. Set to `true` to re-enable.
  useGoogle = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    // Google initialization is optional and disabled by default.
    if (!this.useGoogle) {
      return;
    }

    // Initialize Google Identity Services button
    try {
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.id) {
        console.warn('Google Identity Services not loaded. Make sure the script is present in index.html');
        return;
      }

      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => this.handleCredentialResponse(response)
      });

      // Render the button into the placeholder div
      const mount = document.getElementById('g_id_signin');
      if (mount) {
        google.accounts.id.renderButton(mount, { theme: 'outline', size: 'large', width: '300' });
      }
    } catch (e) {
      console.error('Error initializing Google Identity Services', e);
    }
  }

  ngOnDestroy(): void {
    // Optional cleanup: cancel any pending prompts
    try {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.cancel();
      }
    } catch (e) {}
  }

  private handleCredentialResponse(response: any) {
    const idToken = response?.credential;
    if (!idToken) {
      console.error('No id_token received from Google');
      return;
    }

    // Verify token and sign in via AuthService
    this.loading = true;
    this.authService.handleGoogleIdToken(idToken).subscribe({
      next: (user) => {
        console.log(new Date().toISOString(), 'Login exitoso:', user);
        this.loading = false;
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error(new Date().toISOString(), 'Error verificando Google ID token:', err);
        this.loading = false;
      }
    });
  }

  // Development helper: seed a dev user and navigate to the app.
  devLogin() {
    try {
      localStorage.setItem('BYPASS_AUTH', '1');
      const u = { id: '0', email: 'dev@local', name: 'Dev User', is_admin: true };
      localStorage.setItem('currentUser', JSON.stringify(u));
      localStorage.setItem('access_token', 'dev-token');
      this.router.navigate(['/inicio']);
    } catch (e) {
      console.error('Error setting dev login:', e);
    }
  }
}
