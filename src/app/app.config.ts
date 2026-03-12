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

/**
 * Custom loader that implements TranslateLoader directly to be version-agnostic
 * and handle the cache-busting timestamp.
 * 
 * Se encarga de cargar los archivos de traducción desde la ruta proporcionada,
 * añadiendo una marca de tiempo para evitar problemas de caché del navegador.
 */
export class CustomTranslateHttpLoader implements TranslateLoader {
  /**
   * Crea una instancia del loader personalizado de traducciones.
   * @param http Cliente HTTP para realizar las peticiones
   * @param prefix Prefijo de la ruta de los archivos (por defecto `/assets/i18n/`)
   * @param suffix Sufijo de los archivos (por defecto `.json`)
   */
  constructor(
    private http: HttpClient,
    private prefix: string = '/assets/i18n/',
    private suffix: string = '.json'
  ) { }

  /**
   * Obtiene las traducciones para el idioma especificado.
   * 
   * @param lang Código del idioma a cargar (ej. `es`, `en`).
   * @returns Un Observable con el JSON de traducciones.
   */
  getTranslation(lang: string): Observable<any> {
    console.log(`[DEBUG] Loading translation for: ${lang}`);
    const url = `${this.prefix}${lang}${this.suffix}?t=${new Date().getTime()}`;
    return this.http.get(url);
  }
}

/**
 * Función fábrica para proveer el CustomTranslateHttpLoader al módulo de traducciones.
 * 
 * @param http El servicio `HttpClient` inyectado por Angular.
 * @returns Instancia de `CustomTranslateHttpLoader` configurada con las rutas de assets.
 */
export function HttpLoaderFactory(http: HttpClient) {
  console.log('[DEBUG] HttpLoaderFactory called');
  return new CustomTranslateHttpLoader(http, '/assets/i18n/', '.json');
}

/**
 * Configuración global de la aplicación Angular.
 * 
 * Incluye proveedores para:
 * - Enrutamiento (`provideRouter`)
 * - Peticiones HTTP con `fetch` (`provideHttpClient`)
 * - Animaciones asíncronas (`provideAnimationsAsync`)
 * - Servicio de traducciones internacionalización (`provideTranslateService`)
 */
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
