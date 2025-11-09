import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface CicloFormativo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_grado: string;
}

@Component({
  selector: 'app-administracion',
  imports: [CommonModule],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.css'
})
export class AdministracionComponent implements OnInit {
  mostrarModalCiclo = false;
  cargandoCiclos = false;
  ciclosFormativos: CicloFormativo[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarCiclos();
  }

  cargarCiclos() {
    this.cargandoCiclos = true;
    this.apiService.getCiclosFormativos().subscribe({
      next: (ciclos: any) => {
        this.ciclosFormativos = ciclos;
        this.cargandoCiclos = false;
      },
      error: (error: any) => {
        console.error('Error cargando ciclos:', error);
        this.cargandoCiclos = false;
      }
    });
  }

  abrirGestionPFI() {
    this.mostrarModalCiclo = true;
  }

  cerrarModalCiclo() {
    this.mostrarModalCiclo = false;
  }

  seleccionarCiclo(ciclo: CicloFormativo) {
    console.log('Ciclo seleccionado:', ciclo);
    // Aquí navegaremos a la página de definición del PFI
    this.router.navigate(['/administracion/pfi', ciclo.id]);
  }

  gestionarCiclos() {
    // Por ahora solo mostramos el modal
    this.mostrarModalCiclo = true;
  }
}
