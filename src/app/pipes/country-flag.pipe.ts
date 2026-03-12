import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para convertir un código ISO de país en la URL de su bandera.
 * 
 * Utiliza el servicio de flagcdn.com para obtener una imagen de 20px de ancho.
 * 
 * @example
 * ```html
 * <img [src]="'ES' | countryFlag" alt="Bandera">
 * ```
 */
@Pipe({
    name: 'countryFlag',
    standalone: true
})
export class CountryFlagPipe implements PipeTransform {

    /**
     * Transforma el código ISO en una URL de imagen.
     * 
     * @param isoCode Código ISO del país (ej: `es`, `gb`, `it`).
     * @returns La URL absoluta hacia la imagen de la bandera, o una cadena vacía si no hay código.
     */
    transform(isoCode: string): string {
        if (!isoCode) return '';
        return `https://flagcdn.com/w20/${isoCode.toLowerCase()}.png`;
    }

}
