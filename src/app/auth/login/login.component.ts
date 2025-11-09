import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  loginWithGoogle() {
    this.authService.loginWithGoogle().subscribe({
      next: (user) => {
        console.log('Login exitoso:', user);
        // Redirigir al formulario
        this.router.navigate(['/formulario']);
      },
      error: (error) => {
        console.error('Error en login:', error);
      }
    });
  }
}
