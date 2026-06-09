import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Guard admin : protège les routes réservées aux administrateurs.
 *
 * Comment ça marche :
 *   - Si l'utilisateur est connecté ET est admin → accès autorisé
 *   - Si l'utilisateur est connecté mais pas admin → redirection vers /home
 *   - Si l'utilisateur n'est pas connecté → redirection vers /login
 *
 * Usage dans app.routes.ts :
 *   { path: 'admin', component: AdminComponent, canActivate: [adminGuard] }
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord si l'utilisateur est connecté
  if (!authService.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  // Ensuite vérifier s'il est admin
  if (authService.isAdmin()) {
    return true;
  }

  // Connecté mais pas admin → on le renvoie à l'accueil
  router.navigate(['/home']);
  return false;
};
