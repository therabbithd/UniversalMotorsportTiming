import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
    MotoGPSeason,
    MotoGPCategory,
    MotoGPEvent,
    MotoGPSession,
    MotoGPClassificationResponse,
    MotoGPStandingsResponse,
    MotoGPLiveTiming
} from '../models/motogp.model';

@Injectable({
    providedIn: 'root'
})
export class MotoGPService {
    private get baseUrl() {
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocalDev
            ? 'http://localhost:3001/motogp-api'
            : 'https://f1-websocket-proxy-production-9991.up.railway.app/motogp-api';
    }

    constructor(private http: HttpClient) { }

    getSeasons(): Observable<MotoGPSeason[]> {
        return this.http.get<any>(`${this.baseUrl}/results/seasons`).pipe(
            // The API returns an object or array depending on the endpoint,
            // based on the documentation provided.
            map(response => Array.isArray(response) ? response : [response])
        );
    }

    getCategories(seasonUuid: string): Observable<MotoGPCategory[]> {
        return this.http.get<MotoGPCategory[]>(`${this.baseUrl}/results/categories`, {
            params: { seasonUuid }
        });
    }

    getEvents(seasonUuid: string): Observable<MotoGPEvent[]> {
        return this.http.get<MotoGPEvent[]>(`${this.baseUrl}/results/events`, {
            params: { seasonUuid, isFinished: 'true' }
        });
    }

    getSessions(eventUuid: string, categoryUuid: string): Observable<MotoGPSession[]> {
        return this.http.get<MotoGPSession[]>(`${this.baseUrl}/results/sessions`, {
            params: { eventUuid, categoryUuid }
        });
    }

    getSessionClassification(sessionId: string): Observable<MotoGPClassificationResponse> {
        return this.http.get<MotoGPClassificationResponse>(`${this.baseUrl}/results/session/${sessionId}/classification`, {
            params: { test: 'false' }
        });
    }

    getStandings(seasonUuid: string, categoryUuid: string): Observable<MotoGPStandingsResponse> {
        return this.http.get<MotoGPStandingsResponse>(`${this.baseUrl}/results/standings`, {
            params: { seasonUuid, categoryUuid }
        });
    }

    getLiveTiming(): Observable<MotoGPLiveTiming> {
        return this.http.get<MotoGPLiveTiming>(`${this.baseUrl}/timing-gateway/livetiming-lite`);
    }
}
