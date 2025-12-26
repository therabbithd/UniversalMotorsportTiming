import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FeedbackModalComponent } from '../shared/feedback-modal/feedback-modal.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-profile-setup',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, MatDialogModule],
    templateUrl: './profile-setup.component.html',
    styleUrl: './profile-setup.component.scss'
})
export class ProfileSetupComponent {
    private readonly fb = inject(FormBuilder);
    private readonly profileService = inject(ProfileService);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);

    readonly setupForm = this.fb.group({
        bio: ['', [Validators.maxLength(500)]],
        phone: ['', [Validators.pattern('^[0-9+ ]*$')]],
        address: [''],
        avatar: [''],
        configuracion: [''],
        favoritos: ['']
    });

    readonly isSubmitted = signal(false);
    readonly isLoading = signal(false);

    submit(): void {
        this.isSubmitted.set(true);

        if (this.setupForm.invalid) {
            this.setupForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        this.profileService.createProfile(this.setupForm.value as any).subscribe({
            next: () => {
                this.isLoading.set(false);

                this.dialog.open(FeedbackModalComponent, {
                    data: {
                        type: 'success',
                        title: 'AUTH.PROFILE.SETUP.SUCCESS_TITLE',
                        message: 'AUTH.PROFILE.SETUP.SUCCESS_MESSAGE',
                        buttonText: 'COMMON.CONTINUE'
                    },
                    disableClose: true
                }).afterClosed().subscribe(() => {
                    this.router.navigate(['/dashboard']);
                });
            },
            error: (error) => {
                this.isLoading.set(false);
                const message = error.error?.message || 'Hubo un error al guardar tu perfil. Puedes intentarlo más tarde.';

                this.dialog.open(FeedbackModalComponent, {
                    data: {
                        type: 'error',
                        title: 'AUTH.PROFILE.SETUP.ERROR_TITLE',
                        message: message
                    }
                });
            }
        });
    }

    skip(): void {
        this.router.navigate(['/dashboard']);
    }
}
