import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Sector, Segment } from '../../models/f1-livetiming.model';

/**
 * Displays the micro-sectors or segments for a given driver's lap.
 */
@Component({
  selector: 'app-driver-sectors',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './driver-sectors.component.html',
  styleUrls: ['./driver-sectors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverSectorsComponent {
  /** Input containing the sector data object or array */
  @Input() sectors?: Sector[] | { [key: string]: Sector };

  /** 
   * Helper method to extract an array of sectors from the input.
   * @returns Filtered array of sectors 
   */
  getSectorsArray(): Sector[] {
    if (!this.sectors) return [];

    const sectorsArray = Array.isArray(this.sectors)
      ? this.sectors
      : Object.values(this.sectors);

    // Filtrar sectores válidos que tengan segmentos
    return sectorsArray.filter(s =>
      s && (s.Segments || s.Value)
    );
  }

  /** 
   * Helper method to extract segments from a specific sector.
   * @param sector The sector instance
   * @returns Array of Segments
   */
  getSegmentsArray(sector: Sector): Segment[] {
    if (!sector || !sector.Segments) return [];

    const segments = Array.isArray(sector.Segments)
      ? sector.Segments
      : Object.values(sector.Segments);

    // Filtrar segmentos válidos
    return segments.filter(seg => seg && seg.Status !== undefined);
  }

  /** 
   * Returns the appropriate CSS hex color code based on the segment status.
   * @param status The segment status indicator
   * @returns Hex color string
   */
  getSegmentColor(status?: number): string {
    switch (status) {
      case 2048: return '#ffd700';        // Amarillo (tiempo personal)
      case 2049: return '#32cd32';        // Verde lima (mejor personal)
      case 2051: return '#ff00ff';        // Magenta (mejor sesión)
      case 2064: return '#1e90ff';        // Azul (bandera amarilla/invalidado)
      case 2052: return '#9370db';        // Púrpura (otro estado)
      default: return '#555';             // Gris oscuro (sin datos especiales)
    }
  }
}
