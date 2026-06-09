import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environements/environement';

/**
 * AuthInterceptor : intercepteur HTTP qui ajoute le token JWT à chaque requête.
 *
 * IMPORTANT : On n'ajoute le JWT que pour les appels à NOTRE propre backend.
 * Si on l'ajoutait à toutes les requêtes, notre token serait envoyé à OpenLibrary,
 * Unsplash et d'autres API externes → erreurs CORS car ces serveurs
 * ne s'attendent pas à recevoir un header "Authorization" de notre app.
 *
 * Exemple de ce qui se passe sans cette vérification :
 *   - Requête GET https://openlibrary.org/search.json avec Authorization: Bearer xxx
 *   - OpenLibrary rejette la requête → les couvertures ne se chargent plus
 */
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  // On vérifie que la requête est bien destinée à notre API backend.
  // environment.apiBaseUrl vaut "http://localhost:8080" en développement.
  const estUnAppelAPI = req.url.startsWith(environment.apiBaseUrl);

  // On ajoute le header JWT SEULEMENT si :
  // 1. L'utilisateur est connecté (token présent)
  // 2. La requête va vers notre propre serveur Spring Boot
  if (token && estUnAppelAPI) {
    // req.clone() crée une COPIE immuable de la requête avec les nouveaux headers.
    // Les objets HttpRequest sont immuables (on ne peut pas les modifier directement).
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // next(req) passe la requête au prochain intercepteur (ou au serveur si c'est le dernier)
  return next(req);
};
