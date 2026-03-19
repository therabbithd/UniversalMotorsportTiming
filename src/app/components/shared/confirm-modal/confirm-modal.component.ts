import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Data structure passed to the confirmation modal.
 */
export interface ConfirmationData {
    /** Title of the modal dialogue */
    title: string;
    /** Main message body to display */
    message: string;
    /** Optional custom text for the confirm button */
    confirmText?: string;
    /** Optional custom text for the cancel button */
    cancelText?: string;
    /** If true, the confirm button uses a warning/danger color scheme */
    danger?: boolean;
}

/**
 * A reusable confirmation modal component using Angular Material Dialog.
 * Prompts the user to accept or cancel an action.
 */
@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
    template: `
    <div class="modal-content">
      <h2 mat-dialog-title>{{ data.title | translate }}</h2>
      
      <mat-dialog-content>
        <p>{{ data.message | translate }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ (data.cancelText || 'COMMON.CANCEL') | translate }}
        </button>
        <button mat-flat-button [color]="data.danger ? 'warn' : 'primary'" (click)="onConfirm()">
          {{ (data.confirmText || 'COMMON.ACCEPT') | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .modal-content {
      padding: 16px;
      min-width: 320px;
    }
    h2 {
      margin-bottom: 12px;
      font-weight: 600;
    }
    p {
      color: #555;
      font-size: 1rem;
      line-height: 1.4;
      margin-bottom: 20px;
    }
    mat-dialog-actions {
      gap: 8px;
    }
  `]
})
export class ConfirmModalComponent {
    /**
     * Initializes the ConfirmModalComponent.
     * @param dialogRef Reference to the dialog opened
     * @param data Configuration data passed into the modal
     */
    constructor(
        public dialogRef: MatDialogRef<ConfirmModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationData
    ) { }

    /**
     * Closes the dialog and returns false to the caller.
     */
    onCancel(): void {
        this.dialogRef.close(false);
    }

    /**
     * Closes the dialog and returns true to the caller.
     */
    onConfirm(): void {
        this.dialogRef.close(true);
    }
}
