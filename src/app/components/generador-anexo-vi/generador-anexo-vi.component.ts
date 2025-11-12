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

  selectedAlumnoId: number | null = null;
  selectedEmpresaId: number | null = null;
  selectedCicloId: number | null = null;
  selectedPfiId: number | null = null;

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
    return !!(this.selectedAlumnoId && this.selectedEmpresaId && this.selectedCicloId && this.selectedPfiId);
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

    const formData = {
      alumno,
      empresa,
      pfi,
      fecha: new Date().toISOString()
    };

    // Placeholder: por ahora solo mostramos en consola y llamamos al generador si quieres.
    console.log('Generando Anexo VI con:', formData);
    alert('Generando Anexo VI (placeholder) - revisa consola');

    // Si tienes plantilla, podrías llamar a docGen.generateConvenio(formData) o un método específico.
    // this.docGen.generateConvenio(formData).catch(err => console.error(err));
  }
}
