import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    private readonly authService = inject(AuthService);
    readonly languageService = inject(LanguageService);

    readonly user = this.authService.currentUser;
    isMenuOpen = false;

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    logout() {
        this.isMenuOpen = false;
        this.authService.logout();
    }
}
