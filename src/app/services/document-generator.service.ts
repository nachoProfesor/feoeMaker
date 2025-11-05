import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Injectable({
  providedIn: 'root'
})
export class DocumentGeneratorService {
  constructor(private http: HttpClient) { }

  async generateConvenio(formData: any) {
    try {
      // 1. Cargar la plantilla desde assets
      const templateResponse = await this.http
        .get('assets/template.docx', { responseType: 'arraybuffer' })
        .toPromise();

      if (!templateResponse) {
        throw new Error('No se pudo cargar la plantilla');
      }

      // 2. Crear un nuevo ZIP binario
      const zip = new PizZip(templateResponse);
      
      // 3. Crear el templater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
      });

      // 4. Renderizar el template con los datos
      doc.render({
        REPRESENTANTE_NOMBRE: `${formData.representante.nombre} ${formData.representante.apellidos}`,
        REPRESENTANTE_DNI: formData.representante.dni,
        EMPRESA_NOMBRE: formData.empresa.nombre,
        EMPRESA_CIF: formData.empresa.cif,
        EMPRESA_DIRECCION: formData.empresa.calle,
        EMPRESA_LOCALIDAD: formData.empresa.localidad,
        EMPRESA_PROVINCIA: formData.empresa.provincia,
        EMPRESA_CP: formData.empresa.codigoPostal,
        EMPRESA_TELEFONO: formData.empresa.telefono,
        EMPRESA_EMAIL: formData.empresa.email
      });

      // 5. Generar el documento
      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      // 6. Guardar el archivo
      saveAs(blob, 'convenio.docx');

    } catch (error) {
      console.error('Error al generar el documento:', error);
      throw error;
    }
  }
}