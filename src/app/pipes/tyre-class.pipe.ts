import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para obtener la clase CSS correspondiente a un tipo de neumático.
 * 
 * Agrega el prefijo `tyre-` al nombre del compuesto para aplicar los estilos de color correctos
 * en la tabla de tiempos y otros componentes.
 * 
 * @example
 * ```html
 * <div [ngClass]="currentTyre | tyreClass"></div>
 * ```
 */
@Pipe({
    name: 'tyreClass',
    standalone: true
})
export class TyreClassPipe implements PipeTransform {

    /**
     * Transforma el compuesto del neumático en nombre de clase CSS.
     * 
     * @param compound Nombre del compuesto (ej: `SOFT`, `HARD`, `MEDIUM`).
     * @returns La clase CSS correspondiente (ej: `tyre-soft`), o cadena vacía si no existe.
     */
    transform(compound: string): string {
        if (!compound) return '';
        const compoundLower = compound.toLowerCase();
        return `tyre-${compoundLower}`;
    }

}
