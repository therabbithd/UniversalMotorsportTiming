import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

export interface Session {
  date: string;
  time: string;
}

export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time: string;
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  Qualifying?: Session;
  SprintQualifying?: Session;
  Sprint?: Session;
}

export interface RaceTable {
  season: string;
  Races: Race[];
}

export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface DriverTable {
  season: string;
  Drivers: Driver[];
}

export interface MRData {
  xmlns: string;
  series: string;
  url: string;
  limit: string;
  offset: string;
  total: string;
  RaceTable?: RaceTable;
  DriverTable?: DriverTable;
}

export interface ErgastResponse {
  MRData: MRData;
}

/**
 * Servicio encargado de consultar los datos históricos y del calendario a la API
 * comunitaria Ergast (a través de jolpi.ca).
 * 
 * Permite buscar la lista de carreras por circuito, fechas de sesiones, 
 * y listados de pilotos de la temporada especificada.
 */
@Injectable({
  providedIn: 'root'
})
export class F1CalendarService {
  /** @ignore */
  private apiUrl = 'https://api.jolpi.ca/ergast/f1/2026.json';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la estructura global del calendario (sesiones, circuitos, fechas).
   * 
   * @returns Un `Observable` con un array del modelo `Race`.
   */
  getRaceCalendar(): Observable<Race[]> {
    return this.http.get<ErgastResponse>(this.apiUrl).pipe(
      map(response => response.MRData.RaceTable!.Races)
    );
  }

  /**
   * Obtiene la lista completa de pilotos confirmados para la temporada estipulada.
   * 
   * @returns Un `Observable` con un array del modelo `Driver`.
   */
  getDrivers(): Observable<Driver[]> {
    const driversUrl = 'https://api.jolpi.ca/ergast/f1/2026/drivers.json';
    return this.http.get<ErgastResponse>(driversUrl).pipe(
      map(response => response.MRData.DriverTable!.Drivers)
    );
  }

  /**
   * Obtiene la información estructurada de una carrera o fin de semana en específico.
   * 
   * @param round El número de la ronda del mundial solicitada (como string).
   * @returns Un `Observable` que emite un objeto `Race` o `undefined` si no existe la ronda.
   */
  getRaceDetails(round: string): Observable<Race | undefined> {
    return this.getRaceCalendar().pipe(
      map(races => races.find(r => r.round === round))
    );
  }
}
