import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
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

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  // TODO: Implementar login real con Google OAuth
  loginWithGoogle(): Observable<User> {
    console.log('Login con Google - Por implementar');
    
    // Simulación temporal para pruebas de UI
    const mockUser: User = {
      id: '123',
      email: 'usuario@ejemplo.com',
      name: 'Usuario Demo',
      picture: 'https://via.placeholder.com/150'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
    
    return of(mockUser);
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
