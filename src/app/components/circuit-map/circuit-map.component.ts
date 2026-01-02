// circuit-map.component.ts

import { Component, Input, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of, Subscription } from 'rxjs';
import { F1LiveTimingStreamService } from '../../services/f1-livetiming.service';
import { TranslateModule } from '@ngx-translate/core';

interface DriverPosition {
  racingNumber: string;
  x: number;
  y: number;
  z: number;
  teamColor: string;
  driverCode: string;
  onTrack: boolean;
}

@Component({
  selector: 'app-circuit-map',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './circuit-map.component.html',
  styleUrls: ['./circuit-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircuitMapComponent implements OnChanges, OnDestroy {
  @Input() circuitKey: number | string | undefined;
  @Input() year: number | string | undefined;

  trackData: any = null;
  isLoading = false;
  error: string | null = null;
  streamSubscription: Subscription | null = null;

  // Track rendering
  circuitPath: string = '';
  viewBox: string = "-1000 -1000 2000 2000";

  // Rotation state
  rotation: number = 0;

  // Drivers
  processedDrivers: DriverPosition[] = [];
  startLinePos: { x: number, y: number } | null = null;

  constructor(
    private http: HttpClient,
    private streamService: F1LiveTimingStreamService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['circuitKey'] || changes['year']) {
      this.loadMap();
    }
  }

  ngOnDestroy(): void {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
  }

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

  generateCircuitPath() {
    if (!this.trackData || !this.trackData.x || !this.trackData.y) return;

    const xArr = this.trackData.x;
    const yArr = this.trackData.y;

    // First transform all points
    const transformedPoints = this.transformPoints(xArr, yArr);

    if (transformedPoints.length === 0) return;

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
  }

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

  subscribeToPositions() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }

    this.streamSubscription = this.streamService.state$.subscribe(() => {
      this.updateDriverPositions();
    });
  }

  updateDriverPositions() {
    const state = this.streamService.getCurrentState();
    if (!state.DriverList) {
      return;
    }

    const positionData = state.Position?.Position || {};
    const driverList = state.DriverList;
    const timingData = state.TimingData?.Lines || {};

    const newProcessedDrivers: DriverPosition[] = [];

    // Iterate over all drivers to ensure those without position data are shown at the start line
    for (const [driverNumber, driver] of Object.entries(driverList)) {
      if (!driver) continue;

      const posData = positionData[driverNumber];
      let rx = 0;
      let ry = 0;
      let rz = 0;

      if (posData && typeof posData === 'object') {
        const pos = posData as any;
        [rx, ry] = this.rotate(pos.X, pos.Y, this.rotation);
        rz = pos.Z || 0;
      } else if (this.startLinePos) {
        // Fallback to start line position
        rx = this.startLinePos.x;
        ry = this.startLinePos.y;
        rz = 0;
      } else {
        // Skip if no position info and no start line reference
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

  transformPoints(xArr: number[], yArr: number[]): { x: number, y: number }[] {
    return xArr.map((x, i) => {
      const [rx, ry] = this.rotate(x, yArr[i], this.rotation);
      return { x: rx, y: ry };
    });
  }

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
