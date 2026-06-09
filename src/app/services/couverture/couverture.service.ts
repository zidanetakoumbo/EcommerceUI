import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CouvertureService {
  private openLibraryApiUrl = 'https://openlibrary.org/search.json';
  private openLibraryCoverUrl = 'https://covers.openlibrary.org/b/id';

  // Images par défaut colorées pour les couvertures manquantes
  private defaultCovers = [
    'https://images.unsplash.com/photo-1543002588-d83cedbc4d60?w=400&h=600&fit=crop', // Livres sur une table
    'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=600&fit=crop', // Livres vintage
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', // Livres colorés
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop', // Bibliothèque
    'https://images.unsplash.com/photo-1495446815901-a7297e3ffe02?w=400&h=600&fit=crop', // Livre ouvert
    'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=400&h=600&fit=crop', // Étagère de livres
  ];

  constructor(private http: HttpClient) {}

  /**
   * Récupère la couverture d'un livre via son titre et auteur
   * Retourne l'URL de la couverture ou une image par défaut
   */
  getCouverture(titre: string, auteur?: string): Observable<string | null> {
    if (!titre || titre.trim() === '') {
      return of(this.getDefaultCover());
    }

    // Construire la requête de recherche
    const params = {
      title: titre,
      limit: 1,
    };

    return this.http
      .get<any>(this.openLibraryApiUrl, { params })
      .pipe(
        map((response) => {
          if (
            response &&
            response.docs &&
            response.docs.length > 0 &&
            response.docs[0].cover_id
          ) {
            const coverId = response.docs[0].cover_id;
            // Retourner l'URL de la couverture grande taille
            return `${this.openLibraryCoverUrl}/${coverId}-M.jpg`;
          }
          // Si pas trouvée, retourner une image par défaut
          return this.getDefaultCover();
        }),
        catchError(() => {
          // En cas d'erreur, retourner une image par défaut
          return of(this.getDefaultCover());
        })
      );
  }

  /**
   * Récupère les deux couvertures (avant et arrière)
   */
  getCouvertures(
    titre: string,
    auteur?: string
  ): Observable<{ openCouverture: string | null; closeCouverture: string | null }> {
    return this.getCouverture(titre, auteur).pipe(
      map((coverUrl) => {
        return {
          openCouverture: coverUrl,
          // Pour la couverture arrière, on utilise une variation ou la même image
          closeCouverture: coverUrl ? this.getBackCoverVariation(coverUrl) : null,
        };
      })
    );
  }

  /**
   * Récupère une image par défaut aléatoire
   */
  private getDefaultCover(): string {
    const randomIndex = Math.floor(Math.random() * this.defaultCovers.length);
    return this.defaultCovers[randomIndex];
  }

  /**
   * Génère une variation pour la couverture arrière
   */
  private getBackCoverVariation(coverUrl: string): string {
    // Pour le moment, retourne la même URL
    // Dans une vraie implémentation, on pourrait chercher une image différente
    return coverUrl;
  }
}

