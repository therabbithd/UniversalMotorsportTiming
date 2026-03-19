import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * Represents geographical location details of a circuit.
 */
export interface Location {
  /** Latitude coordinate */
  lat: string;
  /** Longitude coordinate */
  long: string;
  /** City or locality name */
  locality: string;
  /** Country name */
  country: string;
}

/**
 * Represents a Formula 1 Circuit.
 */
export interface Circuit {
  /** Unique circuit identifier */
  circuitId: string;
  /** Wikipedia URL of the circuit */
  url: string;
  /** Full name of the circuit */
  circuitName: string;
  /** Geographical location of the circuit */
  Location: Location;
}

/**
 * Represents a specific session within a Grand Prix weekend.
 */
export interface Session {
  /** Date of the session in YYYY-MM-DD format */
  date: string;
  /** Time of the session in UTC */
  time: string;
}

/**
 * Represents a single Grand Prix event.
 */
export interface Race {
  /** Season year */
  season: string;
  /** Round number in the championship */
  round: string;
  /** Wikipedia URL of the race */
  url: string;
  /** Full official name of the race */
  raceName: string;
  /** Circuit where the race is held */
  Circuit: Circuit;
  /** Target date of the main race event */
  date: string;
  /** Target time of the main race event */
  time: string;
  /** First Practice session details */
  FirstPractice?: Session;
  /** Second Practice session details */
  SecondPractice?: Session;
  /** Third Practice session details */
  ThirdPractice?: Session;
  /** Qualifying session details */
  Qualifying?: Session;
  /** Sprint Qualifying or Shootout session details */
  SprintQualifying?: Session;
  /** Sprint Race session details */
  Sprint?: Session;
}

/**
 * Contains the list of races for a season.
 */
export interface RaceTable {
  /** Season year */
  season: string;
  /** Array of races in this season */
  Races: Race[];
}

/**
 * Represents an individual F1 Driver.
 */
export interface Driver {
  /** Unique driver identifier */
  driverId: string;
  /** Permanent racing number */
  permanentNumber: string;
  /** Three-letter driver code */
  code: string;
  /** Wikipedia URL of the driver */
  url: string;
  /** First name of the driver */
  givenName: string;
  /** Last name of the driver */
  familyName: string;
  /** Date of birth of the driver */
  dateOfBirth: string;
  /** Nationality of the driver */
  nationality: string;
}

/**
 * Contains the list of drivers for a season.
 */
export interface DriverTable {
  /** Season year */
  season: string;
  /** Array of drivers in this season */
  Drivers: Driver[];
}

/**
 * Main data container for Ergast API responses.
 */
export interface MRData {
  /** XML namespace identifier */
  xmlns: string;
  /** Racing series name (e.g., f1) */
  series: string;
  /** Original request URL */
  url: string;
  /** Request limit parameter */
  limit: string;
  /** Request offset parameter */
  offset: string;
  /** Total number of available results */
  total: string;
  /** Table containing race data (if applicable) */
  RaceTable?: RaceTable;
  /** Table containing driver data (if applicable) */
  DriverTable?: DriverTable;
}

/**
 * Root structure for an Ergast API response.
 */
export interface ErgastResponse {
  /** The root MRData container */
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

  /**
   * Crea una instancia de F1CalendarService.
   * @param http Cliente HTTP para realizar peticiones a la API Ergast.
   */
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
