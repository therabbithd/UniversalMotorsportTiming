import { Injectable, signal } from '@angular/core';

/**
 * Servicio "Easter Egg" que desbloquea funciones ocultas mediante combinaciones de teclas.
 * 
 * Escucha eventos del teclado a nivel global y revela el módulo de MotoGP si el usuario
 * teclea la palabra secreta preestablecida.
 */
@Injectable({
    providedIn: 'root'
})
export class SecretCodeService {
    /**
     * Señal reactiva booleana que indica si el menú/funcionalidad de MotoGP debe mostrarse.
     */
    readonly isMotogpVisible = signal(false);
    
    /** @ignore */
    private sequence = '';
    
    /** @ignore */
    private readonly secretCode = 'moto';
    
    /** @ignore */
    private readonly sequenceLength = this.secretCode.length;

    /** @ignore */
    constructor() {
        this.listenToKeystrokes();
    }

    /**
     * Agrega un 'event listener' al objeto `window` para interceptar cada tecla presionada,
     * almacenándola y verificándola para revelar el secreto.
     */
    private listenToKeystrokes() {
        window.addEventListener('keydown', (event) => {
            // Append the new key to the sequence
            this.sequence += event.key.toLowerCase();

            // Keep only the last N characters where N is the length of the secret code
            if (this.sequence.length > this.sequenceLength) {
                this.sequence = this.sequence.slice(-this.sequenceLength);
            }

            // Check if the sequence matches the secret code
            if (this.sequence === this.secretCode) {
                this.isMotogpVisible.set(true);
            }
        });
    }
}
