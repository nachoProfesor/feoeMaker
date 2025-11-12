import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Cargar usuario desde localStorage si existe
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private saveUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  // TODO: Implementar login real con Google OAuth
  /**
   * Procesa un ID token recibido desde Google Identity Services.
   * Verifica el token con el endpoint de Google y devuelve el usuario.
   */
  handleGoogleIdToken(idToken: string) {
    // Verificar token con Google (tokeninfo)
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    return this.http.get<any>(url).pipe(
      map(info => {
        const user: User = {
          id: info.sub,
          email: info.email,
          name: info.name || info.email || '',
          picture: info.picture || ''
        };
        return user;
      }),
      tap(user => this.saveUser(user)),
      catchError(err => {
        console.error('Error verificando id_token en Google:', err);
        throw err;
      })
    );
  }

  // TODO: Implementar logout real
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // TODO: Implementar verificación de token con el backend
  verifyToken(): Observable<boolean> {
    // return this.http.get<boolean>('/api/auth/verify');
    return of(this.isAuthenticated);
  }
}
