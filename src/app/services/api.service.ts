import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CE {
  id?: string;
  codigo?: string;
  descripcion: string;
}

export interface RA {
  id?: string;
  codigo?: string;
  descripcion: string;
  ces?: CE[];
}

export interface Modulo {
  id?: string;
  codigo?: string;
  nombre: string;
  ras?: RA[];
}

export interface Titulo {
  id?: string;
  codigo?: string;
  nombre: string;
  modulos?: Modulo[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'https://scraping-curriculos-1.onrender.com/api';

  constructor(private http: HttpClient) { }

  getTitulos(): Observable<Titulo[]> {
    return this.http.get<Titulo[]>(`${this.API_URL}/titulos`);
  }

  getTituloById(id: string): Observable<Titulo> {
    return this.http.get<Titulo>(`${this.API_URL}/titulos/${id}`);
  }

  getModulosByTitulo(tituloId: string): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.API_URL}/titulos/${tituloId}/modulos`);
  }

  getModuloById(id: string): Observable<Modulo> {
    return this.http.get<Modulo>(`${this.API_URL}/modulos/${id}`);
  }

  getRasByModulo(moduloId: string): Observable<RA[]> {
    return this.http.get<RA[]>(`${this.API_URL}/modulos/${moduloId}/ras`);
  }

  getRaById(id: string): Observable<RA> {
    return this.http.get<RA>(`${this.API_URL}/ras/${id}`);
  }

  getCesByRa(raId: string): Observable<CE[]> {
    return this.http.get<CE[]>(`${this.API_URL}/ras/${raId}/ces`);
  }
}
