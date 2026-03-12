import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Servicio transversal para gestionar la internacionalización de la aplicación.
 * 
 * Permite inicializar el idioma, recuperarlo del almacenamiento local, y 
 * cambiar dinámicamente el idioma en tiempo de ejecución.
 */
@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    /** @ignore */
    private readonly translate = inject(TranslateService);
    
    /** @ignore */
    private readonly platformId = inject(PLATFORM_ID);

    /** @ignore */
    private readonly STORAGE_KEY = 'selected_language';
    
    /** @ignore */
    private readonly DEFAULT_LANG = 'es';

    /** 
     * Lista de idiomas disponibles soportados por la aplicación.
     * Cada objeto incluye su código ISO, etiqueta descriptiva y bandera.
     */
    readonly availableLanguages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'it', label: 'Italiano', flag: '🇮🇹' }
    ];

    /** 
     * Señal reactiva con el código del idioma activo actual.
     */
    readonly currentLang = signal(this.DEFAULT_LANG);

    /** 
     * Inicializa los idiomas configurando el servicio `TranslateService`.
     */
    constructor() {
        this.translate.addLangs(this.availableLanguages.map(l => l.code));
        this.translate.setDefaultLang(this.DEFAULT_LANG);
        this.initLanguage();
    }

    /**
     * Determina el idioma inicial a aplicar al arrancar la aplicación.
     * Verifica primero si hay un idioma guardado en el navegador y si no, 
     * intenta detectar el idioma del explorador. Se respalda al predeterminado en su fallo.
     * 
     * @returns Void
     */
    private initLanguage() {
        let langToUse = this.DEFAULT_LANG;

        if (isPlatformBrowser(this.platformId)) {
            const savedLang = localStorage.getItem(this.STORAGE_KEY);
            if (savedLang && this.availableLanguages.some(l => l.code === savedLang)) {
                langToUse = savedLang;
            } else {
                const browserLang = this.translate.getBrowserLang();
                if (browserLang && this.availableLanguages.some(l => l.code === browserLang)) {
                    langToUse = browserLang;
                }
            }
        }

        this.translate.use(langToUse);
        this.currentLang.set(langToUse);
    }

    /**
     * Cambia globalmente el idioma de la aplicación y persiste la selección en el navegador.
     * 
     * @param langCode Código del nuevo idioma a establecer (ej: `es`, `en`).
     * @returns Void
     */
    setLanguage(langCode: string) {
        if (this.availableLanguages.some(l => l.code === langCode)) {
            this.translate.use(langCode);
            this.currentLang.set(langCode);
            if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem(this.STORAGE_KEY, langCode);
            }
        }
    }
}
