import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FeedbackModalComponent } from '../shared/feedback-modal/feedback-modal.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { TranslateModule } from '@ngx-translate/core';
import { DriverSelectorComponent } from '../shared/driver-selector/driver-selector.component';

/**
 * Component responsible for setting up or updating a user's profile details.
 * Contains a reactive form and integration with Cloudinary for avatar uploads.
 */
@Component({
    selector: 'app-profile-setup',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, MatDialogModule, DriverSelectorComponent],
    templateUrl: './profile-setup.component.html',
    styleUrl: './profile-setup.component.scss'
})
export class ProfileSetupComponent {
    /** Injected form builder */
    private readonly fb = inject(FormBuilder);
    /** Injected profile service */
    private readonly profileService = inject(ProfileService);
    /** Injected Cloudinary service for image uploading */
    private readonly cloudinaryService = inject(CloudinaryService);
    /** Injected Angular router */
    private readonly router = inject(Router);
    /** Injected Material Dialog service */
    private readonly dialog = inject(MatDialog);

    /** Main reactive form group for profile setup */
    readonly setupForm = this.fb.group({
        bio: ['', [Validators.maxLength(500)]],
        phone: ['', [Validators.pattern('^[0-9+ ]*$')]],
        address: [''],
        avatar: [''],
        configuracion: [''],
        favoritos: ['']
    });

    /** State signal indicating if the form was submitted */
    readonly isSubmitted = signal(false);
    /** State signal indicating if data is being saved */
    readonly isLoading = signal(false);
    /** State signal indicating if an image is currently uploading to Cloudinary */
    readonly isUploading = signal(false);
    /** State signal containing the preview URL of the avatar */
    readonly avatarPreview = signal<string | null>(null);

    /**
     * Handles file selection for avatar uploading.
     * @param event DOM file input change event
     */
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.dialog.open(FeedbackModalComponent, {
                    data: {
                        type: 'error',
                        title: 'Error',
                        message: 'Por favor, selecciona un archivo de imagen válido.'
                    }
                });
                return;
            }

            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                this.avatarPreview.set(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            this.isUploading.set(true);
            this.cloudinaryService.uploadImage(file).subscribe({
                next: (url) => {
                    this.setupForm.patchValue({ avatar: url });
                    this.isUploading.set(false);
                },
                error: (error) => {
                    this.isUploading.set(false);
                    console.error('Error uploading image', error);
                    this.dialog.open(FeedbackModalComponent, {
                        data: {
                            type: 'error',
                            title: 'Error',
                            message: 'Error al subir la imagen. Por favor intenta de nuevo.'
                        }
                    });
                }
            });
        }
    }

    /**
     * Validates and submits the setup form to the backend to create the profile.
     */
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

    /**
     * Skips the profile setup phase and directly navigates to the dashboard.
     */
    skip(): void {
        this.router.navigate(['/dashboard']);
    }
}
