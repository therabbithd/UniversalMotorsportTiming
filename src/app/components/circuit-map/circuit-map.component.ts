// circuit-map.component.ts

import { Component, Input, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of, Subscription } from 'rxjs';
import { F1LiveTimingStreamService } from '../../services/f1-livetiming.service';
import { TranslateModule } from '@ngx-translate/core';
import { TRACK_FLAG_BY_STATUS } from '../../constants/flag-colors.constants';

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
  /** Vertical offset for the label to avoid overlap */
  labelOffsetY: number;
}

/**
 * Interface representing a sector of the track for coloring.
 */
interface TrackSector {
  /** SVG path for this sector */
  path: string;
  /** Current status color */
  color: string;
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
  /** Array of paths for each marshal sector */
  sectorPaths: TrackSector[] = [];
  /** ViewBox definition to auto-scale the SVG */
  viewBox: string = "-1000 -1000 2000 2000";

  // Rotation state
  /** Standard rotation degree applied to the track points */
  rotation: number = 0;
  /** Fix to align with F1 coordinates standard */
  private readonly ROTATION_FIX = 90;

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
        this.rotation = (data.rotation || 0) + this.ROTATION_FIX;
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

    // Generate full SVG path
    let pathStr = `M ${transformedPoints[0].x},${transformedPoints[0].y}`;
    for (let i = 1; i < transformedPoints.length; i++) {
      pathStr += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
    }
    pathStr += ' Z';
    this.circuitPath = pathStr;

    // Generate sector paths
    this.generateSectorPaths(transformedPoints);

    // Store start line position
    this.startLinePos = transformedPoints[0] || null;

