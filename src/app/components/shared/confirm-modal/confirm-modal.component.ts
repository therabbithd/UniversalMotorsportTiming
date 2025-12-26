import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmationData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

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
    constructor(
        public dialogRef: MatDialogRef<ConfirmModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationData
    ) { }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
}
