import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LanguageService } from './services/language.service';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'UnivesalTiming';
  private languageService = inject(LanguageService);
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

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
