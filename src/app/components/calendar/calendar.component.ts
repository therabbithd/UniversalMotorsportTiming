import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { F1CalendarService, Race } from '../../services/f1-calendar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  races$: Observable<Race[]> | undefined;

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
    const month = startDate.toLocaleString('es-ES', { month: 'short' });
    const endMonth = endDate.toLocaleString('es-ES', { month: 'short' });

    if (month === endMonth) {
      return `${startDay} - ${endDay} ${month}`;
    } else {
      return `${startDay} ${month} - ${endDay} ${endMonth}`;
    }
  }
}
