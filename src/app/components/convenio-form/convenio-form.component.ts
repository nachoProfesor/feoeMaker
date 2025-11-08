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
        tituloId: ['', Validators.required],
        moduloId: ['', Validators.required]
      })
    });
  }

  ngOnInit() {
    this.loadTitulos();
    
    this.empresaForm.get('formacion.tituloId')?.valueChanges.subscribe(tituloId => {
      if (tituloId) {
        this.loadModulos(tituloId);
      }
    });
  }

  loadTitulos() {
    this.loadingTitulos = true;
    this.apiService.getTitulos().subscribe({
      next: (titulos) => {
        this.titulos = titulos;
        this.loadingTitulos = false;
      },
      error: (err) => {
        console.error('Error cargando títulos:', err);
        this.loadingTitulos = false;
      }
    });
  }

  loadModulos(tituloId: string) {
    this.loadingModulos = true;
    this.modulos = [];
    this.empresaForm.get('formacion.moduloId')?.reset();
    
    this.apiService.getModulosByTitulo(tituloId).subscribe({
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