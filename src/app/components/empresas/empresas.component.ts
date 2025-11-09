import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiService, Empresa } from '../../services/api.service';

@Component({
  selector: 'app-empresas',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css'
})
export class EmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  empresasFiltradas: Empresa[] = [];
  loading = true;
  mostrarModal = false;
  guardando = false;
  empresaEditando: Empresa | null = null;
  empresaForm: FormGroup;
  filtroTexto: string = '';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.empresaForm = this.fb.group({
      nombre_empr: ['', Validators.required],
      cif_empr: [''],
      localidad_empr: [''],
      provincia_empr: [''],
      calle_empr: [''],
      cod_postal_empr: [''],
      telefono_empr: [''],
      correo_empr: [''],
      nombre_repr: [''],
      apellidos_repr: [''],
      dni_repr: [''],
      numero_convenio: [''],
      fecha_firma_conv: ['']
    });
  }

  ngOnInit() {
    this.cargarEmpresas();
  }

  cargarEmpresas() {
    this.loading = true;
    this.apiService.getEmpresas().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
        this.filtrarEmpresas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando empresas:', error);
        this.loading = false;
      }
    });
  }

  filtrarEmpresas() {
    if (!this.filtroTexto || this.filtroTexto.trim() === '') {
      this.empresasFiltradas = [...this.empresas];
      return;
    }

    const textoNormalizado = this.normalizarTexto(this.filtroTexto);
    
    this.empresasFiltradas = this.empresas.filter(empresa => {
      return (
        this.normalizarTexto(empresa.nombre_empr || '').includes(textoNormalizado) ||
        this.normalizarTexto(empresa.cif_empr || '').includes(textoNormalizado) ||
        this.normalizarTexto(empresa.localidad_empr || '').includes(textoNormalizado) ||
        this.normalizarTexto(empresa.provincia_empr || '').includes(textoNormalizado) ||
        this.normalizarTexto(empresa.nombre_repr || '').includes(textoNormalizado) ||
        this.normalizarTexto(empresa.apellidos_repr || '').includes(textoNormalizado) ||
        this.normalizarTexto(`${empresa.nombre_repr} ${empresa.apellidos_repr}`).includes(textoNormalizado)
      );
    });
  }

  normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  limpiarFiltro() {
    this.filtroTexto = '';
    this.filtrarEmpresas();
  }

  abrirModal() {
    this.mostrarModal = true;
    this.empresaEditando = null;
    this.empresaForm.reset();
  }

  editarEmpresa(empresa: Empresa) {
    this.empresaEditando = empresa;
    this.mostrarModal = true;
    
    // Rellenar el formulario con los datos de la empresa
    this.empresaForm.patchValue({
      nombre_empr: empresa.nombre_empr,
      cif_empr: empresa.cif_empr || '',
      localidad_empr: empresa.localidad_empr || '',
      provincia_empr: empresa.provincia_empr || '',
      calle_empr: empresa.calle_empr || '',
      cod_postal_empr: empresa.cod_postal_empr || '',
      telefono_empr: empresa.telefono_empr || '',
      correo_empr: empresa.correo_empr || '',
      nombre_repr: empresa.nombre_repr || '',
      apellidos_repr: empresa.apellidos_repr || '',
      dni_repr: empresa.dni_repr || '',
      numero_convenio: empresa.numero_convenio || '',
      fecha_firma_conv: empresa.fecha_firma_conv || ''
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.empresaEditando = null;
    this.empresaForm.reset();
  }

  eliminarEmpresa(empresa: Empresa) {
    if (confirm(`¿Estás seguro de que quieres eliminar la empresa "${empresa.nombre_empr}"?`)) {
      this.apiService.eliminarEmpresa(empresa.id!).subscribe({
        next: () => {
          alert('Empresa eliminada correctamente');
          this.cargarEmpresas();
        },
        error: (error) => {
          console.error('Error eliminando empresa:', error);
          alert('Error al eliminar la empresa');
        }
      });
    }
  }

  guardarEmpresa() {
    if (this.empresaForm.valid) {
      this.guardando = true;
      const formData = this.empresaForm.value;
      
      // Construir objeto limpio con tipos correctos
      const empresa: any = {};
      
      // Solo agregar campos que tienen valor
      if (formData.nombre_empr) empresa.nombre_empr = formData.nombre_empr;
      if (formData.cif_empr) empresa.cif_empr = formData.cif_empr;
      if (formData.localidad_empr) empresa.localidad_empr = formData.localidad_empr;
      if (formData.provincia_empr) empresa.provincia_empr = formData.provincia_empr;
      if (formData.calle_empr) empresa.calle_empr = formData.calle_empr;
      if (formData.cod_postal_empr) empresa.cod_postal_empr = formData.cod_postal_empr;
      if (formData.telefono_empr) empresa.telefono_empr = formData.telefono_empr;
      if (formData.correo_empr) empresa.correo_empr = formData.correo_empr;
      if (formData.nombre_repr) empresa.nombre_repr = formData.nombre_repr;
      if (formData.apellidos_repr) empresa.apellidos_repr = formData.apellidos_repr;
      if (formData.dni_repr) empresa.dni_repr = formData.dni_repr;
      
      // Convertir numero_convenio a número si existe
      if (formData.numero_convenio) {
        empresa.numero_convenio = parseInt(formData.numero_convenio, 10);
      }
      
      // Convertir fecha a formato YYYY-MM-DD si existe
      if (formData.fecha_firma_conv) {
        // El input type="date" ya devuelve en formato YYYY-MM-DD
        empresa.fecha_firma_conv = formData.fecha_firma_conv;
      }
      
      console.log('Enviando empresa:', empresa);
      console.log('Tipo de fecha:', typeof empresa.fecha_firma_conv);
      console.log('Tipo de numero_convenio:', typeof empresa.numero_convenio);
      
      // Si estamos editando, actualizar. Si no, crear nueva
      const request = this.empresaEditando
        ? this.apiService.actualizarEmpresa(this.empresaEditando.id!, empresa)
        : this.apiService.crearEmpresa(empresa);

      request.subscribe({
        next: (response) => {
          console.log('Empresa guardada:', response);
          this.guardando = false;
          this.cerrarModal();
          this.cargarEmpresas();
          alert(this.empresaEditando ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente');
        },
        error: (error) => {
          console.error('Error guardando empresa:', error);
          console.error('Detalle del error:', error.error);
          this.guardando = false;
          const mensaje = error.error?.error || error.message || 'Error desconocido';
          alert('Error al guardar la empresa: ' + mensaje);
        }
      });
    }
  }
}
