import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DriverTiming, DriverInfo, TyreStint, TeamRadioCapture, TeamRadioState, TrackStatus } from '../models/f1-livetiming.model';
import { resolveTrackFlagDisplay } from '../utils/flag-gradient.util';
import { TrackFlagDisplay } from '../constants/flag-colors.constants';

/**
 * Represents the complete live timing state of the F1 session.
 */
interface LiveTimingState {
  /** Core timing data for all drivers */
  TimingData?: {
    /** Map of driver timing lines by driver number */
    Lines?: {
      [driverNumber: string]: {
        /** Current track position */
        Position?: string;
        /** Racing number of the driver */
        RacingNumber?: string;
        /** General sorting line/position */
        Line?: number;
        /** Indicates if the driver retired */
        Retired?: boolean;
        /** Indicates if the driver is in the pits */
        InPit?: boolean;
        /** Indicates if the driver just exited the pits */
        PitOut?: boolean;
        /** Indicates if the car is stopped on track */
        Stopped?: boolean;
        /** General status code for the driver */
        Status?: number;
        /** Details of the driver's last completed lap */
        LastLapTime?: {
          /** Last lap time string */
          Value?: string;
          /** Indicates if it's the driver's personal fastest lap */
          PersonalFastest?: boolean;
          /** Indicates if it's the overall fastest lap in the session */
          OverallFastest?: boolean;
        };
        /** Details of the driver's best lap */
        BestLapTime?: {
          /** Best lap time string */
          Value?: string;
        };
        /** Total number of laps completed */
        NumberOfLaps?: number;
        /** Current time gap to the leader */
        GapToLeader?: string;
        /** Time gap to the car directly ahead */
        IntervalToPositionAhead?: {
          /** Interval value */
          Value?: string;
        };
        /** Sector times and data */
        Sectors?: Array<{
          /** Array of segments within the sector */
          Segments?: Array<{ Status?: number }> | { [key: string]: { Status?: number } };
          /** Sector time value */
          Value?: string;
        }> | {
          [key: string]: {
            /** Map of segments within the sector */
            Segments?: Array<{ Status?: number }> | { [key: string]: { Status?: number } };
            /** Sector time value */
            Value?: string;
          }
        };
        /** Sector times for the best lap */
        BestLapSectors?: any;
        /** Supplementary statistics */
        Stats?: {
          [key: string]: {
            /** Time difference to the car ahead */
            TimeDifftoPositionAhead?: string;
            /** Time difference to the fastest car */
            TimeDiffToFastest?: string;
          };
        };
      };
    };
  };

  /** Detailed list of driver metadata */
  DriverList?: {
    [driverNumber: string]: {
      /** Driver's racing number */
      RacingNumber?: string;
      /** Broadcast name */
      BroadcastName?: string;
      /** Driver's full name */
      FullName?: string;
      /** Driver's three-letter abbreviation */
      Tla?: string;
      /** Position line identifier */
      Line?: number;
      /** Name of the driver's team */
      TeamName?: string;
      /** HTML color code of the team */
      TeamColour?: string;
      /** Driver's first name */
      FirstName?: string;
      /** Driver's last name */
      LastName?: string;
      /** Driver's reference code */
      Reference?: string;
      /** URL to the driver's headshot */
      HeadshotUrl?: string;
    };
  };

  /** Supplementary app data, mostly tyre stints */
  TimingAppData?: {
    /** Map of app data lines by driver */
    Lines?: {
      [driverNumber: string]: {
        /** Array of tyre stints used by the driver */
        Stints?: TyreStint[];
      };
    };
  };

  /** Real-time track position telemetry data */
  Position?: {
    [driverNumber: string]: {
      /** X coordinate on track */
      X?: number;
      /** Y coordinate on track */
      Y?: number;
      /** Z coordinate (elevation) */
      Z?: number;
    };
  };

  /** Raw car telemetry data streams */
  CarData?: any;
  /** Primary session metadata */
  SessionInfo?: any;
  /** Additional session data and events */
  SessionData?: any;
  /** Overall track status codes (Flags, Safety Car, etc) */
  TrackStatus?: TrackStatus;
  /** Current weather parameters */
  WeatherData?: any;
  /** Messages from Race Control */
  RaceControlMessages?: any;
  /** Broadcasted team radio captures */
  TeamRadio?: TeamRadioState | any;
  /** Extrapolated session clock */
  ExtrapolatedClock?: any;
  /** Current lap count summary */
  LapCount?: any;
  /** Keepalive and connection status markers */
  Heartbeat?: any;
}

