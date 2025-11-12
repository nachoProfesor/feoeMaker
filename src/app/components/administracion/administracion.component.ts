import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface CicloFormativo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_grado: string;
  titulo_id?: number;
  siglas?: string;
  clave?: string;
}

interface NuevoCiclo {
  nombre: string;
  siglas: string;
  clave: string;
  tipo_grado: string;
  titulo_id: number | string | null;
}

interface Titulo {
  id?: number;
  titulo_id?: number;
  nombre: string;
  tipo_grado?: string;
  [key: string]: any; // Para soportar otros campos que pueda devolver el backend
}

@Component({
  selector: 'app-administracion',
  imports: [CommonModule, FormsModule],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.css'
})
export class AdministracionComponent implements OnInit {
  mostrarModalCiclo = false;
  mostrarModalCrearCiclo = false;
  mostrarModalGestionarCiclos = false;
  cargandoCiclos = false;
  guardandoCiclo = false;
  cargandoTitulos = false;
  ciclosFormativos: CicloFormativo[] = [];
  titulosDisponibles: Titulo[] = [];
  cicloEditando: CicloFormativo | null = null;
  
  tiposGrado = [
    { valor: 'basico', nombre: 'Grado Básico' },
    { valor: 'medio', nombre: 'Grado Medio' },
    { valor: 'superior', nombre: 'Grado Superior' }
  ];
  
  nuevoCiclo: NuevoCiclo = {
    nombre: '',
    siglas: '',
    clave: '',
    tipo_grado: '',
    titulo_id: null
  };

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

  onTipoGradoChange(tipoGrado: string) {
    this.nuevoCiclo.tipo_grado = tipoGrado;
    this.nuevoCiclo.titulo_id = null;
    this.titulosDisponibles = [];
    
    if (tipoGrado) {
      this.cargandoTitulos = true;
      this.apiService.getTitulos().subscribe({
        next: (titulos: any) => {
          console.log('Todos los títulos recibidos del backend:', titulos);
          // Filtrar por tipo_grado en el frontend
          this.titulosDisponibles = titulos.filter((t: any) => t.tipo_grado === tipoGrado);
          console.log(`Títulos filtrados para ${tipoGrado}:`, this.titulosDisponibles);
          console.log('Primer título filtrado:', this.titulosDisponibles[0]);
          this.cargandoTitulos = false;
        },
        error: (error: any) => {
          console.error('Error cargando títulos:', error);
          this.cargandoTitulos = false;
        }
      });
    }
  }

  abrirGestionPFI() {
    if (this.ciclosFormativos.length === 0) {
      alert('Primero debes crear ciclos formativos');
      this.abrirModalCrearCiclo();
      return;
    }
    this.mostrarModalCiclo = true;
  }

  cerrarModalCiclo() {
    this.mostrarModalCiclo = false;
  }

  seleccionarCiclo(ciclo: CicloFormativo) {
    console.log('Ciclo seleccionado:', ciclo);
    this.router.navigate(['/administracion/pfi', ciclo.id]);
  }

  abrirModalCrearCiclo() {
    this.mostrarModalCrearCiclo = true;
    this.cerrarModalCiclo();
    this.cerrarModalGestionarCiclos();
    this.cicloEditando = null;
    this.titulosDisponibles = [];
    this.nuevoCiclo = {
      nombre: '',
      siglas: '',
      clave: '',
      tipo_grado: '',
      titulo_id: null
    };
  }

  cerrarModalCrearCiclo() {
    this.mostrarModalCrearCiclo = false;
    this.cicloEditando = null;
    this.titulosDisponibles = [];
    this.nuevoCiclo = {
      nombre: '',
      siglas: '',
      clave: '',
      tipo_grado: '',
      titulo_id: null
    };
  }

  abrirModalGestionarCiclos() {
    this.mostrarModalGestionarCiclos = true;
    this.cargarCiclos();
  }

  cerrarModalGestionarCiclos() {
    this.mostrarModalGestionarCiclos = false;
  }

  editarCiclo(ciclo: CicloFormativo) {
    this.cicloEditando = ciclo;
    this.nuevoCiclo = {
      nombre: ciclo.nombre,
      siglas: ciclo.siglas || ciclo.codigo || '',
      clave: ciclo.clave || '',
      tipo_grado: ciclo.tipo_grado || '',
      titulo_id: ciclo.titulo_id || null
    };
    // Cargar títulos para el tipo de grado del ciclo
    if (ciclo.tipo_grado) {
      this.onTipoGradoChange(ciclo.tipo_grado);
    }
    this.cerrarModalGestionarCiclos();
    this.mostrarModalCrearCiclo = true;
  }

