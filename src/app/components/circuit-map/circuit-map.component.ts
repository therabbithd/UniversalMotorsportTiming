// circuit-map.component.ts

import { Component, Input, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of, Subscription } from 'rxjs';
import { F1LiveTimingStreamService } from '../../services/f1-livetiming.service';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Interface representing the calculated position of a driver on the track map.
 */
interface DriverPosition {
  /** Driver's racing number */
  racingNumber: string;
  /** Calculated X position on the SVG */
  x: number;
  /** Calculated Y position on the SVG */
  y: number;
  /** Z coordinate / progress on the track */
  z: number;
  /** Driver team's hex color */
  teamColor: string;
  /** Driver code (e.g., VER, HAM) */
  driverCode: string;
  /** Indicates whether the driver is currently tracked as on track */
  onTrack: boolean;
}

/**
 * Componente que representa el mapa del circuito interactivo en tiempo real.
 * 
 * Se encarga de descargar el archivo SVG/Data del trazado del circuito y posicionar
 * a los pilotos sobre él según sus coordenadas XYZ emitidas por el telemetry stream.
 */
@Component({
  selector: 'app-circuit-map',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './circuit-map.component.html',
  styleUrls: ['./circuit-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircuitMapComponent implements OnChanges, OnDestroy {
  /** The unique key for the circuit to load */
  @Input() circuitKey: number | string | undefined;
  /** The championship year */
  @Input() year: number | string | undefined;

  /** Track mathematical data retrieved from Multiviewer API */
  trackData: any = null;
  /** Indicates if map data is being fetched */
  isLoading = false;
  /** Contains error message if loading map data fails */
  error: string | null = null;
  /** RxJS subscription reference for Live Timing updates */
  streamSubscription: Subscription | null = null;

  // Track rendering
  /** The SVG path definition for rendering the track shape */
  circuitPath: string = '';
  /** ViewBox definition to auto-scale the SVG */
  viewBox: string = "-1000 -1000 2000 2000";

  // Rotation state
  /** Standard rotation degree applied to the track points */
  rotation: number = 0;

  // Drivers
  /** Array of active processed drivers to render on the SVG */
  processedDrivers: DriverPosition[] = [];
  /** X,Y Coordinates identifying the start/finish line */
  startLinePos: { x: number, y: number } | null = null;
  /** Array of track point coordinates used for internal interpolation */
  trackPoints: { x: number, y: number }[] = [];
  /** Total computed length of the track geometry */
  totalTrackLength: number = 0;

  /**
   * Initializes the CircuitMapComponent.
   * @param http HttpClient instance
   * @param streamService F1LiveTimingStreamService instance
   * @param cdr ChangeDetectorRef instance
   */
  constructor(
    private http: HttpClient,
    private streamService: F1LiveTimingStreamService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Detecta cambios en las propiedades de entrada (@Input) para recargar el mapa
   * cuando cambian el circuito o el año.
   * 
   * @param changes Objeto con los cambios detectados por Angular.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['circuitKey'] || changes['year']) {
      this.loadMap();
    }
  }

  /**
   * Limpia la suscripción al stream de telemetría al destruir el componente.
   */
  ngOnDestroy(): void {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
  }

  /**
   * Carga los datos matemáticos y de trazado del circuito desde una API externa,
   * permitiendo generar el Path SVG sobre el que se situarán los pilotos.
   */
  loadMap() {
    if (!this.circuitKey || !this.year) return;

    this.isLoading = true;
    this.error = null;

    const url = `https://api.multiviewer.app/api/v1/circuits/${this.circuitKey}/${this.year}`;

    this.http.get(url).pipe(
      catchError(err => {
        console.error('Error loading circuit map:', err);
        this.error = 'Could not load track map.';
        this.isLoading = false;
        this.cdr.markForCheck();
        return of(null);
      })
    ).subscribe((data: any) => {
      this.isLoading = false;
      if (data) {
        this.trackData = data;
        this.rotation = data.rotation || 0;
        this.generateCircuitPath();
        this.subscribeToPositions();
      }
      this.cdr.markForCheck();
    });
  }

  /**
   * Generates the SVG path for the loaded circuit using coordinate arrays.
   */
  generateCircuitPath() {
    if (!this.trackData || !this.trackData.x || !this.trackData.y) return;

    const xArr = this.trackData.x;
    const yArr = this.trackData.y;

    // First transform all points
    const transformedPoints = this.transformPoints(xArr, yArr);
    this.trackPoints = transformedPoints;

    if (transformedPoints.length === 0) return;

    // Calculate total track length for interpolation
    this.totalTrackLength = 0;
    for (let i = 0; i < transformedPoints.length; i++) {
      const p1 = transformedPoints[i];
      const p2 = transformedPoints[(i + 1) % transformedPoints.length];
      this.totalTrackLength += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    // Generate SVG path string "M x1,y1 L x2,y2 ..."
    let path = `M ${transformedPoints[0].x},${transformedPoints[0].y}`;
    for (let i = 1; i < transformedPoints.length; i++) {
      path += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
    }
    path += ' Z'; // Close the path

    this.circuitPath = path;

    // Store start line position (first point of the track)
    this.startLinePos = transformedPoints[0] || null;

    // Update ViewBox to fit the track
    this.updateViewBox(transformedPoints);

    // DEBUG: Track data range
    const minX = Math.min(...transformedPoints.map(p => p.x));
    const maxX = Math.max(...transformedPoints.map(p => p.x));
    const minY = Math.min(...transformedPoints.map(p => p.y));
    const maxY = Math.max(...transformedPoints.map(p => p.y));
    console.log(`[Circuit Map] Track Range: X[${minX.toFixed(0)}, ${maxX.toFixed(0)}], Y[${minY.toFixed(0)}, ${maxY.toFixed(0)}], Total Length: ${this.totalTrackLength.toFixed(0)}`);
  }

  /**
   * Recalculates the SVG viewBox dimensional bounds to center the track.
   * @param points Array of calculated point coordinates for the track shape
   */
  updateViewBox(points: { x: number, y: number }[]) {
    if (points.length === 0) return;

    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (const p of points) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    const width = maxX - minX;
    const height = maxY - minY;

    // Add 10% padding
    const paddingX = width * 0.1;
    const paddingY = height * 0.1;

    this.viewBox = `${minX - paddingX} ${minY - paddingY} ${width + paddingX * 2} ${height + paddingY * 2}`;
  }

  /**
   * Subscribes to the live timing internal state feed to receive coordinate updates.
   */
  subscribeToPositions() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }

    this.streamSubscription = this.streamService.state$.subscribe(() => {
      this.updateDriverPositions();
    });
  }

  /**
   * Actualiza las posiciones (X, Y) calculadas para los pilotos basándose en los 
   * datos telemétricos recuperados del servicio de Timing.
   */
  updateDriverPositions() {
    const state = this.streamService.getCurrentState();
    if (!state.DriverList) {
      return;
    }

    // After interface simplification, Position is the driver map
    console.warn('[Circuit Map] State Keys:', Object.keys(state));
    const positionData = state.Position || {};
    const driverList = state.DriverList;
    const timingData = state.TimingData?.Lines || {};

    if (Object.keys(positionData).length > 0) {
      console.warn(`[Circuit Map] OK: Data for ${Object.keys(positionData).length} drivers`);
      const sampleKey = Object.keys(positionData)[0];
      console.log(`[Circuit Map] Sample Driver ${sampleKey}:`, positionData[sampleKey]);
    } else {
      console.warn('[Circuit Map] Waiting for position data...');
    }

    const newProcessedDrivers: DriverPosition[] = [];

    // Iterate over all drivers
    for (const [driverNumber, driver] of Object.entries(driverList)) {
      if (!driver) continue;

      const posData = positionData[driverNumber];
      let rx = 0;
      let ry = 0;
      let rz = 0;

      if (posData && typeof posData === 'object') {
        const pos = posData as any;
        rz = pos.Z || 0;

        // F1 Z is often altitude. 
        // Heuristic: If Z is much larger than typical altitude (e.g. > 100m) 
        // and doesn't match X or Y, it might be track progress.
        const isZTrackProgress = rz > 500 && rz !== pos.X && rz !== pos.Y;

        if (this.trackPoints.length > 0 && isZTrackProgress) {
          const interpolated = this.getPositionFromZ(rz);
          rx = interpolated.x;
          ry = interpolated.y;
        } else {
          // Fallback to X, Y. 
          // Both raw coords and track data seem to be in decimeters, so no scaling needed.
          [rx, ry] = this.rotate(pos.X, pos.Y, this.rotation);
        }
      } else if (this.startLinePos) {
        rx = this.startLinePos.x;
        ry = this.startLinePos.y;
        rz = 0;
      } else {
        continue;
      }

      const timing = timingData[driverNumber];
      const onTrack = timing ? (!timing.InPit && !timing.Retired && !timing.Stopped) : true;

      newProcessedDrivers.push({
        racingNumber: driver.RacingNumber || driverNumber,
        x: rx,
        y: ry,
        z: rz,
        teamColor: driver.TeamColour ? `#${driver.TeamColour}` : '#ffffff',
        driverCode: driver.Tla || '',
        onTrack: onTrack
      });
    }

    this.processedDrivers = newProcessedDrivers;
    this.cdr.markForCheck();
  }

  /**
   * Calcula una posición X,Y en el SVG interpolando el valor de progreso Z 
   * sobre los puntos conocidos del trazado.
   * 
   * @param z Valor de progreso o distancia recorrida en el circuito.
   * @returns Coordenadas X e Y interpoladas.
   */
  private getPositionFromZ(z: number): { x: number, y: number } {
    // console.log('[Circuit Map] Interpolating Z:', z);
    let normalizedZ = 0;

    // F1 Z is cumulative distance. 
    // We can try to normalize it using the total track length from Multiviewer.
    // However, Multiviewer track points might not be perfectly scaled to meters.
    // Let's assume z is meters and we need a scale factor.

    // For now, let's try assuming z is already the point index progress if it's small,
    // or normalized if it's 0-1.

    if (z > 32767) {
      // Very large Z, might be millimeters?
      normalizedZ = (z / 1000) / (this.totalTrackLength || 5000);
    } else if (z > 1) {
      // Could be meters or 0-32767. 
      // F1 standard for track progress in some feeds is 0-32767.
      // If z is much larger than typical track length (~6000), it's likely 0-32767.
      if (z > 10000) {
        normalizedZ = z / 32767;
      } else {
        // Assume meters
        normalizedZ = z / (this.totalTrackLength || 5000);
      }
    } else {
      normalizedZ = z;
    }

    // Find the point on the track points array
    const pointIndex = normalizedZ * (this.trackPoints.length - 1);
    const index = Math.floor(pointIndex);
    const fraction = pointIndex - index;

    if (index >= this.trackPoints.length - 1) {
      return this.trackPoints[this.trackPoints.length - 1];
    }

    const p1 = this.trackPoints[index];
    const p2 = this.trackPoints[index + 1];

    return {
      x: p1.x + (p2.x - p1.x) * fraction,
      y: p1.y + (p2.y - p1.y) * fraction
    };
  }

  /**
   * Transforma una lista de coordenadas crudas en puntos listos para el SVG, 
   * aplicando las rotaciones necesarias.
   * 
   * @param xArr Array de coordenadas X.
   * @param yArr Array de conordenadas Y.
   * @returns Un array de objetos con las coordenadas X e Y transformadas.
   */
  transformPoints(xArr: number[], yArr: number[]): { x: number, y: number }[] {
    return xArr.map((x, i) => {
      const [rx, ry] = this.rotate(x, yArr[i], this.rotation);
      return { x: rx, y: ry };
    });
  }

  /**
   * Aplica una rotación matemática a un punto 2D basándose en un ángulo dado.
   * Ajusta el eje Y para que coincida con el sistema de coordenadas de F1.
   * 
   * @param x Coordenada X original.
   * @param y Coordenada Y original.
   * @param angle Ángulo de rotación en grados.
   * @returns Una tupla [X, Y] con el punto rotado.
   */
  rotate(x: number, y: number, angle: number): [number, number] {
    const rad = angle * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Formula from the guide: Y inverted for F1 coordinate system
    const newX = x * cos - y * sin;
    const newY = y * cos + x * sin;

    return [newX, newY * -1];
  }
}
