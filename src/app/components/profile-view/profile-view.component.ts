import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile.model';
import { TranslateModule } from '@ngx-translate/core';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

/**
 * Component responsible for displaying the user's profile information.
 */
@Component({
    selector: 'app-profile-view',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, ImageFallbackDirective],
    templateUrl: './profile-view.component.html',
    styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent implements OnInit {
    /** Injected authentication service */
    private readonly authService = inject(AuthService);
    /** Injected profile service to fetch user data */
    private readonly profileService = inject(ProfileService);

    /** Signal containing the current authenticated user details */
    readonly user = this.authService.currentUser;
    /** Signal containing the specific profile details fetched from the API */
    readonly profile = signal<Profile | null>(null);
    /** Signal indicating if the profile data is currently loading */
    readonly isLoading = signal(true);
    /** Signal containing any error message encountered during profile loading */
    readonly errorMessage = signal<string | null>(null);

    /** Lifecycle hook to initialize component and load profile data */
    ngOnInit(): void {
        this.loadProfile();
    }

    /** Fetches the user profile from the server */
    loadProfile(): void {
        this.isLoading.set(true);
        this.profileService.getProfile().subscribe({
            next: (profile) => {
                this.profile.set(profile);
                this.isLoading.set(false);
            },
            error: (error) => {
                this.isLoading.set(false);
                if (error.status !== 404) {
                    this.errorMessage.set('Error al cargar la información del perfil.');
                }
            }
        });
    }

    /** Logs out the current user and clears session */
    logout(): void {
        this.authService.logout();
    }
}
