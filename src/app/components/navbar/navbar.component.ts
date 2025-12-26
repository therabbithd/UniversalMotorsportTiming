import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../shared/confirm-modal/confirm-modal.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, MatDialogModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    private readonly authService = inject(AuthService);
    readonly languageService = inject(LanguageService);
    private readonly dialog = inject(MatDialog);

    readonly user = this.authService.currentUser;
    isMenuOpen = false;

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    logout() {
        this.isMenuOpen = false;

        const dialogRef = this.dialog.open(ConfirmModalComponent, {
            data: {
                title: 'NAV.LOGOUT_CONFIRM_TITLE',
                message: 'NAV.LOGOUT_CONFIRM_MESSAGE',
                confirmText: 'NAV.LOGOUT',
                danger: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.authService.logout();
            }
        });
    }
}
