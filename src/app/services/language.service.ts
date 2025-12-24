import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly translate = inject(TranslateService);
    private readonly platformId = inject(PLATFORM_ID);

    private readonly STORAGE_KEY = 'selected_language';
    private readonly DEFAULT_LANG = 'es';

    readonly availableLanguages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'it', label: 'Italiano', flag: '🇮🇹' }
    ];

    readonly currentLang = signal(this.DEFAULT_LANG);

    constructor() {
        this.translate.addLangs(this.availableLanguages.map(l => l.code));
        this.translate.setDefaultLang(this.DEFAULT_LANG);
        this.initLanguage();
    }

    private initLanguage() {
        let langToUse = this.DEFAULT_LANG;

        if (isPlatformBrowser(this.platformId)) {
            const savedLang = localStorage.getItem(this.STORAGE_KEY);
            if (savedLang && this.availableLanguages.some(l => l.code === savedLang)) {
                langToUse = savedLang;
            }
        }

        this.translate.use(langToUse);
        this.currentLang.set(langToUse);
    }

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
