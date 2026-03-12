import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, interval } from 'rxjs';

import { F1LiveTimingStreamService } from '../../services/f1-livetiming.service';
import { DriverInfo, TeamRadioCapture } from '../../models/f1-livetiming.model';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Interface puramente UI para combinar la tarjeta de piloto, con 
 * el estado temporal y de control de su reproductor de audio ("Team Radio").
 */
interface DriverRadio {
  racingNumber: string;
  driverCode: string;
  fullName: string;
  teamName: string;
  teamColor?: string;
  headshotUrl: string;
  latestCapture: TeamRadioCapture;
  audioUrl: string;
  /**  Indica si el audio de este piloto está en reproducción. */
  playing: boolean;
  /** Duración en segundos del archivo de audio. */
  duration: number;
  /** Progreso actual en segundos de la reproducción. */
  progress: number;
}

/**
 * Componente para mostrar las últimas comunicaciones de radio de los pilotos (Team Radio).
 * 
 * Se conecta al stream en directo de F1 y genera una lista reproducibles (Play, Pause, Barra de progreso)
 * por cara piloto basados en el archivo de audio subido por el API.
 */
@Component({
  selector: 'app-driver-radios',
  standalone: true,
  imports: [CommonModule, MatSliderModule, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './driver-radios.component.html',
  styleUrls: ['./driver-radios.component.scss']
})
export class DriverRadiosComponent implements OnInit, OnDestroy {
  /** Array de tarjetas compuestas de radio listas para proyectarse en la vista HTML. */
  drivers: DriverRadio[] = [];

  /** @ignore */
  private subscription?: Subscription;

  constructor(
    private streamService: F1LiveTimingStreamService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscription = this.streamService.state$.subscribe(() => {
      this.buildRadios();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private buildRadios(): void {
    const driversInfo: DriverInfo[] = this.streamService.getDriversInfo();
    const latestByDriver = this.streamService.getLatestRadioByDriver();
    const basePath = this.streamService.getEventPath(); // equivalente a "path" en Radio.js

    if (!basePath || latestByDriver.size === 0 || !driversInfo.length) {
      this.drivers = [];
      return;
    }

    const list: DriverRadio[] = [];

    latestByDriver.forEach((capture, racingNumber) => {
      const info = driversInfo.find(d => d.RacingNumber === racingNumber);
      if (!info) return;

      // Igual que en Radio.js: const src = `${path}/${radio.Path}`;
      const audioUrl = `${basePath}/${capture.Path}`;

      list.push({
        racingNumber,
        driverCode: info.Tla,
        fullName: info.FullName || info.BroadcastName,
        teamName: info.TeamName,
        teamColor: info.TeamColour ? `#${info.TeamColour}` : undefined,
        headshotUrl: info.HeadshotUrl ? `${basePath}/${info.HeadshotUrl}` : '',
        latestCapture: capture,
        audioUrl,
        playing: false,
        duration: 0,
        progress: 0
      });
    });

    // orden por tiempo
    this.drivers = list.sort((a, b) =>
      new Date(b.latestCapture.Utc).getTime() - new Date(a.latestCapture.Utc).getTime()
    );
  }

  // === helpers de tiempo (equivalente a secondsToMinutes) ===
  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds - m * 60);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(m)}:${pad(s)}`;
  }

  // === control de audio como en Radio.js, pero en Angular ===

  onLoadedMetadata(driver: DriverRadio, audio: HTMLAudioElement): void {
    driver.duration = audio.duration || 0;
    this.cdr.markForCheck();
  }

  onTimeUpdate(driver: DriverRadio, audio: HTMLAudioElement): void {
    driver.progress = audio.currentTime || 0;
    this.cdr.markForCheck();
  }

  togglePlay(driver: DriverRadio, audio: HTMLAudioElement): void {
    if (!audio) return;

    if (driver.playing) {
      audio.pause();
      driver.playing = false;
    } else {
      // parar otros
      this.drivers.forEach(d => {
        if (d !== driver) d.playing = false;
      });
      audio.play().then(() => {
        driver.playing = true;
        this.cdr.markForCheck();
      }).catch(err => {
        console.error('Error playing radio', driver.audioUrl, err);
        driver.playing = false;
        this.cdr.markForCheck();
      });
    }
  }

  onEnded(driver: DriverRadio): void {
    driver.playing = false;
    driver.progress = 0;
    this.cdr.markForCheck();
  }

  onSeek(driver: DriverRadio, audio: HTMLAudioElement, value: number): void {
    driver.progress = value;
    audio.currentTime = value;
  }
}
