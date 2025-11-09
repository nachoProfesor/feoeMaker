import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentGeneratorService } from '../../services/document-generator.service';
import { ApiService, Titulo, Modulo } from '../../services/api.service';

@Component({
  selector: 'app-convenio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './convenio-form.component.html',
  styleUrls: ['./convenio-form.component.css']
})
export class ConvenioFormComponent implements OnInit {
  empresaForm: FormGroup;
  titulos: Titulo[] = [];
  modulos: Modulo[] = [];
  loadingTitulos = false;
  loadingModulos = false;
  tipoGrado: string = 'superior'; // Por defecto superior

  constructor(
    private fb: FormBuilder,
    private documentGeneratorService: DocumentGeneratorService,
    private apiService: ApiService
  ) {
    this.empresaForm = this.fb.group({
      representante: this.fb.group({
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        dni: ['', Validators.required],
        cargo: ['administrador', Validators.required]
      }),
      empresa: this.fb.group({
        nombre: ['', Validators.required],
        cif: ['', Validators.required],
        provincia: ['', Validators.required],
        localidad: ['', Validators.required],
        codigoPostal: ['', Validators.required],
        calle: ['', Validators.required],
        telefono: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      }),
      formacion: this.fb.group({
        tipoGrado: ['superior', Validators.required],
        titulo: ['', Validators.required],
        modulo: ['', Validators.required]
      })
    });
  }

  ngOnInit() {
    this.loadTitulos();
    
    // Cargar títulos cuando cambia el tipo de grado
    this.empresaForm.get('formacion.tipoGrado')?.valueChanges.subscribe(tipoGrado => {
      if (tipoGrado) {
        this.tipoGrado = tipoGrado;
        this.loadTitulos();
        this.modulos = [];
        this.empresaForm.get('formacion.titulo')?.reset();
        this.empresaForm.get('formacion.modulo')?.reset();
      }
    });

    // Cargar módulos cuando cambia el título
    this.empresaForm.get('formacion.titulo')?.valueChanges.subscribe(titulo => {
      if (titulo) {
        this.loadModulos(titulo);
      }
    });
  }

  loadTitulos() {
    this.loadingTitulos = true;
    this.titulos = [];
    console.log('Cargando títulos para tipo:', this.tipoGrado);
    this.apiService.getTitulos().subscribe({
      next: (titulos) => {
        console.log('Todos los títulos recibidos:', titulos);
        // Filtrar por tipo_grado en el frontend
        this.titulos = titulos.filter((t: any) => t.tipo_grado === this.tipoGrado);
        console.log('Títulos filtrados:', this.titulos);
        this.loadingTitulos = false;
      },
      error: (err) => {
        console.error('Error cargando títulos:', err);
        this.loadingTitulos = false;
      }
    });
  }

  loadModulos(titulo: string) {
    this.loadingModulos = true;
    this.modulos = [];
    this.empresaForm.get('formacion.modulo')?.reset();
    
    this.apiService.extraerModulos(this.tipoGrado, titulo).subscribe({
      next: (modulos) => {
        this.modulos = modulos;
        this.loadingModulos = false;
      },
      error: (err) => {
        console.error('Error cargando módulos:', err);
        this.loadingModulos = false;
      }
    });
  }

  async onSubmit() {
    if (this.empresaForm.valid) {
      try {
        await this.documentGeneratorService.generateConvenio(this.empresaForm.value);
      } catch (e) {
        console.error('Error:', e);
      }
    } else {
      Object.keys(this.empresaForm.controls).forEach(key => {
        const control = this.empresaForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}