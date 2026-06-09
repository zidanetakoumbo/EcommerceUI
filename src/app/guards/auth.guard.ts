import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Guard d'authentification : protège les routes qui nécessitent d'être connecté.
 *
 * Comment ça marche :
 *   - Si un token est présent dans le localStorage → l'utilisateur peut accéder à la page
 *   - Sinon → on le redirige vers la page de connexion
 *
 * Usage dans app.routes.ts :
 *   { path: 'panier', component: PanierComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  // inject() est la façon moderne d'obtenir un service dans une fonction
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    // L'utilisateur est connecté → on l'autorise
    return true;
  }

  // Pas de token → redirection vers /login
  // On passe l'URL demandée en paramètre pour pouvoir y revenir après connexion
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
