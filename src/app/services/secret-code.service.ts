import { Injectable, signal } from '@angular/core';

/**
 * Servicio "Easter Egg" para gestionar funciones ocultas.
 * (El easter egg de MotoGP ha sido deshabilitado).
 */
@Injectable({
    providedIn: 'root'
})
export class SecretCodeService {
    /**
     * Señal reactiva booleana que indica si el menú/funcionalidad de MotoGP debe mostrarse.
     * Actualmente deshabilitada.
     */
    readonly isMotogpVisible = signal(false);
}

