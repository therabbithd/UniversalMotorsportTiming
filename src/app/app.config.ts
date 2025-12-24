import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeEs);
registerLocaleData(localeFr);
registerLocaleData(localeIt);

// Custom loader that implements TranslateLoader directly to be version-agnostic
// and handle the cache-busting timestamp.
export class CustomTranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix: string = '/assets/i18n/',
    private suffix: string = '.json'
  ) { }

  getTranslation(lang: string): Observable<any> {
    console.log(`[DEBUG] Loading translation for: ${lang}`);
    const url = `${this.prefix}${lang}${this.suffix}?t=${new Date().getTime()}`;
    return this.http.get(url);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  console.log('[DEBUG] HttpLoaderFactory called');
  return new CustomTranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
};
