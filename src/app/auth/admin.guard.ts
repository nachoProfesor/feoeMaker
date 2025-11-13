import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUserValue;
  const isAdmin = !!(user?.is_admin || (typeof user?.role === 'string' && user.role === 'admin') || (Array.isArray(user?.role) && user.role.includes('admin')));

  if (isAdmin) return true;

  // Not authorized -> redirect to administracion or login
  router.navigate(['/administracion']);
  return false;
};
