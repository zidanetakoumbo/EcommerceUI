import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// provideAnimationsAsync est OBLIGATOIRE pour Angular Material (MatAutocomplete, etc.)
// Sans ça, les composants Material comme le dropdown d'auteurs ne fonctionnent pas.
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { AuthInterceptor } from './services/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // ⚠️ provideAnimationsAsync() : INDISPENSABLE pour Angular Material
    // Si on l'oublie, l'autocomplete des auteurs dans le formulaire livre ne s'ouvre pas.
    provideAnimationsAsync(),
    provideRouter(routes),
    // withInterceptors enregistre notre intercepteur HTTP.
    // AuthInterceptor ajoute automatiquement le token JWT à chaque requête vers NOTRE API.
    provideHttpClient(withInterceptors([AuthInterceptor]))
  ]
};
