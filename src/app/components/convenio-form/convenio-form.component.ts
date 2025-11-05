import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentGeneratorService } from '../../services/document-generator.service';

@Component({
  selector: 'app-convenio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './convenio-form.component.html',
  styleUrls: ['./convenio-form.component.css']
})
export class ConvenioFormComponent {
  empresaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private documentGeneratorService: DocumentGeneratorService
  ) {
    this.empresaForm = this.fb.group({
      representante: this.fb.group({
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        dni: ['', Validators.required],
        cargo: ['Administrador', Validators.required]
      }),
      empresa: this.fb.group({
        nombre: ['', Validators.required],
        cif: ['', Validators.required],
        provincia: ['', Validators.required],
        localidad: ['', Validators.required],
        codigoPostal: ['', Validators.required],
        calle: ['', Validators.required],
        telefono: ['', Validators.required],
        email: ['', Validators.required]
      })
    });
  }

  async onSubmit() {
    if (this.empresaForm.valid) {
      try {
        await this.documentGeneratorService.generateConvenio(this.empresaForm.value);
      } catch (e) {
        console.error('Error:', e);
      }
    }
  }
}