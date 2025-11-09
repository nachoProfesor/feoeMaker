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
  pfiId: number | null = null; // Para modo edición
  esNuevo = true; // true = crear nuevo, false = editar existente
  ciclo: Ciclo | null = null;
  tituloId: number | null = null; // Necesario para guardar el PFI
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
      // Verificar si es modo creación o edición
      if (params['pfiId']) {
        this.pfiId = +params['pfiId'];
        this.esNuevo = false;
        // TODO: Cargar datos del PFI existente
        alert('Modo edición aún no implementado. Necesitas endpoint GET /api/practicas/pfi/{id}');
      } else if (params['cicloId']) {
        this.cicloId = +params['cicloId'];
        this.esNuevo = true;
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    this.cargando = true;
    
    // Cargar información del ciclo y sus módulos
    this.apiService.getCicloConModulos(this.cicloId).subscribe({
      next: (data: any) => {
        this.ciclo = data.ciclo;
        this.tituloId = data.titulo_id; // Guardar titulo_id para usarlo al guardar
        // Si no hay módulos, inicializar como array vacío
        this.modulos = (data.modulos || []).map((m: Modulo) => ({
          ...m,
          seleccionado: false,
          expandido: false,
          resultados_aprendizaje: (m.resultados_aprendizaje || []).map(ra => ({
            ...ra,
            ubicacion: 'centro',
            mostrarCEs: false,
            criterios_evaluacion: (ra.criterios_evaluacion || []).map(ce => ({
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
        alert('Error al cargar los datos del ciclo. El endpoint puede no estar implementado todavía en el backend.');
        // Volver a la página anterior
        this.volver();
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
    if (!this.tituloId) {
      alert('No se puede guardar: falta el título asociado al ciclo');
      return;
    }

    this.guardando = true;

    // Construir los módulos en el formato esperado por el backend
    const modulos: any[] = [];
    
    this.modulos
      .filter(m => m.seleccionado)
      .forEach(m => {
        m.resultados_aprendizaje.forEach((ra, raIndex) => {
          // Si el RA es de tipo 'centro' o 'empresa', crear un registro completo
          if (ra.ubicacion === 'centro' || ra.ubicacion === 'empresa') {
            modulos.push({
              codigo: `${m.codigo}-RA${raIndex + 1}`,
              nombre: m.nombre,
              empresa_o_centro: ra.ubicacion === 'centro' ? 'C' : 'E'
            });
          }
          // Si es 'parcial', crear registros individuales por CE
          else if (ra.ubicacion === 'parcial') {
            ra.criterios_evaluacion.forEach((ce, ceIndex) => {
              modulos.push({
                codigo: `${m.codigo}-RA${raIndex + 1}-CE${ceIndex + 1}`,
                nombre: `${m.nombre} - RA${raIndex + 1} - CE${ceIndex + 1}`,
                empresa_o_centro: ce.ubicacion === 'centro' ? 'C' : 'E'
              });
            });
          }
        });
      });

    const pfiData = {
      titulo_id: this.tituloId,
      ciclo_id: this.cicloId,
      codigo_ra: `${this.ciclo?.codigo || 'PFI'}-${new Date().getFullYear()}`,
      tutor_centro_id: null, // Puedes agregar un selector de tutor si lo necesitas
      modulos: modulos
    };

    console.log('Guardando PFI:', pfiData);

    this.apiService.guardarPFI(pfiData).subscribe({
      next: (response: any) => {
        console.log('PFI guardado:', response);
        this.guardando = false;
        alert(`PFI guardado correctamente (ID: ${response.pfi_id})`);
        this.volver();
      },
      error: (error: any) => {
        console.error('Error guardando PFI:', error);
        this.guardando = false;
        alert('Error al guardar el PFI: ' + (error.error?.error || error.message));
      }
    });
  }

  volver() {
    if (this.cicloId) {
      this.router.navigate(['/administracion/pfi', this.cicloId]);
    } else {
      this.router.navigate(['/administracion']);
    }
  }
}
