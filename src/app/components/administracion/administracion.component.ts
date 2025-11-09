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
      siglas: ciclo.codigo, // Asumiendo que codigo es las siglas
      clave: ciclo.descripcion, // O ajusta según tu modelo
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
    if (!confirm(`¿Estás seguro de eliminar el ciclo "${ciclo.nombre}"?`)) {
      return;
    }

    // TODO: Implementar eliminación cuando esté el endpoint
    alert('Funcionalidad de eliminación pendiente de implementar en el backend');
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
    console.log('nuevoCiclo.titulo_id original:', this.nuevoCiclo.titulo_id, typeof this.nuevoCiclo.titulo_id);
    console.log('titulo_id final:', cicloData.titulo_id, typeof cicloData.titulo_id);
    console.log('Títulos disponibles:', this.titulosDisponibles);
    console.log('=====================');

    if (this.cicloEditando) {
      // Modo edición - TODO: implementar cuando exista el endpoint PUT
      alert('Funcionalidad de edición pendiente de implementar en el backend');
      this.guardandoCiclo = false;
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
}
