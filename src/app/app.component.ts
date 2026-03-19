import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LanguageService } from './services/language.service';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Componente principal de la aplicación.
 * 
 * Contiene el enrutador (`RouterOutlet`) y la barra de navegación (`NavbarComponent`),
 * y gestiona la inicialización principal de la app, incluyendo el servicio de traducción.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  /**
   * Título principal de la aplicación.
   */
  title = 'UnivesalTiming';

  /**
   * @ignore
   */
  private languageService = inject(LanguageService);
  
  /**
   * @ignore
   */
  private http = inject(HttpClient);
  
  /**
   * @ignore
   */
  private translate = inject(TranslateService);

  /**
   * Main initialization hook.
   * Performs the following actions:
   * 1. Verifies i18n asset availability by manually fetching es.json.
   * 2. Subscribes to language change events for debugging.
   * 3. Tests immediate and delayed translation lookups to verify the i18n pipeline.
   */
  ngOnInit() {
    console.log('[DEBUG] AppComponent initialized');

    // Check if translation file exists
    this.http.get('/assets/i18n/es.json').subscribe({
      next: (data) => console.log('[DEBUG] Successfully loaded es.json manually:', data),
      error: (err) => console.error('[DEBUG] Failed to load es.json manually:', err)
    });

    this.translate.onLangChange.subscribe(event => {
      console.log('[DEBUG] Language changed:', event);
    });

    this.translate.onDefaultLangChange.subscribe(event => {
      console.log('[DEBUG] Default language changed:', event);
    });

    console.log('[DEBUG] Current Lang:', this.translate.currentLang);
    console.log('[DEBUG] Default Lang:', this.translate.defaultLang);

    setTimeout(() => {
      console.log('[DEBUG] Timeout start');
      console.log('[DEBUG] Current Lang:', this.translate.currentLang);

      const testKey = 'CALENDAR.TITLE';
      const translation = this.translate.instant(testKey);
      console.log(`[DEBUG] Testing translation for ${testKey}:`, translation);

      this.translate.get(testKey).subscribe(res => {
        console.log(`[DEBUG] Observable translation for ${testKey}:`, res);
      });
    }, 2000);
  }
}
