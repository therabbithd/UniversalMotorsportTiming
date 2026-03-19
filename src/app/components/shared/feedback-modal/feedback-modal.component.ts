import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Data structure passed to the feedback modal.
 */
export interface FeedbackData {
    /** Type of feedback determining icon and colors */
    type: 'success' | 'error' | 'info';
    /** Modal title */
    title: string;
    /** Main feedback message */
    message: string;
    /** Optional custom text for the dismissal button */
    buttonText?: string;
}

/**
 * A reusable modal component to display success, error, or informational messages.
 */
@Component({
    selector: 'app-feedback-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
    template: `
    <div class="modal-content" [ngClass]="data.type">
      <div class="icon-container">
        <mat-icon>{{ getIcon() }}</mat-icon>
      </div>
      
      <h2 mat-dialog-title>{{ data.title | translate }}</h2>
      
      <mat-dialog-content>
        <p>{{ data.message | translate }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="center">
        <button mat-flat-button color="primary" [mat-dialog-close]="true" class="action-button">
          {{ (data.buttonText || 'COMMON.ACCEPT') | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .modal-content {
      padding: 24px;
      text-align: center;
      border-radius: 12px;
      min-width: 300px;
      
      &.success {
        .icon-container { color: #4caf50; background: #e8f5e9; }
        .action-button { background-color: #4caf50; }
      }
      &.error {
        .icon-container { color: #f44336; background: #ffebee; }
        .action-button { background-color: #f44336; }
      }
      &.info {
        .icon-container { color: #2196f3; background: #e3f2fd; }
        .action-button { background-color: #2196f3; }
      }
    }

    .icon-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      
      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }
    }

    h2 {
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    p {
      color: #666;
      font-size: 1.1rem;
      line-height: 1.5;
    }

    mat-dialog-actions {
      margin-top: 16px;
      padding-bottom: 0;
    }

    .action-button {
      padding: 10px 32px;
      border-radius: 8px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class FeedbackModalComponent {
    /**
     * Initializes the FeedbackModalComponent.
     * @param dialogRef Reference to the dialog instance
     * @param data The configuration data passed into the modal
     */
    constructor(
        public dialogRef: MatDialogRef<FeedbackModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FeedbackData
    ) { }

    /**
     * Returns the name of the Material icon to display based on the feedback type.
     * @returns Icon name string
     */
    getIcon(): string {
        switch (this.data.type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'info': return 'info';
            default: return 'help';
        }
    }
}
