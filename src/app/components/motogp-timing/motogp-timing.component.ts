import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription, switchMap, catchError, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MotoGPService } from '../../services/motogp.service';
import {
    MotoGPSeason,
    MotoGPCategory,
    MotoGPEvent,
    MotoGPSession,
    MotoGPClassificationEntry,
    MotoGPStandingEntry,
    MotoGPLiveTiming,
    MotoGPLiveRider
} from '../../models/motogp.model';
import { CountryFlagPipe } from '../../pipes/country-flag.pipe';

/**
 * Componente principal para visualizar la información del mundial de MotoGP.
 * 
 * Permite al usuario navegar a través de diferentes temporadas, categorías (MotoGP, Moto2, Moto3)
 * y eventos, revisar las tablas de clasificación, el campeonato general (standings), 
 * y observar una versión Lite del Live Timing cuando existe una sesión actualmente activa.
 */
@Component({
    selector: 'app-motogp-timing',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatSelectModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        TranslateModule,
        CountryFlagPipe
    ],
    templateUrl: './motogp-timing.component.html',
    styleUrls: ['./motogp-timing.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotoGPTimingComponent implements OnInit, OnDestroy {
    /** Lista de temporadas disponibles en el API histórico. */
    public seasons: MotoGPSeason[] = [];
    /** Lista de categorías disponibles para la temporada actual. */
    public categories: MotoGPCategory[] = [];
    /** Lista de grandes premios y eventos de la categoría actual. */
    public events: MotoGPEvent[] = [];
    /** Sesiones cronometradas y de carrera del evento actual. */
    public sessions: MotoGPSession[] = [];
    
    /** Resultados clasificatorios de la sesión seleccionada. */
    public classification: MotoGPClassificationEntry[] = [];
    /** Tabla general del campeonato mundial (Standings). */
    public standings: MotoGPStandingEntry[] = [];
    
    /** Objeto con el snapshot actual del Live Timing. */
    public liveTiming?: MotoGPLiveTiming;
    /** Matriz de pilotos activos en directo ordenados por posición. */
    public liveRiders: MotoGPLiveRider[] = [];

    /** @ignore */
    /** Currently selected season ID */
    public selectedSeason?: string;
    /** Currently selected category ID (MotoGP, Moto2, etc.) */
    public selectedCategory?: string;
    /** Currently selected event ID */
    public selectedEvent?: string;
    /** Currently selected session ID */
    public selectedSession?: string;

    /** Indicates if there are active HTTP requests blocking the UI */
    public isLoading = false;
    /** Indicates if the data query returned no results */
    public noData = false;
    /** Controls the conditional display of the Live Timing tab */
    public isLiveVisible = false;

    /** Definición de columnas para la tabla de resultados de sesión. */
    public displayedResultsColumns: string[] = ['position', 'rider', 'team', 'best_lap', 'gap', 'speed'];
    /** Definición de columnas para la tabla de clasificación del mundial. */
    public displayedStandingsColumns: string[] = ['position', 'rider', 'team', 'points'];
    /** Definición de columnas para la tabla de Live Timing Lite. */
    public displayedLiveColumns: string[] = ['position', 'rider', 'team', 'lap', 'lap_time', 'gap', 'pit'];

    /** Suscripción al intervalo de polling para datos en vivo. */
    private pollingSubscription?: Subscription;

    /**
     * Crea una instancia de MotoGPTimingComponent.
     * @param motogpService Servicio de datos de MotoGP.
     * @param cdr Referencia para la detección de cambios manual.
     */
    constructor(
        private motogpService: MotoGPService,
        private cdr: ChangeDetectorRef
    ) { }

    /**
     * Inicializa el componente cargando las temporadas e iniciado el polling de datos en vivo.
     */
    ngOnInit(): void {
        this.loadSeasons();
        this.startLivePolling();
    }

    /**
     * Detiene el polling al destruir el componente para evitar fugas de memoria.
     */
    ngOnDestroy(): void {
        this.stopLivePolling();
    }

    /**
     * Inicia un observador periódico que comprueba cada 10 segundos la disponibilidad 
     * de un nuevo set de tiempos en vivo a través del API Proxy.
     */
    startLivePolling(): void {
        // Poll every 10 seconds for lite live timing
        this.pollingSubscription = interval(10000).pipe(
            switchMap(() => this.motogpService.getLiveTiming().pipe(
                catchError(() => of(null))
            ))
        ).subscribe(data => {
            if (data && data.head && data.rider) {
                this.liveTiming = data;
                this.liveRiders = Object.values(data.rider).sort((a, b) => a.pos - b.pos);
                this.isLiveVisible = true;
            } else {
                this.isLiveVisible = false;
            }
            this.cdr.markForCheck();
        });

        // Initial load
        this.motogpService.getLiveTiming().subscribe(data => {
            if (data && data.head && data.rider) {
                this.liveTiming = data;
                this.liveRiders = Object.values(data.rider).sort((a, b) => a.pos - b.pos);
                this.isLiveVisible = true;
            }
            this.cdr.markForCheck();
        });
    }

    /** Módulo para finalizar el "polling" recurrente del servidor en caso de destrucción. */
    stopLivePolling(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
    }

    /**
     * Carga el historial de temporadas de MotoGP soportadas y selecciona la actual 
     * por defecto, encadenando subsiguientes cargas (Categorías, Eventos, Sesiones).
     */
    loadSeasons(): void {
        this.isLoading = true;
        this.motogpService.getSeasons().subscribe({
            next: (seasons) => {
                this.seasons = seasons;
                const currentSeason = seasons.find(s => s.current) || seasons[0];
                if (currentSeason) {
                    this.selectedSeason = currentSeason.id;
                    this.onSeasonChange(this.selectedSeason);
                } else {
                    this.noData = true;
                    this.isLoading = false;
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.noData = true;
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Handles the season change event, resetting subsequent filters and loading categories.
     * @param seasonId Selected season ID
     */
    onSeasonChange(seasonId: string): void {
        this.selectedSeason = seasonId;
        this.isLoading = true;

        // Reset dependant selections
        this.selectedCategory = undefined;
        this.selectedEvent = undefined;
        this.selectedSession = undefined;
        this.classification = [];
        this.standings = [];

        this.motogpService.getCategories(seasonId).subscribe({
            next: (categories) => {
                this.categories = categories;
                if (categories.length > 0) {
                    this.selectedCategory = categories[0].id;
                    this.loadEvents(seasonId);
                    this.loadStandings();
                } else {
                    this.isLoading = false;
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Recupera la lista de grandes premios (eventos) para la temporada seleccionada.
     * 
     * @param seasonId UUID de la temporada.
     */
    loadEvents(seasonId: string): void {
        this.motogpService.getEvents(seasonId).subscribe({
            next: (events) => {
                this.events = events.reverse(); // Latest events first
                if (events.length > 0) {
                    this.selectedEvent = events[0].id;
                    this.onEventChange(this.selectedEvent);
                } else {
                    this.isLoading = false;
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Handles the event change, loading subsequent sessions for the selected event and category.
     * @param eventId Selected event ID
     */
    onEventChange(eventId: string): void {
        this.selectedEvent = eventId;
        if (!this.selectedCategory) return;

        this.motogpService.getSessions(eventId, this.selectedCategory).subscribe({
            next: (sessions) => {
                this.sessions = sessions;
                // Try to find a "Race" session or default to the last one
                const raceSession = sessions.find(s => s.type === 'RAC' || s.number === 1) || sessions[sessions.length - 1];
                if (raceSession) {
                    this.selectedSession = raceSession.id;
                    this.loadClassification(raceSession.id);
                } else {
                    this.isLoading = false;
                    this.classification = [];
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Maneja el cambio de sesión manual por parte del usuario.
     * 
     * @param sessionId UUID de la nueva sesión seleccionada.
     */
    onSessionChange(sessionId: string): void {
        this.selectedSession = sessionId;
        this.loadClassification(sessionId);
    }

    /**
     * Carga los resultados detallados de clasificación de una sesión específica.
     * 
     * @param sessionId UUID de la sesión.
     */
    loadClassification(sessionId: string): void {
        this.isLoading = true;
        this.motogpService.getSessionClassification(sessionId).subscribe({
            next: (resp) => {
                this.classification = resp.classification || [];
                this.noData = this.classification.length === 0;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.classification = [];
                this.noData = true;
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Carga la tabla de puntos general del campeonato mundial (Standings).
     */
    loadStandings(): void {
        if (!this.selectedSeason || !this.selectedCategory) return;

        this.motogpService.getStandings(this.selectedSeason, this.selectedCategory).subscribe({
            next: (resp) => {
                this.standings = resp.classification || [];
                this.cdr.markForCheck();
            },
            error: () => {
                this.standings = [];
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Devuelve la URL de la miniatura de la bandera correspondiente al código ISO
     * usando la red pública gratuita `flagcdn`.
     * 
     * @param iso Código de país (ej. `IT`, `ES`, `GB`).
     * @returns Un link HTTP directo a la bandera en formato PNG de 20px de ancho.
     */
    getCountryFlag(iso: string): string {
        return `https://flagcdn.com/w20/${iso.toLowerCase()}.png`;
    }
}
