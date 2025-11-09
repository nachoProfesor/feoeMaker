import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface CE {
  descripcion: string;
}

export interface RA {
  descripcion: string;
  criterios_evaluacion: CE[];
}

export interface Modulo {
  nombre: string;
  codigo: string;
  horas: string;
  num_ras: number;
  num_ces: number;
  resultados_aprendizaje: RA[];
}

export interface Titulo {
  nombre: string;
  codigo?: string;
}

export interface TipoGrado {
  tipo: string;
  nombre: string;
}

// Interfaces para Empresas y Alumnos
export interface Empresa {
  id?: number;
  nombre_empr: string;
  cif_empr?: string;
  localidad_empr?: string;
  provincia_empr?: string;
  calle_empr?: string;
  cod_postal_empr?: string;
  telefono_empr?: string;
  correo_empr?: string;
  nombre_repr?: string;
  apellidos_repr?: string;
  dni_repr?: string;
  numero_convenio?: number;
  fecha_firma_conv?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Alumno {
  id?: number;
  nombre: string;
  apellidos: string;
  dni_numero: string;
  correo?: string;
  domicilio?: string;
  localidad?: string;
  telefono?: string;
}

export interface EmpresasResponse {
  success: boolean;
  total: number;
  empresas: Empresa[];
}

export interface AlumnosResponse {
  success: boolean;
  total: number;
  alumnos: Alumno[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TitulosResponse {
  success: boolean;
  tipo_grado: string;
  titulos: string[];
  total: number;
}

export interface ExtraerResponse {
  success: boolean;
  tipo_grado: string;
  titulo: string;
  estadisticas: {
    total_modulos: number;
    total_ras: number;
    total_ces: number;
  };
  modulos: Modulo[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'https://scraping-curriculos-1.onrender.com/api';

  constructor(private http: HttpClient) { }

  // Obtener tipos de grado disponibles
  getTiposGrado(): Observable<TipoGrado[]> {
    return this.http.get<any>(`${this.API_URL}/tipos`).pipe(
      map(response => response.tipos || [])
    );
  }

  // Obtener títulos por tipo de grado
  getTitulos(tipoGrado: string = 'superior'): Observable<Titulo[]> {
    const url = `${this.API_URL}/titulos/${tipoGrado}`;
    console.log('Llamando a API:', url);
    return this.http.get<TitulosResponse>(url).pipe(
      map(response => {
        console.log('Respuesta de API:', response);
        if (response.success && response.titulos) {
          return response.titulos.map(nombre => ({ nombre }));
        }
        return [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error HTTP:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        return throwError(() => error);
      })
    );
  }

  // Extraer módulos de un título específico
  extraerModulos(tipoGrado: string, titulo: string): Observable<Modulo[]> {
    return this.http.post<ExtraerResponse>(`${this.API_URL}/extraer`, {
      tipo_grado: tipoGrado,
      titulo: titulo
    }).pipe(
      map(response => {
        if (response.success && response.modulos) {
          return response.modulos;
        }
        return [];
      })
    );
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.API_URL}/health`);
  }

  // ============================================
  // EMPRESAS
  // ============================================

  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<EmpresasResponse>(`${this.API_URL}/practicas/empresas`).pipe(
      map(response => {
        if (response.success && response.empresas) {
          return response.empresas;
        }
        return [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener empresas:', error);
        return throwError(() => error);
      })
    );
  }

  crearEmpresa(empresa: Empresa): Observable<{ success: boolean; id?: number; error?: string }> {
    console.log('ApiService - Enviando empresa:', empresa);
    console.log('ApiService - URL:', `${this.API_URL}/practicas/empresas`);
    
    return this.http.post<{ success: boolean; id?: number; error?: string }>(
      `${this.API_URL}/practicas/empresas`,
      empresa,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al crear empresa:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        return throwError(() => error);
      })
    );
  }

  actualizarEmpresa(id: number, empresa: Empresa): Observable<{ success: boolean; error?: string }> {
    return this.http.put<{ success: boolean; error?: string }>(
      `${this.API_URL}/practicas/empresas/${id}`,
      empresa
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al actualizar empresa:', error);
        return throwError(() => error);
      })
    );
  }

  eliminarEmpresa(id: number): Observable<{ success: boolean; error?: string }> {
    return this.http.delete<{ success: boolean; error?: string }>(
      `${this.API_URL}/practicas/empresas/${id}`
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al eliminar empresa:', error);
        return throwError(() => error);
      })
    );
  }

  // ============================================
  // CICLOS FORMATIVOS
  // ============================================

  getCiclosFormativos(): Observable<any[]> {
    return this.http.get<any>(`${this.API_URL}/practicas/ciclos`).pipe(
      map(response => {
        if (response.success && response.ciclos) {
          return response.ciclos;
        }
        return [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener ciclos formativos:', error);
        return throwError(() => error);
      })
    );
  }

  getCicloConModulos(cicloId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/practicas/ciclos/${cicloId}/modulos`).pipe(
      map(response => {
        if (response.success) {
          return {
            ciclo: response.ciclo,
            modulos: response.modulos || [],
            titulo_id: response.titulo_id // Necesario para guardar el PFI
          };
        }
        return { ciclo: null, modulos: [], titulo_id: null };
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener ciclo con módulos:', error);
        return throwError(() => error);
      })
    );
  }

  guardarPFI(pfiData: any): Observable<{ success: boolean; pfi_id?: number; message?: string; error?: string }> {
    return this.http.post<{ success: boolean; pfi_id?: number; message?: string; error?: string }>(
      `${this.API_URL}/practicas/pfi`,
      pfiData
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al guardar PFI:', error);
        return throwError(() => error);
      })
    );
  }

  getPFIsPorCiclo(cicloId: number): Observable<any[]> {
    return this.http.get<any>(`${this.API_URL}/practicas/pfi/ciclo/${cicloId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener PFIs del ciclo:', error);
        // Si el endpoint no existe (404), devolver array vacío en vez de error
        if (error.status === 404) {
          console.warn('Endpoint de PFIs no disponible aún, mostrando lista vacía');
          return [[]];
        }
        return throwError(() => error);
      })
    );
  }

  // ============================================
  // ALUMNOS
  // ============================================

  getAlumnos(): Observable<Alumno[]> {
    return this.http.get<AlumnosResponse>(`${this.API_URL}/practicas/alumnos`).pipe(
      map(response => {
        if (response.success && response.alumnos) {
          return response.alumnos;
        }
        return [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener alumnos:', error);
        return throwError(() => error);
      })
    );
  }

  crearAlumno(alumno: Alumno): Observable<{ success: boolean; id?: number; error?: string }> {
    return this.http.post<{ success: boolean; id?: number; error?: string }>(
      `${this.API_URL}/practicas/alumnos`,
      alumno
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al crear alumno:', error);
        return throwError(() => error);
      })
    );
  }
}
