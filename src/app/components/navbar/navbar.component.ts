import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../shared/confirm-modal/confirm-modal.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { SecretCodeService } from '../../services/secret-code.service';

/**
 * Componente Cabecera (Navbar) global de la aplicación.
 * 
 * Contiene la marca/logo, el menú de navegación principal y controles secundarios
 * como el selector internacional de idioma, el estado de sesión del usuario y 
 * el botón de cerrar sesión. Se adapta a pantallas móviles usando un menú hamburguesa/lateral.
 */
@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, MatDialogModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    /** @ignore */
    private readonly authService = inject(AuthService);
    /** @ignore */
    readonly languageService = inject(LanguageService);
    /** @ignore */
    readonly secretCodeService = inject(SecretCodeService);
    /** @ignore */
    private readonly dialog = inject(MatDialog);

    /** Señal que indica quién es el usuario autenticado actualmente (o nulo). */
    readonly user = this.authService.currentUser;
    
    /** Estado que indica si el menú desplegable en pantallas pequeñas está expandido. */
    isMenuOpen = false;

    /** Alterna el estado de apertura/cierre del menú de navegación en vistas de móvil. */
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    /**
     * Muestra un diálogo de confirmación para cerrar sesión.
     * Si el usuario confirma, invoca el método pertinente del AuthService 
     * para vaciar el token y redirigir a Login.
     */
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
