import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-profile-view',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './profile-view.component.html',
    styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly profileService = inject(ProfileService);

    readonly user = this.authService.currentUser;
    readonly profile = signal<Profile | null>(null);
    readonly isLoading = signal(true);
    readonly errorMessage = signal<string | null>(null);

    ngOnInit(): void {
        this.loadProfile();
    }

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

    logout(): void {
        this.authService.logout();
    }
}
