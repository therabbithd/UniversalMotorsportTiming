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

/**
 * Servicio encargado de la comunicación con el proxy o API dedicada MotoGP.
 * 
 * Permite buscar telemetría en vivo, rondas clasificatorias, calendarios de carreras 
 * pasadas y actuales para las diferentes categorías del mundial de MotoGP.
 */
@Injectable({
    providedIn: 'root'
})
export class MotoGPService {
    /** @ignore */
    private get baseUrl() {
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocalDev
            ? 'http://localhost:3001/motogp-api'
            : 'https://f1-websocket-proxy-production-9991.up.railway.app/motogp-api';
    }

    /**
     * Crea una instancia de MotoGPService.
     * @param http Cliente HTTP para realizar peticiones a la API de MotoGP.
     */
    constructor(private http: HttpClient) { }

    /**
     * Obtiene una lista de las temporadas registradas del mundial de motociclismo.
     * 
     * @returns Un `Observable` con un array de `MotoGPSeason`.
     */
    getSeasons(): Observable<MotoGPSeason[]> {
        return this.http.get<any>(`${this.baseUrl}/results/seasons`).pipe(
            // The API returns an object or array depending on the endpoint,
            // based on the documentation provided.
            map(response => Array.isArray(response) ? response : [response])
        );
    }

    /**
     * Obtiene las categorías participantes del mundial en un año/temporada dados
     * (e.g. Moto3, Moto2, MotoGP).
     * 
     * @param seasonUuid El UUID único proporcionado por la API para la temporada.
     * @returns Un `Observable` con un array de `MotoGPCategory`.
     */
    getCategories(seasonUuid: string): Observable<MotoGPCategory[]> {
        return this.http.get<MotoGPCategory[]>(`${this.baseUrl}/results/categories`, {
            params: { seasonUuid }
        });
    }

    /**
     * Obtiene la lista de eventos ya completados del mundial para un año predeterminado.
     * 
     * @param seasonUuid El UUID de la temporada.
     * @returns Un `Observable` con un array de `MotoGPEvent`.
     */
    getEvents(seasonUuid: string): Observable<MotoGPEvent[]> {
        return this.http.get<MotoGPEvent[]>(`${this.baseUrl}/results/events`, {
            params: { seasonUuid, isFinished: 'true' }
        });
    }

    /**
     * Obtiene todas las sesiones realizadas en un evento específico por categoría
     * (e.g. Q1, Q2, FP1, Warm Up, Race).
     * 
     * @param eventUuid El UUID único del Gran Premio de MotoGP.
     * @param categoryUuid El UUID de la categoría respectiva.
     * @returns Un `Observable` con un array de `MotoGPSession`.
     */
    getSessions(eventUuid: string, categoryUuid: string): Observable<MotoGPSession[]> {
        return this.http.get<MotoGPSession[]>(`${this.baseUrl}/results/sessions`, {
            params: { eventUuid, categoryUuid }
        });
    }

    /**
     * Obtiene la tabla clasificatoria histórica resultando de una sesión particular de un evento.
     * 
     * @param sessionId El UUID interno o ID de la sesión.
     * @returns Un `Observable` con `MotoGPClassificationResponse`.
     */
    getSessionClassification(sessionId: string): Observable<MotoGPClassificationResponse> {
        return this.http.get<MotoGPClassificationResponse>(`${this.baseUrl}/results/session/${sessionId}/classification`, {
            params: { test: 'false' }
        });
    }

    /**
     * Obtiene la clasificación general (Standings) del mundial para una categoría concreta en una temporada.
     * 
     * @param seasonUuid El UUID de la temporada.
     * @param categoryUuid El UUID de la categoría.
     * @returns Un `Observable` con la clasificación total `MotoGPStandingsResponse`.
     */
    getStandings(seasonUuid: string, categoryUuid: string): Observable<MotoGPStandingsResponse> {
        return this.http.get<MotoGPStandingsResponse>(`${this.baseUrl}/results/standings`, {
            params: { seasonUuid, categoryUuid }
        });
    }

    /**
     * Realiza una consulta aislada al gateway proxy de timing para extraer un 
     * snapshot del live timing lite (simplificado) de una sesión en progreso de MotoGP.
     * 
     * @returns Un `Observable` de `MotoGPLiveTiming`.
     */
    getLiveTiming(): Observable<MotoGPLiveTiming> {
        return this.http.get<MotoGPLiveTiming>(`${this.baseUrl}/timing-gateway/livetiming-lite`);
    }
}
