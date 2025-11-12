import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Empresa } from '../../services/api.service';
import { DocumentGeneratorService } from '../../services/document-generator.service';

@Component({
  selector: 'app-convenio-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './convenio-detail.component.html',
  styleUrls: ['./convenio-detail.component.css']
})
export class ConvenioDetailComponent implements OnInit {
  empresa: Empresa | null = null;
  cargando = true;
  empresaId: number | null = null;
  // Anexo III form state
  showAnexoIIIForm: boolean = false;
  anexoIIINumero: string = '';
  anexoIIIFecha: string = ''; // yyyy-mm-dd from input[type=date]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private docGen: DocumentGeneratorService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (!isNaN(id)) {
        this.empresaId = id;
        this.cargarEmpresa(id);
      } else {
        this.cargando = false;
      }
    });
  }

  cargarEmpresa(id: number) {
    this.cargando = true;
    // Usamos el nuevo endpoint por id si está disponible
    this.apiService.getEmpresaById(id).subscribe({
      next: (empresa) => {
        this.empresa = empresa;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando empresa:', err);
        // Intentar fallback: cargar todas y buscar la id
        this.apiService.getEmpresas().subscribe({
          next: (empresas) => {
            this.empresa = empresas.find(e => e.id === id) || null;
            this.cargando = false;
          },
          error: () => {
            this.cargando = false;
            this.empresa = null;
          }
        });
      }
    });
  }

  generarAnexoX() {
    if (!this.empresa) {
      alert('No hay empresa cargada');
      return;
    }

    const formData: any = {
      representante: {
        nombre: this.empresa.nombre_repr || '',
        apellidos: this.empresa.apellidos_repr || '',
        dni: this.empresa.dni_repr || '',
        cargo: ''
      },
      empresa: {
        nombre: this.empresa.nombre_empr || '',
        cif: this.empresa.cif_empr || '',
        calle: this.empresa.calle_empr || '',
        localidad: this.empresa.localidad_empr || '',
        provincia: this.empresa.provincia_empr || '',
        codigoPostal: this.empresa.cod_postal_empr || '',
        telefono: this.empresa.telefono_empr || '',
        email: this.empresa.correo_empr || ''
      }
    };

    // Llamada al servicio que genera el documento
    (async () => {
      try {
        await this.docGen.generateConvenio(formData);
        // generateConvenio ya dispara la descarga del fichero con file-saver
      } catch (err) {
        console.error('Error al generar anexo X:', err);
        alert('Error al generar el anexo X. Mira la consola para más detalles.');
      }
    })();
  }

  generarAnexoIII() {
    // kept for backward compatibility — open the form
    this.toggleAnexoIIIForm();
  }

  toggleAnexoIIIForm() {
    this.showAnexoIIIForm = !this.showAnexoIIIForm;
    if (!this.showAnexoIIIForm) {
      // reset fields when closing
      this.anexoIIINumero = '';
      this.anexoIIIFecha = '';
    } else {
      // provide a sensible placeholder as starting value
      this.anexoIIINumero = '10006600-XXX';
    }
  }

  isAnexoIIIValid(): boolean {
    // Validate number: 8 digits, hyphen, 3 alnum (example format)
    
    const numOk = /^[0-9]{8}-[A-Za-z0-9]+$/.test((this.anexoIIINumero || '').trim());
    // Validate date exists
    const fechaOk = !!this.anexoIIIFecha && this.anexoIIIFecha.length === 10; // yyyy-mm-dd
    
    console.log('El problema es que disabled no cambia el aspecto del botón generar documento');
    
    return numOk && fechaOk;
  }

  generarAnexoIIIProceed() {
    
    console.log(this.isAnexoIIIValid());
    
    if (!this.isAnexoIIIValid()) {        
      alert('Rellena correctamente el número de convenio y la fecha.');
      return;
    }

    // Formatea la fecha a dd-mm-yyyy
    const parts = this.anexoIIIFecha.split('-');
    const fechaFormateada = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : this.anexoIIIFecha;

    // Preparar la fecha como objeto Date para la marca
    const fechaParts = this.anexoIIIFecha.split('-'); // yyyy-mm-dd
    const fechaObj = new Date(Number(fechaParts[0]), Number(fechaParts[1]) - 1, Number(fechaParts[2]));

    // Generar la marca hexadecimal y mostrarla en consola
    const marca = this.toMarcaHex(fechaObj);
    console.log('Marca Hex generada (Anexo III):', marca);

    // Mostrar también la conversión inversa (verificación)
    const fechaReconstruida = this.marcaHexToDate(marca);
    console.log('Fecha reconstruida desde marca:', fechaReconstruida.toISOString());

    // Preparar formData para enviar al generador
    const formData: any = {
      representante: {
        nombre: this.empresa?.nombre_repr || '',
        apellidos: this.empresa?.apellidos_repr || '',
        dni: this.empresa?.dni_repr || '',
        cargo: ''
      },
      empresa: {
        nombre: this.empresa?.nombre_empr || '',
        cif: this.empresa?.cif_empr || '',
        calle: this.empresa?.calle_empr || '',
        localidad: this.empresa?.localidad_empr || '',
        provincia: this.empresa?.provincia_empr || '',
        codigoPostal: this.empresa?.cod_postal_empr || '',
        telefono: this.empresa?.telefono_empr || '',
        email: this.empresa?.correo_empr || ''
      },
      marca: marca,
      anexoIIINumero: this.anexoIIINumero
    };

    // Llamada al servicio que genera el Anexo III
    (async () => {
      try {
        await this.docGen.generateAnexoIII(formData);
      } catch (err) {
        console.error('Error al generar anexo III:', err);
        alert('Error al generar el anexo III. Mira la consola para más detalles.');
      }
    })();

    alert(`Anexo III preparado (placeholder)\nNúmero: ${this.anexoIIINumero}\nFecha: ${fechaFormateada}\nMarca: ${marca}`);

    // Cerrar formulario
    this.showAnexoIIIForm = false;
  }

  cancelAnexoIII() {
    this.showAnexoIIIForm = false;
    this.anexoIIINumero = '';
    this.anexoIIIFecha = '';
  }

  volver() {
    this.router.navigate(['/empresas']);
  }

  // Convierte una fecha a la 'marca' hexadecimal agrupada en bloques de 4
  toMarcaHex(aDate: Date): string {
    let enHex = aDate.getTime().toString(16).toUpperCase();

    const aryChunks: string[] = [];

    const chunkSize = 4;

    const paddedLength = enHex.length % chunkSize === 0 ? enHex.length : enHex.length + (chunkSize - enHex.length % chunkSize);

    enHex = enHex.padStart(paddedLength, '0');

    for (let i = 0; i < enHex.length; i += chunkSize) {
      const chunk = enHex.slice(i, i + chunkSize);
      aryChunks.push(chunk);
    }

    return aryChunks.join('-');
  }

  // Convierte la marca hexadecimal (formato XXXX-XXXX-...) de vuelta a Date
  marcaHexToDate(marcaHex: string): Date {
    const partes = marcaHex.split('-');
    const sInt = partes.join('');
    const dateFromMarcaHex = new Date(parseInt(sInt, 16));
    return dateFromMarcaHex;
  }
}
