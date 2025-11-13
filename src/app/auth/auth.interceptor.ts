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
        const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next.handle(cloned);
      }
    } catch (e) {
      // localStorage might throw in some environments; ignore and proceed
    }

    return next.handle(req);
  }
}
