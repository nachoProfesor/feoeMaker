import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const token = localStorage.getItem('access_token');
      // If there's already an Authorization header, don't override
      if (token && !req.headers.has('Authorization')) {
        // Mask token for debug output
        try {
          const masked = token.length > 10 ? token.slice(0, 6) + '…' + token.slice(-4) : token;
          // Debug only in development; safe to remove later
          // eslint-disable-next-line no-console
          console.debug(`[AuthInterceptor] Adding Authorization header to ${req.url} (token=${masked})`);
        } catch (e) {}
        const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next.handle(cloned);
      }
      // If there is no token, log that fact for debugging (avoid logging token contents)
      if (!token) {
        try {
          // eslint-disable-next-line no-console
          console.debug(`[AuthInterceptor] No access_token in localStorage for request to ${req.url}`);
        } catch (e) {}
      }
    } catch (e) {
      // localStorage might throw in some environments; ignore and proceed
    }

    return next.handle(req);
  }
}
