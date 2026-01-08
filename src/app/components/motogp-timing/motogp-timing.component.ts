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
        MatTabsModule,
        TranslateModule,
        CountryFlagPipe
    ],
    templateUrl: './motogp-timing.component.html',
    styleUrls: ['./motogp-timing.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotoGPTimingComponent implements OnInit, OnDestroy {
    public seasons: MotoGPSeason[] = [];
    public categories: MotoGPCategory[] = [];
    public events: MotoGPEvent[] = [];
    public sessions: MotoGPSession[] = [];
    public classification: MotoGPClassificationEntry[] = [];
    public standings: MotoGPStandingEntry[] = [];
    public liveTiming?: MotoGPLiveTiming;
    public liveRiders: MotoGPLiveRider[] = [];

    public selectedSeason?: string;
    public selectedCategory?: string;
    public selectedEvent?: string;
    public selectedSession?: string;

    public isLoading = false;
    public noData = false;
    public isLiveVisible = false;

    public displayedResultsColumns: string[] = ['position', 'rider', 'team', 'best_lap', 'gap', 'speed'];
    public displayedStandingsColumns: string[] = ['position', 'rider', 'team', 'points'];
    public displayedLiveColumns: string[] = ['position', 'rider', 'team', 'lap', 'lap_time', 'gap', 'pit'];

    private pollingSubscription?: Subscription;

    constructor(
        private motogpService: MotoGPService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadSeasons();
        this.startLivePolling();
    }

    ngOnDestroy(): void {
        this.stopLivePolling();
    }

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

    stopLivePolling(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
    }

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

    onSessionChange(sessionId: string): void {
        this.selectedSession = sessionId;
        this.loadClassification(sessionId);
    }

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

    getCountryFlag(iso: string): string {
        return `https://flagcdn.com/w20/${iso.toLowerCase()}.png`;
    }
}