  eliminarCiclo(ciclo: CicloFormativo) {
    if (!confirm(`¿Estás seguro de eliminar el ciclo "${ciclo.nombre}"?\n\nEsta acción eliminará también todos los PFIs asociados y no se puede deshacer.`)) {
      return;
    }

    this.apiService.eliminarCiclo(ciclo.id).subscribe({
      next: (response: any) => {
        console.log('Ciclo eliminado:', response);
        alert('Ciclo formativo eliminado correctamente');
        this.cargarCiclos(); // Recargar la lista
      },
      error: (error: any) => {
        console.error('Error al eliminar ciclo:', error);
        let errorMsg = 'Error al eliminar el ciclo';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg += ': ' + error.error;
          } else {
            errorMsg += ': ' + (error.error.error || error.error.message || JSON.stringify(error.error));
          }
        }
        alert(errorMsg);
      }
    });
  }

  crearCiclo() {
    if (!this.nuevoCiclo.nombre || !this.nuevoCiclo.siglas || !this.nuevoCiclo.clave) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!this.nuevoCiclo.titulo_id) {
      alert('Por favor selecciona un título para el ciclo');
      return;
    }

    this.guardandoCiclo = true;

    // Convertir titulo_id a número
    const tituloIdNumber = typeof this.nuevoCiclo.titulo_id === 'number' 
      ? this.nuevoCiclo.titulo_id 
      : parseInt(String(this.nuevoCiclo.titulo_id), 10);
    
    console.log('=== DEBUG TITULO_ID ===');
    console.log('nuevoCiclo.titulo_id:', this.nuevoCiclo.titulo_id, typeof this.nuevoCiclo.titulo_id);
    console.log('tituloIdNumber:', tituloIdNumber, typeof tituloIdNumber);
    console.log('isNaN:', isNaN(tituloIdNumber));
    console.log('es mayor que 0:', tituloIdNumber > 0);
    
    const cicloData = {
      nombre: this.nuevoCiclo.nombre,
      siglas: this.nuevoCiclo.siglas,
      clave: this.nuevoCiclo.clave,
      titulo_id: tituloIdNumber
    };

    console.log('=== DATOS A ENVIAR ===');
    console.log('Datos del ciclo a enviar:', cicloData);
    console.log('nuevoCiclo.titulo_id:', this.nuevoCiclo.titulo_id, typeof this.nuevoCiclo.titulo_id);
    console.log('tituloIdNumber:', tituloIdNumber, typeof tituloIdNumber);
    console.log('isNaN:', isNaN(tituloIdNumber));
    console.log('es mayor que 0:', tituloIdNumber > 0);
    
    // Verificar que el titulo_id existe en la lista de títulos disponibles
    const tituloSeleccionado = this.titulosDisponibles.find((t: any) => t.id === tituloIdNumber);
    console.log('Título seleccionado:', tituloSeleccionado);
    console.log('Títulos disponibles:', this.titulosDisponibles);
    console.log('=====================');
    
    if (!tituloSeleccionado) {
      alert(`Error: El título con ID ${tituloIdNumber} no se encontró en la lista de títulos disponibles. Esto puede indicar un problema con los datos del backend.`);
      this.guardandoCiclo = false;
      return;
    }

    if (this.cicloEditando) {
      // Modo edición
      console.log('=== MODO EDICIÓN ===');
      console.log('Actualizando ciclo ID:', this.cicloEditando.id);
      
      this.apiService.actualizarCiclo(this.cicloEditando.id, cicloData).subscribe({
        next: (response: any) => {
          console.log('Ciclo actualizado:', response);
          this.guardandoCiclo = false;
          alert('Ciclo formativo actualizado correctamente');
          this.cerrarModalCrearCiclo();
          this.cargarCiclos();
        },
        error: (error: any) => {
          console.error('=== ERROR AL ACTUALIZAR ===');
          console.error('Error completo:', error);
          this.guardandoCiclo = false;
          
          let errorMsg = 'Error al actualizar el ciclo';
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMsg += ': ' + error.error;
            } else {
              errorMsg += ': ' + (error.error.error || error.error.message || JSON.stringify(error.error));
            }
          }
          alert(errorMsg);
        }
      });
      return;
    }

    // Modo creación
    this.apiService.crearCiclo(cicloData).subscribe({
      next: (response: any) => {
        console.log('Ciclo creado:', response);
        this.guardandoCiclo = false;
        alert('Ciclo formativo creado correctamente');
        this.cerrarModalCrearCiclo();
        this.cargarCiclos();
      },
      error: (error: any) => {
        console.error('=== ERROR COMPLETO ===');
        console.error('Error objeto completo:', error);
        console.error('error.error:', error.error);
        console.error('error.status:', error.status);
        console.error('error.statusText:', error.statusText);
        console.error('error.message:', error.message);
        console.error('=====================');
        
        this.guardandoCiclo = false;
        
        let errorMsg = 'Error desconocido';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else {
            errorMsg = error.error.error || error.error.message || JSON.stringify(error.error);
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        alert('Error al crear el ciclo:\n' + errorMsg);
      }
    });
  }

  gestionarCiclos() {
    this.abrirModalGestionarCiclos();
  }

  // ============================================
  // MÉTODOS DE PRUEBA PARA PFI
  // ============================================

  probarGetAllPFIs() {
    console.log('=== PROBANDO GET ALL PFIs ===');
    this.apiService.getAllPFIs().subscribe({
      next: (pfis) => {
        console.log('✅ Todos los PFIs:', pfis);
        console.log(`Total de PFIs: ${pfis.length}`);
        alert(`✅ Se encontraron ${pfis.length} PFIs. Revisa la consola para ver los detalles.`);
      },
      error: (error) => {
        console.error('❌ Error al obtener PFIs:', error);
        alert('❌ Error al obtener PFIs. Revisa la consola para más detalles.');
      }
    });
  }

  probarGetPFIById(pfiId: number) {
    console.log(`=== PROBANDO GET PFI BY ID: ${pfiId} ===`);
    this.apiService.getPFIById(pfiId).subscribe({
      next: (resultado) => {
        console.log('✅ PFI obtenido:', resultado);
        console.log('📋 PFI:', resultado.pfi);
        console.log('📝 Detalles:', resultado.detalles);
        console.log(`   Total de detalles: ${resultado.detalles?.length || 0}`);
        console.log('🎓 Ciclo:', resultado.ciclo);
        console.log('📜 Título:', resultado.titulo);
        
        let mensaje = `✅ PFI ${pfiId} obtenido correctamente\n\n`;
        mensaje += `📋 Información del PFI:\n`;
        mensaje += `  - ID: ${resultado.pfi?.id}\n`;
        mensaje += `  - Código RA: ${resultado.pfi?.codigo_ra}\n`;
        mensaje += `  - Ciclo ID: ${resultado.pfi?.ciclo_id}\n`;
        mensaje += `  - Título ID: ${resultado.pfi?.titulo_id}\n\n`;
        mensaje += `📝 Detalles asociados: ${resultado.detalles?.length || 0}\n\n`;
        
        if (resultado.detalles && resultado.detalles.length > 0) {
          mensaje += `Primeros 3 detalles:\n`;
          resultado.detalles.slice(0, 3).forEach((detalle: any, index: number) => {
            const ubicacion = detalle.empresa_o_centro === 'C' ? 'Centro' : 
                            detalle.empresa_o_centro === 'E' ? 'Empresa' : 
                            detalle.empresa_o_centro === 'P' ? 'Parcial' : detalle.empresa_o_centro;
            mensaje += `  ${index + 1}. ${detalle.codigo} - ${detalle.nombre_modulo} (${ubicacion})`;
            if (detalle.empresa_o_centro === 'P' && detalle.criterio_evaluacion_empresa) {
              mensaje += `\n     CEs en empresa: ${detalle.criterio_evaluacion_empresa}`;
            }
            mensaje += `\n`;
          });
          if (resultado.detalles.length > 3) {
            mensaje += `  ... y ${resultado.detalles.length - 3} más\n`;
          }
          
          // Estadísticas de distribución
          const totales = {
            centro: resultado.detalles.filter((d: any) => d.empresa_o_centro === 'C').length,
            empresa: resultado.detalles.filter((d: any) => d.empresa_o_centro === 'E').length,
            parcial: resultado.detalles.filter((d: any) => d.empresa_o_centro === 'P').length
          };
          mensaje += `\n📊 Distribución:\n`;
          mensaje += `  - Centro: ${totales.centro}\n`;
          mensaje += `  - Empresa: ${totales.empresa}\n`;
          mensaje += `  - Parcial: ${totales.parcial}\n`;
        }
        
        mensaje += `\n🔍 Revisa la consola para ver toda la información detallada.`;
        
        alert(mensaje);
      },
      error: (error) => {
        console.error(`❌ Error al obtener PFI ${pfiId}:`, error);
        alert(`❌ Error al obtener PFI ${pfiId}. Revisa la consola para más detalles.`);
      }
    });
  }

  // Método auxiliar para probar con el primer PFI disponible
  probarPrimerPFI() {
    console.log('=== OBTENIENDO PRIMER PFI DISPONIBLE ===');
    this.apiService.getAllPFIs().subscribe({
      next: (pfis) => {
        if (pfis.length === 0) {
          console.warn('⚠️ No hay PFIs disponibles para probar');
          alert('⚠️ No hay PFIs disponibles. Crea uno primero.');
          return;
        }
        const primerPFI = pfis[0];
        console.log('Primer PFI encontrado:', primerPFI);
        console.log(`ID del primer PFI: ${primerPFI.id}`);
        this.probarGetPFIById(primerPFI.id);
      },
      error: (error) => {
        console.error('❌ Error al obtener lista de PFIs:', error);
        alert('❌ Error al obtener lista de PFIs. Revisa la consola.');
      }
    });
  }

  // Navegar al generador de Anexo VI
  irGeneradorAnexoVI() {
    this.router.navigate(['/generador-anexo-vi']);
  }
}
