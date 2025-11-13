import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  // role can be a string like 'admin' or an array of roles
  role?: string | string[];
  is_admin?: boolean;
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
    // Enviar el id_token al backend para verificación y creación de sesión
    // El backend debe exponer POST /api/auth/google que reciba { id_token }
    // Respuesta esperada (ejemplo): { access_token, token_type, expires_in, user }
    const url = 'https://scraping-curriculos-1.onrender.com/api/auth/google';
    return this.http.post<any>(url, { id_token: idToken }).pipe(
      map(res => {
        // Si el backend devuelve un access_token, lo guardamos (localStorage)
        if (res?.access_token) {
          try {
            localStorage.setItem('access_token', res.access_token);
          } catch (e) {
            // ignore storage errors
          }
        }

        // Normalizar usuario
        const u = res?.user ?? null;
        if (u) {
          const user: User = {
            id: String(u.id ?? u.google_sub ?? ''),
            email: u.email ?? '',
            name: u.name ?? u.email ?? '',
            picture: u.picture ?? '',
            role: u.role ?? u.roles ?? u.rol,
            is_admin: (u.is_admin ?? (
              (typeof (u.role) === 'string' && u.role === 'admin') ||
              (Array.isArray(u.role) && (u.role as any[]).includes('admin'))
            )) as boolean
          };
          return user;
        }

        // Si el backend usa cookie HttpOnly y solo devuelve 200 sin token/user,
        // el frontend puede solicitar /api/me para obtener el usuario; aquí
        // devolvemos null para que el subscriber gestione el caso.
        throw new Error('Invalid response from auth backend');
      }),
      tap(user => this.saveUser(user)),
      catchError(err => {
        console.error('Error verificando id_token en backend:', err);
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
