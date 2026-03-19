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
  /** Número de carrera del piloto. */
  racingNumber: string;
  /** Código de tres letras (TLA) del piloto (ej: VER). */
  driverCode: string;
  /** Nombre completo o nombre de emisión del piloto. */
  fullName: string;
  /** Nombre del equipo al que pertenece. */
  teamName: string;
  /** Color hexadecimal representativo del equipo. */
  teamColor?: string;
  /** URL de la imagen de perfil (headshot) del piloto. */
  headshotUrl: string;
  /** Última captura de radio recibida para este piloto. */
  latestCapture: TeamRadioCapture;
  /** URL absoluta del archivo de audio .mp3. */
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

  /**
   * Crea una instancia de DriverRadiosComponent.
   * @param streamService Servicio de stream de telemetría F1.
   * @param cdr Referencia para disparar la detección de cambios manual.
   */
  constructor(
    private streamService: F1LiveTimingStreamService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Se suscribe al estado del stream al inicializar el componente.
   */
  ngOnInit(): void {
    this.subscription = this.streamService.state$.subscribe(() => {
      this.buildRadios();
      this.cdr.markForCheck();
    });
  }

  /**
   * Limpia las suscripciones al destruir el componente.
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Construye y actualiza la lista de radios baseándose en la información 
   * de pilotos y capturas más recientes del stream.
   */
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

  /**
   * Formatea una cantidad de segundos en un string legible de minutos y segundos (MM:SS).
   * 
   * @param seconds Segundos totales.
   * @returns Tiempo formateado como "MM:SS".
   */
  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds - m * 60);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(m)}:${pad(s)}`;
  }

  // === control de audio como en Radio.js, pero en Angular ===

  /**
   * Maneja el evento de metadatos cargados del elemento de audio para obtener la duración total.
   * 
   * @param driver Objeto DriverRadio asociado.
   * @param audio Elemento HTML de audio.
   */
  onLoadedMetadata(driver: DriverRadio, audio: HTMLAudioElement): void {
    driver.duration = audio.duration || 0;
    this.cdr.markForCheck();
  }

  /**
   * Actualiza el progreso de reproducción conforme avanza el audio.
   * 
   * @param driver Objeto DriverRadio asociado.
   * @param audio Elemento HTML de audio.
   */
  onTimeUpdate(driver: DriverRadio, audio: HTMLAudioElement): void {
    driver.progress = audio.currentTime || 0;
    this.cdr.markForCheck();
  }

  /**
   * Alterna entre reproducción y pausa del audio del piloto.
   * Detiene automáticamente cualquier otra radio que se esté reproduciendo.
   * 
   * @param driver Objeto DriverRadio asociado.
   * @param audio Elemento HTML de audio.
   */
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

  /**
   * Maneja el final de la reproducción del audio, reseteando el estado visual.
   * 
   * @param driver Objeto DriverRadio asociado.
   */
  onEnded(driver: DriverRadio): void {
    driver.playing = false;
    driver.progress = 0;
    this.cdr.markForCheck();
  }

  /**
   * Permite al usuario saltar a un punto específico del audio mediante el slider.
   * 
   * @param driver Objeto DriverRadio asociado.
   * @param audio Elemento HTML de audio.
   * @param value Nuevo tiempo en segundos.
   */
  onSeek(driver: DriverRadio, audio: HTMLAudioElement, value: number): void {
    driver.progress = value;
    audio.currentTime = value;
  }
}
