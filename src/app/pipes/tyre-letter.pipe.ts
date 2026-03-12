import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para obtener la letra inicial descriptiva de un tipo de neumático.
 * 
 * Se utiliza para mostrar de forma abreviada la información del neumático (ej: S, M, H, W, I).
 * 
 * @example
 * ```html
 * <span>{{ selectedTyre | tyreLetter }}</span>
 * ```
 */
@Pipe({
    name: 'tyreLetter',
    standalone: true
})
export class TyreLetterPipe implements PipeTransform {

    /**
     * Extrae la primera letra de la cadena de compuesto y la pone en mayúsculas.
     * 
     * @param compound Nombre del compuesto (ej. `SOFT`).
     * @returns La primera letra en mayúscula (ej. `S`).
     */
    transform(compound: string): string {
        if (!compound) return '';
        return compound.charAt(0).toUpperCase();
    }

}
