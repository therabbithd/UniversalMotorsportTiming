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

@Injectable({
  providedIn: 'root'
})
export class F1CalendarService {
  private apiUrl = 'https://api.jolpi.ca/ergast/f1/2026.json';

  constructor(private http: HttpClient) { }

  getRaceCalendar(): Observable<Race[]> {
    return this.http.get<ErgastResponse>(this.apiUrl).pipe(
      map(response => response.MRData.RaceTable!.Races)
    );
  }

  getDrivers(): Observable<Driver[]> {
    const driversUrl = 'https://api.jolpi.ca/ergast/f1/2026/drivers.json';
    return this.http.get<ErgastResponse>(driversUrl).pipe(
      map(response => response.MRData.DriverTable!.Drivers)
    );
  }

  getRaceDetails(round: string): Observable<Race | undefined> {
    return this.getRaceCalendar().pipe(
      map(races => races.find(r => r.round === round))
    );
  }
}
