import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { F1CalendarService, Race } from '../../services/f1-calendar.service';
import { Observable } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Componente que muestra la lista de carreras y grandes premios del calendario actual de Fórmula 1.
 * 
 * Se conecta con `F1CalendarService` para recuperar todo el calendario estacional y presentarlo
 * visualmente al usuario con formato internacionalizado.
 */
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  /**
   * Observable que contiene el listado completo de carreras una vez cargado.
   */
  races$: Observable<Race[]> | undefined;
  
  /** @ignore */
  private translate = inject(TranslateService);

  /** @ignore */
  constructor(private calendarService: F1CalendarService) { }

  /**
   * Inicializa el componente solicitando los datos del calendario a través del servicio respectivo.
   */
  ngOnInit(): void {
    this.races$ = this.calendarService.getRaceCalendar();
  }

  /**
   * Elabora un string de rango de fechas legible humanamente para un fin de semana de Gran Premio.
   * Maneja casos de cambio de mes entre las prácticas y la carrera (ej. "30 Mar - 1 Abr" vs "12 - 14 May").
   * 
   * @param race Objeto con la información individual del fin de semana.
   * @returns Un texto formateado listando los días y mes del evento, usando la localización actual.
   */
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
