import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generador-anexo-vi',
  standalone: false,
  imports: [CommonModule],
  templateUrl: './generador-anexo-vi.component.html',
  styleUrl: './generador-anexo-vi.component.css'
})
export class GeneradorAnexoVIComponent {
  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/administracion']);
  }

  generar() {
    // Placeholder: implementar la lógica real de generación
    alert('Generando Anexo VI (placeholder)');
  }
}
