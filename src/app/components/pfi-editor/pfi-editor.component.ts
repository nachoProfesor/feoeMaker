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
  nombrePFI: string = ''; // Nombre personalizado del PFI
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
        this.cargarPFIExistente();
      } else if (params['cicloId']) {
        this.cicloId = +params['cicloId'];
        this.esNuevo = true;
        this.cargarDatos();
      }
    });
  }

  cargarPFIExistente() {
    if (!this.pfiId) return;
    
    this.cargando = true;
    console.log('=== CARGANDO PFI EXISTENTE ===');
    console.log('PFI ID:', this.pfiId);

    this.apiService.getPFIById(this.pfiId).subscribe({
      next: (response: any) => {
        console.log('Respuesta GET PFI:', response);
        
        const pfi = response.pfi;
        const detalles = response.detalles;
        
        this.cicloId = pfi.ciclo_id;
        this.tituloId = pfi.titulo_id;
        this.nombrePFI = pfi.codigo_ra || ''; // Cargar el nombre del PFI
        
        // Cargar la estructura de módulos del ciclo
        this.apiService.getCicloConModulos(this.cicloId).subscribe({
          next: (data: any) => {
            this.ciclo = data.ciclo;
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
            
            // Aplicar los datos guardados del PFI
            detalles.forEach((detalle: any) => {
              const [codigoModulo, raNumStr] = detalle.codigo.split('-RA');
              const raNum = parseInt(raNumStr);
              
              const modulo = this.modulos.find(m => m.codigo === codigoModulo);
              if (modulo) {
                modulo.seleccionado = true;
                modulo.expandido = true;
                
                const ra = modulo.resultados_aprendizaje[raNum - 1];
                if (ra) {
                  if (detalle.empresa_o_centro === 'C') {
                    ra.ubicacion = 'centro';
                  } else if (detalle.empresa_o_centro === 'E') {
                    ra.ubicacion = 'empresa';
                  } else if (detalle.empresa_o_centro === 'P') {
                    ra.ubicacion = 'parcial';
                    ra.mostrarCEs = true;
                    
                    // Parsear criterio_evaluacion_empresa: "a,b,f"
                    if (detalle.criterio_evaluacion_empresa) {
                      const letrasEmpresa = detalle.criterio_evaluacion_empresa.split(',').map((l: string) => l.trim());
                      const letras = 'abcdefghijklmnopqrstuvwxyz';
                      
                      ra.criterios_evaluacion.forEach((ce, ceIndex) => {
                        const letra = letras[ceIndex];
                        if (letrasEmpresa.includes(letra)) {
                          ce.ubicacion = 'empresa';
                        } else {
                          ce.ubicacion = 'centro';
                        }
                      });
                    }
                  }
                }
              }
            });
            
            console.log('PFI cargado y aplicado a módulos');
            this.cargando = false;
          },
          error: (error: any) => {
            console.error('Error al cargar estructura del ciclo:', error);
            alert('Error al cargar la estructura del ciclo');
            this.cargando = false;
            this.volver();
          }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar PFI:', error);
        alert('Error al cargar el PFI. Verifica que el endpoint GET /api/practicas/pfi/' + this.pfiId + ' esté implementado.');
        this.cargando = false;
        this.volver();
      }
    });
  }

  cargarDatos() {
    this.cargando = true;
    
    console.log('=== CARGANDO DATOS PFI ===');
    console.log('Ciclo ID:', this.cicloId);
    
    // Cargar información del ciclo y sus módulos
    this.apiService.getCicloConModulos(this.cicloId).subscribe({
      next: (data: any) => {
        console.log('Datos recibidos del backend:', data);
        console.log('Ciclo:', data.ciclo);
        console.log('Título ID:', data.titulo_id);
        console.log('Módulos:', data.modulos);
        console.log('Número de módulos:', data.modulos ? data.modulos.length : 0);
        
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
        
        console.log('Módulos procesados:', this.modulos);
        console.log('========================');
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('=== ERROR AL CARGAR DATOS ===');
        console.error('Error completo:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('============================');
        this.cargando = false;
        
        let errorMsg = 'Error al cargar los datos del ciclo.';
        if (error.status === 404) {
          errorMsg += ' El endpoint /practicas/ciclos/' + this.cicloId + '/modulos no existe en el backend.';
        } else if (error.status === 0) {
          errorMsg += ' No se pudo conectar con el servidor.';
        }
        
        alert(errorMsg);
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

    if (!this.nombrePFI || this.nombrePFI.trim() === '') {
      alert('Por favor, ingresa un nombre para el PFI');
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
              empresa_o_centro: ra.ubicacion === 'centro' ? 'C' : 'E',
              criterio_evaluacion_empresa: null // No aplica cuando es completo
            });
          }
          // Si es 'parcial', crear UN SOLO registro con los CEs de empresa separados por comas
          else if (ra.ubicacion === 'parcial') {
            // Recopilar las letras de los CEs que van a la empresa (a, b, c, etc.)
            const letras = 'abcdefghijklmnopqrstuvwxyz';
            const cesEmpresa = ra.criterios_evaluacion
              .map((ce, ceIndex) => ce.ubicacion === 'empresa' ? letras[ceIndex] : null)
              .filter(ce => ce !== null);
            
            // Crear un único registro para el RA parcial
            modulos.push({
              codigo: `${m.codigo}-RA${raIndex + 1}`,
              nombre: m.nombre,
              empresa_o_centro: 'P', // 'P' para Parcial
              criterio_evaluacion_empresa: cesEmpresa.length > 0 ? cesEmpresa.join(',') : null
            });
          }
        });
      });

    const pfiData = {
      titulo_id: this.tituloId,
      ciclo_id: this.cicloId,
      codigo_ra: this.nombrePFI.trim(),
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
