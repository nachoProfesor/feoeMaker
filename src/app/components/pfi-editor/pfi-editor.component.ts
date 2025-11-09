import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface CE {
  descripcion: string;
  ubicacion?: 'centro' | 'empresa';
}

interface RA {
  descripcion: string;
  criterios_evaluacion: CE[];
  ubicacion?: 'centro' | 'empresa' | 'parcial';
  mostrarCEs?: boolean;
}

interface Modulo {
  nombre: string;
  codigo: string;
  horas: string;
  num_ras: number;
  num_ces: number;
  resultados_aprendizaje: RA[];
  seleccionado?: boolean;
  expandido?: boolean;
}

interface Ciclo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-pfi-editor',
  imports: [CommonModule, FormsModule],
  templateUrl: './pfi-editor.component.html',
  styleUrl: './pfi-editor.component.css'
})
export class PfiEditorComponent implements OnInit {
  cicloId: number = 0;
  ciclo: Ciclo | null = null;
  modulos: Modulo[] = [];
  cargando = true;
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.cicloId = +params['cicloId'];
      this.cargarDatos();
    });
  }

  cargarDatos() {
    this.cargando = true;
    
    // Cargar información del ciclo y sus módulos
    this.apiService.getCicloConModulos(this.cicloId).subscribe({
      next: (data: any) => {
        this.ciclo = data.ciclo;
        this.modulos = data.modulos.map((m: Modulo) => ({
          ...m,
          seleccionado: false,
          expandido: false,
          resultados_aprendizaje: m.resultados_aprendizaje.map(ra => ({
            ...ra,
            ubicacion: 'centro',
            mostrarCEs: false,
            criterios_evaluacion: ra.criterios_evaluacion.map(ce => ({
              ...ce,
              ubicacion: 'centro'
            }))
          }))
        }));
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error cargando datos:', error);
        this.cargando = false;
        alert('Error al cargar los datos del ciclo');
      }
    });
  }

  get modulosSeleccionados(): number {
    return this.modulos.filter(m => m.seleccionado).length;
  }

  toggleModulo(modulo: Modulo) {
    modulo.seleccionado = !modulo.seleccionado;
    if (!modulo.seleccionado) {
      modulo.expandido = false;
    }
  }

  toggleExpandir(modulo: Modulo) {
    if (modulo.seleccionado) {
      modulo.expandido = !modulo.expandido;
    }
  }

  toggleCEs(ra: RA) {
    ra.mostrarCEs = !ra.mostrarCEs;
  }

  actualizarDistribucion() {
    // Método para actualizar estadísticas si es necesario
    console.log('Distribución actualizada');
  }

  guardarPFI() {
    this.guardando = true;

    const pfiData = {
      ciclo_id: this.cicloId,
      modulos: this.modulos
        .filter(m => m.seleccionado)
        .map(m => ({
          codigo: m.codigo,
          nombre: m.nombre,
          resultados_aprendizaje: m.resultados_aprendizaje.map((ra, raIndex) => ({
            indice: raIndex + 1,
            descripcion: ra.descripcion,
            ubicacion: ra.ubicacion,
            criterios_evaluacion: ra.ubicacion === 'parcial' 
              ? ra.criterios_evaluacion.map((ce, ceIndex) => ({
                  indice: ceIndex + 1,
                  descripcion: ce.descripcion,
                  ubicacion: ce.ubicacion
                }))
              : []
          }))
        }))
    };

    console.log('Guardando PFI:', pfiData);

    // Aquí llamarías al servicio para guardar
    this.apiService.guardarPFI(pfiData).subscribe({
      next: (response: any) => {
        console.log('PFI guardado:', response);
        this.guardando = false;
        alert('PFI guardado correctamente');
        this.volver();
      },
      error: (error: any) => {
        console.error('Error guardando PFI:', error);
        this.guardando = false;
        alert('Error al guardar el PFI');
      }
    });
  }

  volver() {
    this.router.navigate(['/administracion']);
  }
}
