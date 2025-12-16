import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // DEV bypass: if localStorage has BYPASS_AUTH=1, seed a debug admin user and allow access
  try {
    const bypass = localStorage.getItem('BYPASS_AUTH');
    if (bypass === '1') {
      // put a minimal admin user so UI shows admin sections
      const u: any = {
        id: '0',
        email: 'dev@local',
        name: 'Dev User',
        role: 'admin',
        is_admin: true
      };
      // Use public saveUser to set current user
      try { authService.saveUser(u); } catch (e) { /* ignore */ }
      return true;
    }
  } catch (e) {
    // ignore localStorage errors
  }

  if (authService.isAuthenticated) {
    return true;
  }

  // Redirigir a login si no está autenticado
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
