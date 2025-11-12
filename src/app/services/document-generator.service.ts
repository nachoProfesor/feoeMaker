import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Injectable({ providedIn: 'root' })
export class DocumentGeneratorService {
  private readonly TEMPLATE_PATH = 'assets/template.docx';

  constructor(private http: HttpClient) { }

  async generateConvenio(formData: any) {
    try {
      const response = await fetch('assets/AnexoXtemplate.docx');
      const arrayBuffer = await response.arrayBuffer();

      if (!arrayBuffer) throw new Error('No se pudo cargar la plantilla (arrayBuffer vacío)');

      const buf = new Uint8Array(arrayBuffer);

      // Debe empezar por 50 4B 03 04 (ZIP/DOCX). Si no, probablemente es index.html (404 fallback).
      // const isZip = buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
      // if (!isZip) {
      //   const preview = response.headers.get('Content-Type')?.startsWith('text/') ? (await response.text()).slice(0, 200) : '';
      //   throw new Error(`La plantilla no es un DOCX válido. Content-Type: ${response.headers.get('Content-Type')}. Preview: ${preview}`);
      // }

      const zip = new PizZip(buf);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      const now = new Date();
      const mesNombre = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now); // ej: "noviembre"

      doc.render({
        REPRESENTANTE_NOMBRE: `${formData?.representante?.nombre || ''} ${formData?.representante?.apellidos || ''}`.trim(),
        REPRESENTANTE_DNI: formData?.representante?.dni || '',
        REPRESENTANTE_CARGO: formData?.representante?.cargo || 'administrador',
        EMPRESA_NOMBRE: formData?.empresa?.nombre || '',
        EMPRESA_CIF: formData?.empresa?.cif || '',
        EMPRESA_DIRECCION: formData?.empresa?.calle || '',
        EMPRESA_LOCALIDAD: formData?.empresa?.localidad || '',
        EMPRESA_PROVINCIA: formData?.empresa?.provincia || '',
        EMPRESA_CP: formData?.empresa?.codigoPostal || '',
        EMPRESA_TELEFONO: formData?.empresa?.telefono || '',
        EMPRESA_EMAIL: formData?.empresa?.email || '',
        FECHA_DIA: now.getDate().toString(),
        FECHA_MES_NOMBRE: mesNombre,
        FECHA_ANIO: now.getFullYear().toString()
      });

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      saveAs(out, `AnexoX_${formData?.empresa?.nombre || 'empresa'}.docx`);
    } catch (e) {
      console.error('Error generating document:', e);
      throw e;
    }
  }

  async generateAnexoIII(formData: any) {
    try {
      const response = await fetch('assets/AnexoIIItemplate.docx');
      const arrayBuffer = await response.arrayBuffer();

      if (!arrayBuffer) throw new Error('No se pudo cargar la plantilla Anexo III (arrayBuffer vacío)');

      const buf = new Uint8Array(arrayBuffer);
      const zip = new PizZip(buf);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      const now = new Date();
      const mesNombre = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now);

      // Renderizar con las mismas claves que generateConvenio, añadiendo marca y numero de anexo III
      doc.render({
        REPRESENTANTE_NOMBRE: `${formData?.representante?.nombre || ''} ${formData?.representante?.apellidos || ''}`.trim(),
        REPRESENTANTE_DNI: formData?.representante?.dni || '',
        REPRESENTANTE_CARGO: formData?.representante?.cargo || 'administrador',
        EMPRESA_NOMBRE: formData?.empresa?.nombre || '',
        EMPRESA_CIF: formData?.empresa?.cif || '',
        EMPRESA_DIRECCION: formData?.empresa?.calle || '',
        EMPRESA_LOCALIDAD: formData?.empresa?.localidad || '',
        EMPRESA_PROVINCIA: formData?.empresa?.provincia || '',
        EMPRESA_CP: formData?.empresa?.codigoPostal || '',
        EMPRESA_TELEFONO: formData?.empresa?.telefono || '',
        EMPRESA_EMAIL: formData?.empresa?.email || '',
        FECHA_DIA: now.getDate().toString(),
        FECHA_MES_NOMBRE: mesNombre,
        FECHA_ANIO: now.getFullYear().toString(),
        // Campos adicionales para Anexo III
        MARCA: formData?.marca || '',
        ANEXOIIINUMERO: formData?.anexoIIINumero || ''
      });

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      saveAs(out, `Convenio_FEOE_${formData?.anexoIIINumero}_${formData?.marca}.docx`);
    } catch (e) {
      console.error('Error generating Anexo III document:', e);
      throw e;
    }
  }
}