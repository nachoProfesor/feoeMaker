import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
    return this.http.get<TitulosResponse>(`${this.API_URL}/titulos/${tipoGrado}`).pipe(
      map(response => {
        if (response.success && response.titulos) {
          return response.titulos.map(nombre => ({ nombre }));
        }
        return [];
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
}
