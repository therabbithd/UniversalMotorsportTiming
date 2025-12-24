import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-profile-setup',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './profile-setup.component.html',
    styleUrl: './profile-setup.component.scss'
})
export class ProfileSetupComponent {
    private readonly fb = inject(FormBuilder);
    private readonly profileService = inject(ProfileService);
    private readonly router = inject(Router);

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
    readonly errorMessage = signal<string | null>(null);

    submit(): void {
        this.isSubmitted.set(true);
        this.errorMessage.set(null);

        if (this.setupForm.invalid) {
            this.setupForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        this.profileService.createProfile(this.setupForm.value as any).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.isLoading.set(false);
                this.errorMessage.set(
                    error.error?.message || 'Hubo un error al guardar tu perfil. Puedes intentarlo más tarde.'
                );
            }
        });
    }

    skip(): void {
        this.router.navigate(['/dashboard']);
    }
}
