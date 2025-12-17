import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Alumno, Empresa } from '../../services/api.service';
import { DocumentGeneratorService } from '../../services/document-generator.service';

@Component({
  selector: 'app-generador-anexo-vi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generador-anexo-vi.component.html',
  styleUrl: './generador-anexo-vi.component.css'
})
export class GeneradorAnexoVIComponent implements OnInit {
  alumnos: Alumno[] = [];
  empresas: Empresa[] = [];
  ciclos: any[] = [];
  pfis: any[] = [];

  // Tutor fields requested for the document
  nombreTutor: string | null = null;
  correoTutor: string | null = null;
  // New scheduling fields
  calendario: string | null = null; // ISO date string from date input
  modalidad: 'General' | 'Intensivo' = 'General';
  numeroHoras: number | null = null;

  selectedAlumnoId: number | null = null;
  selectedEmpresaId: number | null = null;
  selectedCicloId: number | null = null;
  selectedPfiId: number | null = null;
  // New fields requested by the user: Sí / No
  // Default both to 'No' so the option appears selected by default
  requiereMedidas: 'Sí' | 'No' | null = 'No';
  requiereAutorizacion: 'Sí' | 'No' | null = 'No';

  cargando = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private docGen: DocumentGeneratorService
  ) {}

  ngOnInit(): void {
    this.loadAlumnos();
    this.loadEmpresas();
    this.loadCiclos();
  }

  volver(): void {
    this.router.navigate(['/administracion']);
  }

  loadAlumnos(): void {
    this.api.getAlumnos().subscribe({
      next: (a) => this.alumnos = a,
      error: (e) => console.error('Error cargando alumnos', e)
    });
  }

  loadEmpresas(): void {
    this.api.getEmpresas().subscribe({
      next: (e) => this.empresas = e,
      error: (err) => console.error('Error cargando empresas', err)
    });
  }

  loadCiclos(): void {
    this.api.getCiclosFormativos().subscribe({
      next: (c) => this.ciclos = c,
      error: (err) => console.error('Error cargando ciclos', err)
    });
  }

  onCicloChange(): void {
    this.selectedPfiId = null;
    if (!this.selectedCicloId) {
      this.pfis = [];
      return;
    }
    this.api.getPFIsPorCiclo(this.selectedCicloId).subscribe({
      next: (p) => {
        this.pfis = p || [];
      },
      error: (err) => {
        console.error('Error cargando PFIs por ciclo', err);
        this.pfis = [];
      }
    });
  }

  canGenerate(): boolean {
    // Require selection of alumno/empresa/ciclo/pfi and the two Sí/No fields.
    // New fields (calendario/modalidad/numeroHoras) are optional for generation.
    return !!(this.selectedAlumnoId && this.selectedEmpresaId && this.selectedCicloId && this.selectedPfiId && this.requiereMedidas !== null && this.requiereAutorizacion !== null);
  }

  generar(): void {
    if (!this.canGenerate()) {
      alert('Selecciona alumno, empresa, ciclo y PFI antes de generar.');
      return;
    }

    // Construir datos mínimos para la generación.
    const alumno = this.alumnos.find(a => a.id === this.selectedAlumnoId);
    const empresa = this.empresas.find(e => e.id === this.selectedEmpresaId);
    const pfi = this.pfis.find(p => p.id === this.selectedPfiId);

    const ciclo = this.ciclos.find(c => c.id === this.selectedCicloId) || null;
    const formData = {
      alumno,
      empresa,
      pfi,
      ciclo,
      fecha: new Date().toISOString(),
      // Keep Sí/No strings and boolean representation for compatibility
      requiere_medidas: this.requiereMedidas === 'Sí',
      requiere_autorizacion: this.requiereAutorizacion === 'Sí',
      requiereMedidas: this.requiereMedidas,
      requiereAutorizacion: this.requiereAutorizacion,
      nombre_tutor: this.nombreTutor,
      correo_tutor: this.correoTutor,
      calendario: this.calendario,
      modalidad: this.modalidad,
      numero_horas: this.numeroHoras
    };
    // Ensure scheduling fields are always present (empty when not provided)
    formData.calendario = this.calendario ?? '';
    formData.modalidad = this.modalidad ?? '';
    formData.numero_horas = (this.numeroHoras !== null && this.numeroHoras !== undefined) ? this.numeroHoras : 0;

    // Debugging: print formData so we can inspect what's being sent to the generator
    // (Useful when troubleshooting missing keys in the template)
    console.log('Anexo VI - formData:', formData);

    // Llamar al generador de Anexo VI
    this.cargando = true;
    this.docGen.generateAnexoVI(formData).then(() => {
      this.cargando = false;
      console.log('Anexo VI generado correctamente');
    }).catch(err => {
      this.cargando = false;
      console.error('Error generando Anexo VI:', err);
      alert('Error generando Anexo VI. Revisa la consola.');
    });
  }
}
