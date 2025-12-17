import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Feoe Manager';
  currentUser: User | null = null;
  // Expose a helper so template can show sidebar when BYPASS_AUTH is set
  get showSidebar(): boolean {
    try {
      const bypass = typeof window !== 'undefined' ? localStorage.getItem('BYPASS_AUTH') : null;
      return !!this.currentUser || bypass === '1';
    } catch (e) {
      return !!this.currentUser;
    }
  }

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    // If developer bypass flag is set and there's no current user, seed a dev admin user
    try {
      const bypass = localStorage.getItem('BYPASS_AUTH');
      if (bypass === '1' && !this.currentUser) {
        const devUser: any = { id: '0', email: 'dev@local', name: 'Dev User', role: 'admin', is_admin: true };
        try { this.authService.saveUser(devUser); } catch (e) { /* ignore */ }
        this.currentUser = devUser;
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}