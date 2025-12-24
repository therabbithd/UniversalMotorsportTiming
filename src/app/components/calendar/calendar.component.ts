import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { F1CalendarService, Race } from '../../services/f1-calendar.service';
import { Observable } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  races$: Observable<Race[]> | undefined;
  private translate = inject(TranslateService);

  constructor(private calendarService: F1CalendarService) { }

  ngOnInit(): void {
    this.races$ = this.calendarService.getRaceCalendar();
  }

  getRaceDateRange(race: Race): string {
    const startDateStr = race.FirstPractice?.date || race.date;
    const endDateStr = race.date;

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const currentLang = this.translate.currentLang || 'es';
    const month = startDate.toLocaleString(currentLang, { month: 'short' });
    const endMonth = endDate.toLocaleString(currentLang, { month: 'short' });

    if (month === endMonth) {
      return `${startDay} - ${endDay} ${month}`;
    } else {
      return `${startDay} ${month} - ${endDay} ${endMonth}`;
    }
  }
}
