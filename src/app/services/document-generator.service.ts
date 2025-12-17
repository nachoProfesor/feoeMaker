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

  async generateAnexoVI(formData: any) {
    try {
      // Try several possible filenames (some have different casing/naming in assets)
      const candidates = [
        'assets/anexovitemplate.docx',
        'assets/AnexoVITemplate.docx',
        'assets/ANEXOVITemplate.docx',
        'assets/ANEXOVITemplate.docx',
        'assets/AnexoVItemplate.docx',
        'assets/ANEXO X.docx',
        'assets/ANEXO X.docx'
      ];

      let arrayBuffer: ArrayBuffer | null = null;
      let usedPath = '';
      let lastRespInfo: string | null = null;

      for (const p of candidates) {
        try {
          const resp = await fetch(p);
          if (!resp.ok) {
            lastRespInfo = `${p} returned status ${resp.status}`;
            continue;
          }
          const ab = await resp.arrayBuffer();
          if (!ab) {
            lastRespInfo = `${p} returned empty body`;
            continue;
          }
          const bufCheck = new Uint8Array(ab);
          // Check ZIP header 50 4B 03 04
          if (bufCheck.length >= 4 && bufCheck[0] === 0x50 && bufCheck[1] === 0x4B && bufCheck[2] === 0x03 && bufCheck[3] === 0x04) {
            arrayBuffer = ab;
            usedPath = p;
            break;
          } else {
            // capture text preview if possible to show helpful error
            try {
              const text = await resp.text();
              lastRespInfo = `${p} returned non-docx content (preview: ${text.slice(0,200)})`;
            } catch (e) {
              lastRespInfo = `${p} returned non-docx binary content`;
            }
            continue;
          }
        } catch (e) {
          lastRespInfo = `fetch(${p}) failed: ${String(e)}`;
          continue;
        }
      }

      if (!arrayBuffer) {
        throw new Error(`No se encontró una plantilla DOCX válida para Anexo VI. Intentados: ${candidates.join(', ')}. Última info: ${lastRespInfo}`);
      }

      const buf = new Uint8Array(arrayBuffer);
      const zip = new PizZip(buf);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      const now = new Date();
      const mesNombre = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now);

      // Helpers to safely extract values
      const ciclo = formData?.ciclo || {};
      const alumno = formData?.alumno || {};
      const empresa = formData?.empresa || {};

      const requiereMedidas = typeof formData?.requiere_medidas === 'boolean'
        ? (formData.requiere_medidas ? 'Sí' : 'No')
        : (formData.requiere_medidas ?? formData.requiereMedidas ?? 'No');

      const requiereAutorizacion = typeof formData?.requiere_autorizacion === 'boolean'
        ? (formData.requiere_autorizacion ? 'Sí' : 'No')
        : (formData.requiere_autorizacion ?? formData.requiereAutorizacion ?? 'No');

      doc.render({
        NOMBRE_CICLO: ciclo?.nombre || formData?.ciclo_nombre || '',
        CODIGO_CICLO: ciclo?.codigo || ciclo?.codigo_ciclo || formData?.ciclo_codigo || '',
        APELLIDOS_ALUMNO: alumno?.apellidos || '',
        NOMBRE_ALUMNO: alumno?.nombre || '',
        CORREO_ALUMNO: alumno?.correo || alumno?.email || '',
        NOMBRE_TUTOR: formData?.nombre_tutor || formData?.tutor_nombre || '',
        CORREO_TUTOR: formData?.correo_tutor || formData?.tutor_correo || '',
        REQUIERE_MEDIDAS: requiereMedidas,
        REQUIERE_AUTORIZACION: requiereAutorizacion,
        NOMBRE_EMPRESA: empresa?.nombre_empr || empresa?.nombre || '',
        DIA: now.getDate().toString(),
        MES: mesNombre,
        ANO: now.getFullYear().toString(),
        // Optional scheduling fields
        CALENDARIO: (() => {
          const c = formData?.calendario || formData?.fecha_calendario || null;
          if (!c) return '';
          try {
            const d = new Date(c);
            return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
          } catch (e) { return String(c); }
        })(),
        MODALIDAD: formData?.modalidad || formData?.tipo || '',
        NUMERO_HORAS: (formData?.numero_horas ?? formData?.numeroHoras ?? '')
      });

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const nombreArchivo = `AnexoVI_${(alumno?.apellidos || 'alumno').replace(/\s+/g, '_')}_${(empresa?.nombre_empr || empresa?.nombre || 'empresa').replace(/\s+/g, '_')}.docx`;
      saveAs(out, nombreArchivo);
    } catch (e) {
      console.error('Error generating Anexo VI document:', e);
      throw e;
    }
  }
}