import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiService, Alumno } from '../../services/api.service';

@Component({
  selector: 'app-alumnos',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './alumnos.component.html',
  styleUrl: './alumnos.component.css'
})
export class AlumnosComponent implements OnInit {
  alumnos: Alumno[] = [];
  alumnosFiltrados: Alumno[] = [];
  loading = true;
  mostrarModal = false;
  guardando = false;
  alumnoEditando: Alumno | null = null;
  alumnoForm: FormGroup;
  filtroTexto: string = '';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.alumnoForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      dni_numero: [''],
      correo: [''],
      telefono: [''],
      domicilio: [''],
      localidad: ['']
    });
  }

  ngOnInit() {
    this.cargarAlumnos();
  }

  cargarAlumnos() {
    this.loading = true;
    this.apiService.getAlumnos().subscribe({
      next: (alumnos) => {
        this.alumnos = alumnos;
        this.filtrarAlumnos();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando alumnos:', error);
        this.loading = false;
      }
    });
  }

  filtrarAlumnos() {
    if (!this.filtroTexto || this.filtroTexto.trim() === '') {
      this.alumnosFiltrados = [...this.alumnos];
      return;
    }

    const textoNormalizado = this.normalizarTexto(this.filtroTexto);
    this.alumnosFiltrados = this.alumnos.filter(a => {
      return (
        this.normalizarTexto(a.nombre || '').includes(textoNormalizado) ||
        this.normalizarTexto(a.apellidos || '').includes(textoNormalizado) ||
        this.normalizarTexto(a.dni_numero || '').includes(textoNormalizado) ||
        this.normalizarTexto(a.correo || '').includes(textoNormalizado) ||
        this.normalizarTexto(a.localidad || '').includes(textoNormalizado)
      );
    });
  }

  normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      // Remove diacritical marks (accents) and other combining marks
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  limpiarFiltro() {
    this.filtroTexto = '';
    this.filtrarAlumnos();
  }

  abrirModal() {
    this.mostrarModal = true;
    this.alumnoEditando = null;
    this.alumnoForm.reset();
  }

  editarAlumno(alumno: Alumno) {
    this.alumnoEditando = alumno;
    this.mostrarModal = true;
    this.alumnoForm.patchValue({
      nombre: alumno.nombre || '',
      apellidos: alumno.apellidos || '',
      dni_numero: alumno.dni_numero || '',
      correo: alumno.correo || '',
      telefono: alumno.telefono || '',
      domicilio: alumno.domicilio || '',
      localidad: alumno.localidad || ''
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.alumnoEditando = null;
    this.alumnoForm.reset();
  }

  eliminarAlumno(alumno: Alumno) {
    if (!alumno.id) return;
    if (confirm(`¿Eliminar alumno: ${alumno.nombre} ${alumno.apellidos}?`)) {
      this.apiService.eliminarAlumno(alumno.id).subscribe({
        next: () => {
          alert('Alumno eliminado correctamente');
          this.cargarAlumnos();
        },
        error: (error) => {
          console.error('Error eliminando alumno:', error);
          alert('Error al eliminar el alumno');
        }
      });
    }
  }

  guardarAlumno() {
    if (this.alumnoForm.valid) {
      this.guardando = true;
      const formData = this.alumnoForm.value;
      const alumno: any = {};
      if (formData.nombre) alumno.nombre = formData.nombre;
      if (formData.apellidos) alumno.apellidos = formData.apellidos;
      if (formData.dni_numero) alumno.dni_numero = formData.dni_numero;
      if (formData.correo) alumno.correo = formData.correo;
      if (formData.telefono) alumno.telefono = formData.telefono;
      if (formData.domicilio) alumno.domicilio = formData.domicilio;
      if (formData.localidad) alumno.localidad = formData.localidad;

      const request = this.alumnoEditando
        ? this.apiService.actualizarAlumno(this.alumnoEditando.id!, alumno)
        : this.apiService.crearAlumno(alumno);

      request.subscribe({
        next: (response) => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarAlumnos();
          alert(this.alumnoEditando ? 'Alumno actualizado' : 'Alumno creado');
        },
        error: (error) => {
          console.error('Error guardando alumno:', error);
          this.guardando = false;
          const mensaje = error.error?.error || error.message || 'Error desconocido';
          alert('Error al guardar el alumno: ' + mensaje);
        }
      });
    }
  }
}