/**
 * Servicio encargado de gestionar la conexión WebSocket al stream de telemetría de Fórmula 1 en directo.
 * 
 * Se conecta a un proxy (Railway Broker o local) que a su vez consume el SignalR oficial de F1.
 * Mantiene un estado reactivo global (`liveState`) del cual el resto de componentes pueden 
 * suscribirse u obtener datos puntuales.
 */
@Injectable({
  providedIn: 'root'
})
export class F1LiveTimingStreamService {

  /** Identificador del Hub de SignalR para el stream de F1. */
  private readonly SIGNALR_HUB = 'Streaming';
  /** Tiempo de espera en milisegundos antes de intentar una reconexión tras un fallo. */
  private readonly RETRY_FREQ = 10000;

  /** Instancia activa del WebSocket. */
  private ws: WebSocket | null = null;
  /** Sujeto de comportamiento que mantiene el último estado conocido del stream. */
  private liveState = new BehaviorSubject<LiveTimingState>({});
  /** Contador acumulativo de mensajes recibidos durante la sesión actual. */
  private messageCount = 0;
  /** Referencia al temporizador de reconexión. */
  private reconnectTimeout: any;

  /** Observable público que emite el estado completo de telemetría a los suscriptores. */
  public state$: Observable<LiveTimingState> = this.liveState.asObservable();

  /**
   * Crea una instancia de F1LiveTimingStreamService.
   */
  constructor() { }

  /**
   * Inicia la conexión WebSocket con el servidor proxy.
   * Dependiendo del entorno (desarrollo local o producción), elige la URL adecuada.
   */
  async connect(): Promise<void> {
    console.log('[F1 Stream] Attempting to connect to Railway Broker...');

    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let wsUrl: string;

    if (isLocalDev) {
      wsUrl = 'ws://localhost:3001';
    } else {
      wsUrl = 'wss://f1-websocket-proxy-production-9991.up.railway.app';
    }

    this.setupWebSocket(wsUrl);
  }

  /**
   * Configura los eventos del WebSocket para manejar la apertura, recepción de mensajes,
   * errores y cierre de la conexión.
   * 
   * @param wsUrl URL completa del WebSocket al que conectarse.
   */
  private setupWebSocket(wsUrl: string): void {
    console.log('[F1 Stream] Connecting to:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[F1 Stream] Connected to Railway Broker');
      this.resetState();
    };

    this.ws.onmessage = (event) => {
      this.updateState(event.data);
    };

    this.ws.onerror = (error) => {
      console.error('[F1 Stream] WebSocket error:', error);
      this.ws?.close();
    };

