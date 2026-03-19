import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { F1CalendarService, Race, Session } from '../../services/f1-calendar.service';
import { Observable, map, switchMap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Component that displays the detailed information and session schedule
 * for a specific Formula 1 Grand Prix weekend.
 */
@Component({
  selector: 'app-calendar-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './calendar-detail.component.html',
  styleUrl: './calendar-detail.component.scss'
})
export class CalendarDetailComponent implements OnInit {
  /** Observable containing the fetched race details */
  race$: Observable<Race | undefined> | undefined;
  /** The user's local timezone used for formatting dates */
  userTimezone: string = '';
  /** Injected translation service */
  private translate = inject(TranslateService);

  /**
   * Initializes the CalendarDetailComponent.
   * @param route ActivatedRoute instance
   * @param calendarService Calendar service instance
   */
  constructor(
    private route: ActivatedRoute,
    private calendarService: F1CalendarService
  ) { }

  /** Retrieves the current active language code */
  get currentLang(): string {
    return this.translate.currentLang;
  }

  /**
   * Lifecycle hook to retrieve route parameters and fetch race details.
   */
  ngOnInit(): void {
    this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.race$ = this.route.paramMap.pipe(
      switchMap(params => {
        const round = params.get('round');
        if (round) {
          return this.calendarService.getRaceDetails(round);
        }
        return [];
      })
    );
  }

  /**
   * Formats the session date and time into a local Date object.
   * @param session The Session object
   * @returns Date object or null if session is undefined
   */
  getSessionDate(session: Session | undefined): Date | null {
    if (!session) return null;
    // Append 'Z' to ensure it's treated as UTC if the API returns ISO string without it, 
    // although the service interface suggests the API returns "HH:mm:ssZ".
    // If the API returns "04:00:00Z", new Date() correctly interprets it as UTC.
    const time = session.time.endsWith('Z') ? session.time : `${session.time}Z`;
    return new Date(`${session.date}T${time}`);
  }
}