    // Update ViewBox
    this.updateViewBox(transformedPoints);
  }

  /**
   * Generates separate SVG paths for each marshal sector based on marshal points.
   */
  private generateSectorPaths(points: { x: number, y: number }[]) {
    if (!this.trackData.marshalSectors || this.trackData.marshalSectors.length === 0) {
      this.sectorPaths = [{ path: this.circuitPath, color: '#444' }];
      return;
    }

    const sectors: TrackSector[] = [];
    const marshalSectors = this.trackData.marshalSectors;

    for (let i = 0; i < marshalSectors.length; i++) {
      const currentMarshal = marshalSectors[i];
      const nextMarshal = marshalSectors[(i + 1) % marshalSectors.length];

      // Find indices in the points array closest to these marshal points
      const startIndex = this.findClosestPointIndex(currentMarshal.x, currentMarshal.y, points);
      const endIndex = this.findClosestPointIndex(nextMarshal.x, nextMarshal.y, points);

      let sectorPoints: { x: number, y: number }[] = [];
      
      if (startIndex <= endIndex) {
        sectorPoints = points.slice(startIndex, endIndex + 1);
      } else {
        // Wrap around the circuit
        sectorPoints = [...points.slice(startIndex), ...points.slice(0, endIndex + 1)];
      }

      if (sectorPoints.length > 1) {
        let path = `M ${sectorPoints[0].x},${sectorPoints[0].y}`;
        for (let j = 1; j < sectorPoints.length; j++) {
          path += ` L ${sectorPoints[j].x},${sectorPoints[j].y}`;
        }
        sectors.push({ path, color: '#444' });
      }
    }

    this.sectorPaths = sectors;
  }

  /**
   * Finds the index of the point closest to a given X,Y coordinate.
   */
  private findClosestPointIndex(x: number, y: number, points: { x: number, y: number }[]): number {
    // Note: Input x,y from marshal sectors are original, need to rotate them to match points
    const [rx, ry] = this.rotate(x, y, this.rotation);
    
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < points.length; i++) {
      const dist = Math.sqrt(Math.pow(points[i].x - rx, 2) + Math.pow(points[i].y - ry, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }
    return closestIndex;
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
      this.updateSectorColors();
    });
  }

  /**
   * Actualiza los colores de los sectores basados en el estado de la pista (banderas).
   */
  private updateSectorColors() {
    const state = this.streamService.getCurrentState();
    const trackStatus = state.TrackStatus?.Status || '1';
    
    // Default color logic
    let globalColor = '#444'; // Standard dark gray
    const statusConfig = TRACK_FLAG_BY_STATUS[trackStatus];
    if (statusConfig) {
      globalColor = statusConfig.background;
    }

    // Special handling for yellow sectors
    const yellowSectors: number[] = [];
    if (state.RaceControlMessages?.Messages) {
      const messages = state.RaceControlMessages.Messages;
      const latestMessage = Object.values(messages).pop() as any;
      if (latestMessage?.Category === 'Flag' && latestMessage?.Flag === 'YELLOW') {
        // This is a simplified logic, real F1 data specifies sectors in the message
        // For now, if there is a recent yellow flag message, we can't easily map it to marshal sectors
        // without complex parsing. We'll use global status for now.
      }
    }

    this.sectorPaths = this.sectorPaths.map(sector => ({
      ...sector,
      color: globalColor
    }));
  }

  /**
   * Actualiza las posiciones (X, Y) calculadas para los pilotos basándose en los 
   * datos telemétricos recuperados del servicio de Timing.
   * 
   * Sigue la lógica de interpolación por mini-segmentos documentada en mapa.md
   */
  updateDriverPositions() {
    const state = this.streamService.getCurrentState();
    if (!state.DriverList) {
      return;
    }

    const driverList = state.DriverList;
    const timingData = state.TimingData?.Lines || {};
    const positionData = state.Position || {}; // Fallback GPS data

    const newProcessedDrivers: DriverPosition[] = [];

    // Iterate over all drivers
    for (const [driverNumber, driver] of Object.entries(driverList)) {
      if (!driver) continue;

      const timing = timingData[driverNumber];
      let rx = 0;
      let ry = 0;
      let rz = 0;
      let onTrack = true;

      // Method 1: Synthetic position from mini-segments (Preferred per mapa.md)
      if (timing && timing.Sectors && this.trackPoints.length > 0) {
        const pos = this.getDriverPositionFromSegments(timing);
        rx = pos.x;
        ry = pos.y;
        onTrack = !timing.InPit && !timing.Retired && !timing.Stopped;
      } 
      // Method 2: Fallback to raw Position.z (GPS)
      else if (positionData[driverNumber]) {
        const pos = positionData[driverNumber] as any;
        [rx, ry] = this.rotate(pos.X, pos.Y, this.rotation);
        rz = pos.Z || 0;
      }
      // Method 3: Fallback to start line
      else if (this.startLinePos) {
        rx = this.startLinePos.x;
        ry = this.startLinePos.y;
      } else {
        continue;
      }

      newProcessedDrivers.push({
        racingNumber: driver.RacingNumber || driverNumber,
        x: rx,
        y: ry,
        z: rz,
        teamColor: driver.TeamColour ? `#${driver.TeamColour}` : '#ffffff',
        driverCode: driver.Tla || '',
        onTrack: onTrack,
        labelOffsetY: -320 // Base offset
      });
    }

    // Pass 2: Adjust labels to avoid overlap
    this.avoidLabelOverlap(newProcessedDrivers);

    this.processedDrivers = newProcessedDrivers;
    this.cdr.markForCheck();
  }

  /**
   * Detecta colisiones entre las etiquetas de los pilotos y aplica un desplazamiento
   * vertical para evitar que se superpongan.
   */
  private avoidLabelOverlap(drivers: DriverPosition[]) {
    // Threshold distance (X and Y) to consider overlap
    // Circular radius is 180, label is ~300 units above.
    const COLLISION_THRESHOLD = 350;
    const OFFSET_STEP = 300;

    // We sort drivers by Y position to handle clusters more predictably
    const sortedDrivers = [...drivers].sort((a, b) => a.y - b.y);

    for (let i = 0; i < sortedDrivers.length; i++) {
      const d1 = sortedDrivers[i];
      
      for (let j = i + 1; j < sortedDrivers.length; j++) {
        const d2 = sortedDrivers[j];

        const dx = Math.abs(d1.x - d2.x);
        const dy = Math.abs(d1.y - d2.y);

        // If cars are very close
        if (dx < COLLISION_THRESHOLD && dy < COLLISION_THRESHOLD) {
          // If labels are at the same offset level, push one up
          if (Math.abs(d1.labelOffsetY - d2.labelOffsetY) < 100) {
            d2.labelOffsetY -= OFFSET_STEP;
          }
        }
      }
    }
  }

  /**
   * Calcula una posición X,Y en el SVG interpolando el progreso de los mini-segmentos
   * sobre la polilínea del circuito.
   * 
   * @param timingDriver Datos de timing del piloto incluyendo sectores y segmentos.
   * @returns Coordenadas X e Y interpoladas.
   */
  private getDriverPositionFromSegments(timingDriver: any): { x: number, y: number } {
    if (!timingDriver || !timingDriver.Sectors) return this.startLinePos || { x: 0, y: 0 };

    let sectors = timingDriver.Sectors;
    if (!Array.isArray(sectors)) {
      sectors = Object.values(sectors);
    }

    const allSegments: any[] = [];
    for (const sector of sectors) {
      if (sector.Segments) {
        let segments = sector.Segments;
        if (!Array.isArray(segments)) {
          segments = Object.values(segments);
        }
        allSegments.push(...segments);
      }
    }

    if (allSegments.length === 0) return this.startLinePos || { x: 0, y: 0 };

    // Find furthest segment with status > 0
    let furthestSegmentIndex = -1;
    let currentSegmentStatus = 0;

    for (let i = allSegments.length - 1; i >= 0; i--) {
      const status = allSegments[i]?.Status;
      if (status !== undefined && status > 0) {
        furthestSegmentIndex = i;
        currentSegmentStatus = status;
        break;
      }
    }

    // If no segment has started, use the first one
    if (furthestSegmentIndex === -1) {
      furthestSegmentIndex = 0;
      currentSegmentStatus = allSegments[0]?.Status || 0;
    }

    const baseRatio = furthestSegmentIndex / Math.max(allSegments.length - 1, 1);
    const segmentProgress = currentSegmentStatus === 1 ? 0.5 : 0; // 1 = In progress
    const segmentSize = 1 / Math.max(allSegments.length, 1);
    const adjustedRatio = baseRatio + (segmentProgress * segmentSize);
    
    // Clamp ratio between 0 and 1
    const clampedRatio = Math.min(Math.max(adjustedRatio, 0), 1);
    
    const pointIndex = clampedRatio * (this.trackPoints.length - 1);
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