    this.ws.onclose = () => {
      console.log('[F1 Stream] WebSocket closed');
      this.scheduleReconnect();
    };
  }

  /**
   * Procesa un mensaje crudo recibido del WebSocket, parsea el JSON y actualiza
   * el estado interno realizando un merge profundo.
   * 
   * @param data String JSON con las actualizaciones de telemetría.
   */
  private updateState(data: string): void {
    try {
      const updates = JSON.parse(data);

      if (!updates || (Array.isArray(updates) && updates.length === 0)) return;

      const currentState = this.liveState.value;
      let newState = { ...currentState };

      if (Array.isArray(updates)) {
        // Multi-message update
        for (const update of updates) {
          newState = this.deepObjectMerge(newState, update);
          this.captureBestSectors(newState, update);
        }
      } else {
        // Single message update (or full state)
        newState = this.deepObjectMerge(newState, updates);
        this.captureBestSectors(newState, updates);
      }

      this.liveState.next(newState);
      if (newState.Position) {
        console.warn('[F1 Service] State has Position data:', Object.keys(newState.Position).length, 'drivers');
      } else {
        // console.log('[F1 Service] State updated, but no Position keys.');
      }
      this.messageCount++;
    } catch (e) {
      console.error(`[F1 Stream] Could not update data: ${e}`);
    }
  }

  /**
   * Captures and caches the sectors of the driver's best lap when they set a new personal fastest lap.
   * This provides the data for the best lap microsectors column.
   */
  private captureBestSectors(state: any, update: any) {
    if (update.TimingData?.Lines) {
      for (const driverNumber in update.TimingData.Lines) {
        const lineUpdate = update.TimingData.Lines[driverNumber];
        
        // If the update indicates this lap was the driver's personal fastest
        if (lineUpdate.LastLapTime?.PersonalFastest || lineUpdate.LastLapTime?.OverallFastest) {
          if (state.TimingData?.Lines?.[driverNumber]) {
            // Save a deep copy of the current sectors (which correspond to this just-completed best lap)
            const currentSectors = state.TimingData.Lines[driverNumber].Sectors;
            if (currentSectors) {
              state.TimingData.Lines[driverNumber].BestLapSectors = JSON.parse(JSON.stringify(currentSectors));
            }
          }
        }
      }
    }
  }

  /**
   * Realiza una fusión recursiva de dos objetos, priorizando los valores del objeto `modifier`.
   * Sirve para aplicar parches de estado recibidos del stream de F1 sin perder datos previos.
   * 
   * @param original Objeto base sobre el que aplicar los cambios.
   * @param modifier Objeto que contiene las claves y valores nuevos o actualizados.
   * @returns Un nuevo objeto con los datos fusionados.
   */
  private deepObjectMerge(original: any = {}, modifier: any): any {
    if (!modifier) return original;

    const copy: any = { ...original };

    for (const [key, value] of Object.entries(modifier)) {
      const valueIsObject =
        typeof value === 'object' && !Array.isArray(value) && value !== null;

      if (valueIsObject && Object.keys(value as any).length) {
        copy[key] = this.deepObjectMerge(copy[key], value);
      } else {
        copy[key] = value;
      }
    }

    return copy;
  }

  // ===== Datos tipados =====

  /**
   * Recupera la lista de información básica de todos los pilotos participantes.
   * 
   * @returns Un array de `DriverInfo` con datos como el nombre, número, color de equipo y foto.
   */
  getDriversInfo(): DriverInfo[] {
    const state: any = this.liveState.value;
    if (!state.DriverList) return [];

    return Object.values(state.DriverList).map((driver: any) => ({
      RacingNumber: driver.RacingNumber || '',
      BroadcastName: driver.BroadcastName || '',
      FullName: driver.FullName || '',
      Tla: driver.Tla || '',
      Line: driver.Line || 0,
      TeamName: driver.TeamName || '',
      TeamColour: driver.TeamColour || '',
      FirstName: driver.FirstName || '',
      LastName: driver.LastName || '',
      Reference: driver.Reference || '',
      HeadshotUrl: driver.HeadshotUrl || ''
    }));
  }

  /**
   * Obtiene y formatea los datos de telemetría más recientes de cada piloto para la tabla de tiempos.
   * 
   * Combina información de `TimingData.Lines`, `DriverList` y `TimingAppData` para generar
   * la vista consolidada de posiciones, tiempos, intervalos y uso de neumáticos.
   * 
   * @returns Un array de `DriverTiming` ordenado por la posición actual en carrera/sesión.
   */
  getDriversTiming(): DriverTiming[] {
    const state: any = this.liveState.value;

    if (!state.TimingData?.Lines || !state.DriverList) return [];

    const timingLines = state.TimingData.Lines;
    const driverList = state.DriverList;
    const tyreData = state.TimingAppData?.Lines || {};

    return Object.entries(timingLines).map(([driverNumber, timing]: any) => {
      const driverInfo = driverList[driverNumber];
      const tyreInfo = tyreData[driverNumber];

      return {
        position: timing.Position || timing.Line,
        driverCode: driverInfo?.Tla || '',
        driverName: driverInfo?.LastName || driverInfo?.BroadcastName || '',
        lapNumber: timing.NumberOfLaps || 0,
        lastLapTime: timing.LastLapTime?.Value || '--',
        bestLapTime: timing.BestLapTime?.Value || '--',
        gapToLeader: timing.GapToLeader || (timing.Position === '1' ? '--' : ''),
        gapToAhead: timing.IntervalToPositionAhead?.Value || 'Gap',
        isPit: timing.InPit || timing.PitOut || false,
        statusColor: this.getStatusColor(timing),
        teamName: driverInfo?.TeamName,
        teamColor: driverInfo?.TeamColour ? `#${driverInfo.TeamColour}` : undefined,
        tyreHistory: tyreInfo?.Stints || []
      };
    }).sort((a, b) => {
      const posA = this.parsePosition(a.position);
      const posB = this.parsePosition(b.position);
      return posA - posB;
    });
  }

  /**
   * Convierte un valor de posición (que puede ser string o number) a un número entero.
   * 
   * @param position El valor de posición extraído del stream.
   * @returns Representación numérica de la posición, o 999 si no es válida.
   */
  private parsePosition(position: any): number {
    if (typeof position === 'number') return position;
    if (typeof position === 'string') return parseInt(position, 10) || 999;
    return 999;
  }

  /**
   * Determina el color o estado visual de la vuelta de un piloto basándose en si es
   * récord de sesión, récord personal o una vuelta normal.
   * 
   * @param timing Datos de tiempo filtrados de un piloto.
   * @returns Un identificador de estado: 'session-best', 'personal-best', 'normal' o 'none'.
   */
  private getStatusColor(
    timing: any
  ): 'personal-best' | 'session-best' | 'normal' | 'none' {
    if (timing.LastLapTime?.OverallFastest) return 'session-best';
    if (timing.LastLapTime?.PersonalFastest) return 'personal-best';
    if (timing.LastLapTime?.Value) return 'normal';
    return 'none';
  }

  /**
   * Devuelve el último snapshot completo del estado de telemetría sin necesidad de suscripción.
   * 
   * @returns El objeto `LiveTimingState` actual.
   */
  getCurrentState(): LiveTimingState {
    return this.liveState.value;
  }

  /**
   * Returns the current track flag display (color + label) from TrackStatus.
   */
  getTrackFlagDisplay(): TrackFlagDisplay | null {
    const trackStatus = this.liveState.value.TrackStatus;
    if (!trackStatus?.Status && !trackStatus?.Message) return null;
    return resolveTrackFlagDisplay(trackStatus.Status, trackStatus.Message);
  }

  /**
   * Limpia el estado interno y reinicia los contadores. Se usa al abrir una nueva conexión.
   */
  private resetState(): void {
    this.liveState.next({});
    this.messageCount = 0;
  }

  /**
   * Programa un intento de reconexión tras el intervalo de tiempo definido en `RETRY_FREQ`.
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.RETRY_FREQ);
  }

  /**
   * Cierra de forma limpia la conexión WebSocket y anula cualquier intento de reconexión pendiente.
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // ===== TeamRadio desde el WebSocket usando el modelo =====

  /**
   * Extrae el historial de mensajes de radio del equipo recibidos a través del stream.
   * 
   * @returns Un array de `TeamRadioCapture` ordenado del más reciente al más antiguo.
   */
  getTeamRadioCaptures(): TeamRadioCapture[] {
    const state: LiveTimingState = this.liveState.value;

    if (!state.TeamRadio || !Array.isArray((state.TeamRadio as TeamRadioState).Captures)) {
      return [];
    }

    const captures = (state.TeamRadio as TeamRadioState).Captures as TeamRadioCapture[];

    return captures
      .filter(c => !!c.RacingNumber && !!c.Path)
      .sort(
        (a, b) =>
          new Date(b.Utc).getTime() - new Date(a.Utc).getTime()
      );
  }

  /**
   * Agrupa los mensajes de radio para obtener únicamente la captura más reciente por cada piloto.
   * 
   * @returns Un `Map` donde la key es el número del coche y el valor su última `TeamRadioCapture`.
   */
  getLatestRadioByDriver(): Map<string, TeamRadioCapture> {
    const captures = this.getTeamRadioCaptures();
    const latestByDriver = new Map<string, TeamRadioCapture>();

    for (const capture of captures) {
      if (!latestByDriver.has(capture.RacingNumber)) {
        latestByDriver.set(capture.RacingNumber, capture);
      }
    }

    return latestByDriver;
  }

  /**
   * Construye la URL base para el API de F1 basándose en el protocolo y host actuales.
   * Utilizado principalmente para redirigir peticiones de assets al proxy local o remoto.
   * 
   * @returns URL base (ej: `http://localhost:4200/f1-api`).
   */
  getWebSocketBaseUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.host; // localhost:4200 en dev

    return `${protocol}//${host}/f1-api`;
  }
  // Base del evento para construir URLs de assets (TeamRadio, etc.)

  /**
   * Obtiene la ruta base del evento actual en el servidor de estáticos de F1.
   * Se utiliza para construir URLs directas a activos como imágenes o audios 
   * utilizando el `SessionInfo.Path` del estado.
   * 
   * @returns La URL base completa (ej: `https://livetiming.formula1.com/static/2025/...`).
   */
  getEventPath(): string {
    const state: any = this.liveState.value;
    // En tu server.js usas SessionInfo.Path como base
    // ej: "2025/2025-12-07_Abu_Dhabi_Grand_Prix/2025-12-07_Race/"
    const sessionPath: string | undefined = state.SessionInfo?.Path;
    if (!sessionPath) return '';

    const clean = sessionPath.replace(/\/$/, ''); // quita "/" final
    return `https://livetiming.formula1.com/static/${clean}`;
  }
}