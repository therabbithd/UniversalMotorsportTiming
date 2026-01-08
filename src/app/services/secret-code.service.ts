import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SecretCodeService {
    readonly isMotogpVisible = signal(false);
    private sequence = '';
    private readonly secretCode = 'moto';
    private readonly sequenceLength = this.secretCode.length;

    constructor() {
        this.listenToKeystrokes();
    }

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
