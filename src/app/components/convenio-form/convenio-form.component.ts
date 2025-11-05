import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentGeneratorService } from '../../services/document-generator.service';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './convenio-form.component.html',
  styleUrls: ['./convenio-form.component.css']
})
export class ConvenioFormComponent {
  empresaForm: FormGroup;

  constructor(private fb: FormBuilder,
    private documentGenerator: DocumentGeneratorService) {
    this.empresaForm = this.fb.group({
      representante: this.fb.group({
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        dni: ['', Validators.required]
      }),
      empresa: this.fb.group({
        nombre: ['', Validators.required],
        provincia: ['', Validators.required],
        localidad: ['', Validators.required],
        calle: ['', Validators.required],
        codigoPostal: ['', Validators.required],
        cif: ['', Validators.required],
        telefono: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      }),
      // tutor: this.fb.group({
      //   nombre: ['', Validators.required],
      //   apellidos: ['', Validators.required],
      //   dni: ['', Validators.required]
      // })
    });
  }

  async onSubmit() {
    if (this.empresaForm.valid) {
      try {
        await this.documentGenerator.generateConvenio(this.empresaForm.value);
      } catch (error) {
        console.error('Error generating document:', error);
      }
    } else {
      Object.keys(this.empresaForm.controls).forEach(key => {
        const control = this.empresaForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}