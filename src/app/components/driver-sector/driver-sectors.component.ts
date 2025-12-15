import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sector, Segment } from '../../models/f1-livetiming.model';

@Component({
  selector: 'app-driver-sectors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-sectors.component.html',
  styleUrls: ['./driver-sectors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverSectorsComponent {
  @Input() sectors?: Sector[] | { [key: string]: Sector };

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

  getSegmentsArray(sector: Sector): Segment[] {
    if (!sector || !sector.Segments) return [];
    
    const segments = Array.isArray(sector.Segments) 
      ? sector.Segments 
      : Object.values(sector.Segments);
    
    // Filtrar segmentos válidos
    return segments.filter(seg => seg && seg.Status !== undefined);
  }

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
