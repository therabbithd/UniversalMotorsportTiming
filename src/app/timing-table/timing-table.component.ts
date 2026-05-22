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
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { TyreClassPipe } from '../pipes/tyre-class.pipe';
import { TyreLetterPipe } from '../pipes/tyre-letter.pipe';
import { TrackFlagDisplay } from '../constants/flag-colors.constants';

/**
 * Componente principal para mostrar la tabla de tiempos en directo (Live Timing).
 * 
 * Se conecta al servicio `F1LiveTimingStreamService` para recibir actualizaciones 
 * en tiempo real. Incluye subcomponentes como el mapa del circuito, radios de los 
 * pilotos y los sectores.
 */
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
    DriverSectorsComponent,
    TranslateModule,
    TyreClassPipe,
    TyreLetterPipe
  ],
  templateUrl: './timing-table.component.html',
  styleUrls: ['./timing-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimingTableComponent implements OnInit, OnDestroy {
  /** Array of driver timing information for the current session */
  public timingData: DriverTiming[] = [];
  /** Column definitions for the Material Table */
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

  /** The unique key identifying the current circuit */
  public circuitKey: string | number = '';
  /** The championship year */
  public year: number = 2025;
  /** Current session path identifier for the stream */
  public sessionPath: string = '';
  /** Indicates if the WebSocket connection is active */
  public isConnected: boolean = false;
  /** Code of the user's favorite driver for UI highlighting */
  public favoriteDriverCode: string | null = null;
  /** Current race track flag indicator (green, yellow, red, etc.) */
  public trackFlag: TrackFlagDisplay | null = null;

  /** @ignore */
  private subscription?: Subscription;

  /** @ignore */
  constructor(
    private streamService: F1LiveTimingStreamService,
    private profileService: ProfileService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Inicializa el componente y se suscribe al flujo de datos en directo.
   * También verifica si el usuario está autenticado para resaltar a su piloto favorito.
   */
  ngOnInit(): void {
    console.log('[Timing Table] Initializing component');

    // Conectar al stream de F1
    this.streamService.connect();
    this.isConnected = true;

    // Obtener piloto favorito si el usuario está autenticado
    if (this.authService.isLoggedIn()) {
      this.profileService.getProfile().subscribe({
        next: (profile) => {
          this.favoriteDriverCode = profile.favoritos || null;
          this.cdr.markForCheck();
        },
        error: () => {
          console.warn('[Timing Table] Could not fetch profile for favorite driver highlighting');
        }
      });
    }

    // Suscribirse a las actualizaciones de timing
    this.subscription = this.streamService.state$.subscribe((state) => {
      console.log('[Timing Table] State updated:', state);

      this.timingData = this.streamService.getDriversTiming();
      this.trackFlag = this.streamService.getTrackFlagDisplay();
      console.log('[Timing Table] Timing data:', this.timingData);

      // Obtener información de sesión si está disponible
      if (state.SessionInfo) {
        this.updateSessionInfo(state.SessionInfo);
      }

      // ⚠️ IMPORTANTE: Marcar para detección de cambios SIEMPRE
      this.cdr.markForCheck();
    });
  }


  /**
   * Finaliza el componente, cancelando la suscripción al stream y desconectando
   * del WebSocket para liberar recursos.
   */
  ngOnDestroy(): void {
    // Desconectar y limpiar
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.streamService.disconnect();
    this.isConnected = false;
  }

  /**
   * Actualiza la información interna de la sesión (como la clave del circuito)
   * basándose en los metadatos recibidos del objeto SessionInfo.
   * 
   * @param sessionInfo El objeto de información de sesión proveniente del stream.
   */
  private updateSessionInfo(sessionInfo: any): void {
    // Actualizar información de sesión si es necesaria
    // Puedes extraer datos como circuito, año, etc.
    if (sessionInfo.Meeting) {
      this.circuitKey = sessionInfo.Meeting.Circuit?.Key || '';
    }
  }

  /**
   * Aplica clases CSS a las filas de la tabla de tiempos según el estado del piloto (box, vuelta rápida, favorito).
   * 
   * @param driver Objeto con los datos de tiempo de un piloto.
   * @returns Un string con las clases CSS calculadas (ej: `row-pit row-session-best`).
   */
  getRowClass(driver: DriverTiming): string {
    let classes = '';

    if (driver.isPit) classes += 'row-pit ';

    if (this.favoriteDriverCode && driver.driverCode === this.favoriteDriverCode) {
      classes += 'row-favorite ';
    }

    switch (driver.statusColor) {
      case 'session-best':
        classes += 'row-session-best';
        break;
      case 'personal-best':
        classes += 'row-personal-best';
        break;
    }

    return classes.trim();
  }

  /**
   * Función auxiliar para usar en el template HTML y comprobar si un valor es un array.
   * 
   * @param value Cualquier tipo de dato.
   * @returns `true` si el valor es un array, `false` en caso contrario.
   */
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * Obtiene los datos detallados de los sectores para un piloto específico basándose en su posición.
   * 
   * @param position La posición en pista del piloto (como string).
   * @returns Los sectores registrados (`Sectors`) u `undefined` si no se encuentran.
   */
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
