import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface PFI {
  id: number;
  titulo_id: number;
  ciclo_id: number;
  codigo_ra: string;
  tutor_centro_id?: number;
  created_at: string;
  updated_at: string;
}

interface Ciclo {
  id: number;
  nombre: string;
  siglas: string;
  clave: string;
}

@Component({
  selector: 'app-pfi-list',
  imports: [CommonModule],
  templateUrl: './pfi-list.component.html',
  styleUrl: './pfi-list.component.css'
})
export class PfiListComponent implements OnInit {
  cicloId: number = 0;
  ciclo: Ciclo | null = null;
  pfis: PFI[] = [];
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cicloId = +params['cicloId'];
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.cargando = true;

    // Cargar información del ciclo
    this.apiService.getCiclosFormativos().subscribe({
      next: (ciclos) => {
        this.ciclo = ciclos.find(c => c.id === this.cicloId) || null;
      },
      error: (error) => {
        console.error('Error al cargar ciclo:', error);
      }
    });

    // Cargar PFIs del ciclo
    this.apiService.getPFIsPorCiclo(this.cicloId).subscribe({
      next: (pfis) => {
        this.pfis = pfis;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar PFIs:', error);
        this.cargando = false;
      }
    });
  }

  crearNuevoPFI(): void {
    this.router.navigate(['/administracion/pfi/nuevo', this.cicloId]);
  }

  editarPFI(pfiId: number): void {
    this.router.navigate(['/administracion/pfi/editar', pfiId]);
  }

  eliminarPFI(pfi: PFI): void {
    if (confirm(`¿Estás seguro de eliminar el PFI "${pfi.codigo_ra}"?`)) {
      // TODO: Implementar eliminación cuando esté el endpoint
      alert('Funcionalidad de eliminación pendiente de implementar');
    }
  }

  volver(): void {
    this.router.navigate(['/administracion']);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
