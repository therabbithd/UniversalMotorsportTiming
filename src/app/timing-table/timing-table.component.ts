// timing-table.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { F1LiveTimingStreamService } from '../services/f1-livetiming.service';
import { DriverTiming } from '../models/f1-livetiming.model';
import { CircuitMapComponent } from '../components/circuit-map/circuit-map.component';
import { DriverRadiosComponent } from "../components/driver-radios/driver-radios.component";
import { DriverSectorsComponent } from '../components/driver-sector/driver-sectors.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-timing-table',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    CircuitMapComponent,
    DriverRadiosComponent,
    DriverSectorsComponent,
    TranslateModule
  ],
  templateUrl: './timing-table.component.html',
  styleUrls: ['./timing-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimingTableComponent implements OnInit, OnDestroy {
  public timingData: DriverTiming[] = [];
  public displayedColumns: string[] = [
    'position',
    'driverCode',
    'tyre',
    'lapNumber',
    'lastLapTime',
    'gapToLeader',
    'gapToAhead',
    'sectors'
  ];

  public circuitKey: string | number = '';
  public year: number = 2025;
  public sessionPath: string = '';
  public isConnected: boolean = false;

  private subscription?: Subscription;

  constructor(
    private streamService: F1LiveTimingStreamService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('[Timing Table] Initializing component');

    // Conectar al stream de F1
    this.streamService.connect();
    this.isConnected = true;

    // Suscribirse a las actualizaciones de timing
    this.subscription = this.streamService.state$.subscribe((state) => {
      console.log('[Timing Table] State updated:', state);

      this.timingData = this.streamService.getDriversTiming();
      console.log('[Timing Table] Timing data:', this.timingData);

      // Obtener información de sesión si está disponible
      if (state.SessionInfo) {
        this.updateSessionInfo(state.SessionInfo);
      }

      // ⚠️ IMPORTANTE: Marcar para detección de cambios SIEMPRE
      this.cdr.markForCheck();
    });
  }


  ngOnDestroy(): void {
    // Desconectar y limpiar
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.streamService.disconnect();
    this.isConnected = false;
  }

  private updateSessionInfo(sessionInfo: any): void {
    // Actualizar información de sesión si es necesaria
    // Puedes extraer datos como circuito, año, etc.
    if (sessionInfo.Meeting) {
      this.circuitKey = sessionInfo.Meeting.Circuit?.Key || '';
    }
  }

  getRowClass(driver: DriverTiming): string {
    if (driver.isPit) return 'row-pit';

    switch (driver.statusColor) {
      case 'session-best':
        return 'row-session-best';
      case 'personal-best':
        return 'row-personal-best';
      default:
        return '';
    }
  }

  getTyreClass(compound: string): string {
    const compoundLower = compound.toLowerCase();
    return `tyre-${compoundLower}`;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }
  // Reemplaza el método actual por este
  getDriverSectorsData(position: string): any {
    const state = this.streamService.getCurrentState();
    const lines = state.TimingData?.Lines;

    if (!lines) return undefined;

    // Buscar el piloto por posición
    const driverEntry = Object.entries(lines).find(
      ([_, line]: [string, any]) => line.Position === position
    );

    if (!driverEntry) return undefined;

    return driverEntry[1].Sectors;
  }

}
