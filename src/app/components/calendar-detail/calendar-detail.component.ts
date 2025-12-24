import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { F1CalendarService, Race, Session } from '../../services/f1-calendar.service';
import { Observable, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-calendar-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar-detail.component.html',
  styleUrl: './calendar-detail.component.scss'
})
export class CalendarDetailComponent implements OnInit {
  race$: Observable<Race | undefined> | undefined;
  userTimezone: string = '';

  constructor(
    private route: ActivatedRoute,
    private calendarService: F1CalendarService
  ) { }

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

  getSessionDate(session: Session | undefined): Date | null {
    if (!session) return null;
    // Append 'Z' to ensure it's treated as UTC if the API returns ISO string without it, 
    // although the service interface suggests the API returns "HH:mm:ssZ".
    // If the API returns "04:00:00Z", new Date() correctly interprets it as UTC.
    const time = session.time.endsWith('Z') ? session.time : `${session.time}Z`;
    return new Date(`${session.date}T${time}`);
  }
}
