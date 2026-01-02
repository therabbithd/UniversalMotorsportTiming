import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DriverTiming, DriverInfo, TyreStint, TeamRadioCapture, TeamRadioState } from '../models/f1-livetiming.model';

interface LiveTimingState {

  TimingData?: {
    Lines?: {
      [driverNumber: string]: {
        Position?: string;
        RacingNumber?: string;
        Line?: number;
        Retired?: boolean;
        InPit?: boolean;
        PitOut?: boolean;
        Stopped?: boolean;
        Status?: number;
        LastLapTime?: {
          Value?: string;
          PersonalFastest?: boolean;
          OverallFastest?: boolean;
        };
        BestLapTime?: {
          Value?: string;
        };
        NumberOfLaps?: number;
        GapToLeader?: string;
        IntervalToPositionAhead?: {
          Value?: string;
        };
        Sectors?: Array<{
          Segments?: Array<{ Status?: number }> | { [key: string]: { Status?: number } };
          Value?: string;
        }> | {
          [key: string]: {
            Segments?: Array<{ Status?: number }> | { [key: string]: { Status?: number } };
            Value?: string;
          }
        };
        Stats?: {
          [key: string]: {
            TimeDifftoPositionAhead?: string;
            TimeDiffToFastest?: string;
          };
        };
      };
    };
  };


  DriverList?: {
    [driverNumber: string]: {
      RacingNumber?: string;
      BroadcastName?: string;
      FullName?: string;
      Tla?: string;
      Line?: number;
      TeamName?: string;
      TeamColour?: string;
      FirstName?: string;
      LastName?: string;
      Reference?: string;
      HeadshotUrl?: string;
    };
  };

  TimingAppData?: {
    Lines?: {
      [driverNumber: string]: {
        Stints?: TyreStint[];
      };
    };
  };

  Position?: {
    Position?: {
      [driverNumber: string]: {
        X?: number;
        Y?: number;
        Z?: number;
      };
    };
  };

  CarData?: any;
  SessionInfo?: any;
  SessionData?: any;
  TrackStatus?: any;
  WeatherData?: any;
  RaceControlMessages?: any;
  TeamRadio?: TeamRadioState | any;
  ExtrapolatedClock?: any;
  LapCount?: any;
  Heartbeat?: any;
}

@Injectable({
  providedIn: 'root'
})
export class F1LiveTimingStreamService {

  private readonly SIGNALR_HUB = 'Streaming';
  private readonly RETRY_FREQ = 10000;

  private ws: WebSocket | null = null;
  private liveState = new BehaviorSubject<LiveTimingState>({});
  private messageCount = 0;
  private reconnectTimeout: any;

  // Observables públicos
  public state$: Observable<LiveTimingState> = this.liveState.asObservable();

  constructor() { }

  async connect(): Promise<void> {
    console.log('[F1 Stream] Attempting to connect to Railway Broker...');

    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let wsUrl: string;

    if (isLocalDev) {
      wsUrl = 'ws://localhost:3001';
    } else {
      wsUrl = 'wss://f1-websocket-proxy-production.up.railway.app';
    }

    this.setupWebSocket(wsUrl);
  }

  // Fallback: Direct SignalR/WebSocket connection (Original Logic)

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
        }
      } else {
        // Single message update (or full state)
        newState = this.deepObjectMerge(newState, updates);
      }

      this.liveState.next(newState);
      this.messageCount++;
    } catch (e) {
      console.error(`[F1 Stream] Could not update data: ${e}`);
    }
  }


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

  private parsePosition(position: any): number {
    if (typeof position === 'number') return position;
    if (typeof position === 'string') return parseInt(position, 10) || 999;
    return 999;
  }

  private getStatusColor(
    timing: any
  ): 'personal-best' | 'session-best' | 'normal' | 'none' {
    if (timing.LastLapTime?.OverallFastest) return 'session-best';
    if (timing.LastLapTime?.PersonalFastest) return 'personal-best';
    if (timing.LastLapTime?.Value) return 'normal';
    return 'none';
  }

  getCurrentState(): LiveTimingState {
    return this.liveState.value;
  }

  private resetState(): void {
    this.liveState.next({});
    this.messageCount = 0;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.RETRY_FREQ);
  }

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
   * Base para construir URLs de audio e imágenes:
   * si el WebSocket se conecta a ws(s)://<host>/f1-api/signalr/...
   * la base HTTP será http(s)://<host>/f1-api
   */
  getWebSocketBaseUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.host; // localhost:4200 en dev

    return `${protocol}//${host}/f1-api`;
  }
  // Base del evento para construir URLs de assets (TeamRadio, etc.)

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