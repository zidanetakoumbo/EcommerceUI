import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { LivreService } from '../services/livre/livre.service';
import { CouvertureService } from '../services/couverture/couverture.service';
import { PanierService } from '../services/panier/panier.service';
import { AuthService } from '../services/auth/auth.service';
import { Livre } from '../Modeles/livre.model';
import { LivreFilterComponent } from '../livre-filter/livre-filter.component';
import { CritereLivreFilter } from '../Modeles/critere.model';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css'],
  imports: [CommonModule, FormsModule, LivreFilterComponent, RouterLink],
})
export class CatalogueComponent implements OnInit {
  livres: Livre[] = [];
  livresFiltres: Livre[] = [];
  loading = true;

  // Feedback for add-to-cart: null = nothing, otherwise the id of the book being added
  ajoutEnCours: number | null = null;
  messageAjout = '';

  private livreService = inject(LivreService);
  private couvertureService = inject(CouvertureService);
  private panierService = inject(PanierService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadLivres();
  }

  loadLivres(): void {
    this.livreService.getLivres().subscribe({
      next: (data) => {
        this.livres = data;
        this.livresFiltres = data;
        this.chargerCouverturesManquantes();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement catalogue', err);
        this.loading = false;
      },
    });
  }

  /** For each book without a cover, fetch it via the cover service */
  private chargerCouverturesManquantes(): void {
    this.livres.forEach((livre) => {
      if (!livre.openCouverture || livre.openCouverture.trim() === '') {
        this.couvertureService
          .getCouverture(livre.titre, `${livre.autheur.prenom} ${livre.autheur.nom}`)
          .subscribe({
            next: (url) => { if (url) livre.openCouverture = url; },
            error: () => console.warn(`Cover not found for "${livre.titre}"`),
          });
      }
      if (!livre.closeCouverture || livre.closeCouverture.trim() === '') {
        this.couvertureService
          .getCouverture(livre.titre, `${livre.autheur.prenom} ${livre.autheur.nom}`)
          .subscribe({
            next: (url) => { if (url) livre.closeCouverture = url; },
            error: () => {},
          });
      }
    });
  }

  appliquerFiltre(criteres: CritereLivreFilter): void {
    this.livresFiltres = this.livres.filter((livre) => {
      const titreMatch = criteres.titre
        ? livre.titre.toLowerCase().includes(criteres.titre.toLowerCase())
        : true;
      const auteurMatch = criteres.autheur
        ? `${livre.autheur.nom} ${livre.autheur.prenom}`
            .toLowerCase()
            .includes(criteres.autheur.toLowerCase())
        : true;
      const categorieMatch = criteres.categorie
        ? livre.categories?.some(
            (cat) => cat.nomCat.toLowerCase() === criteres.categorie.toLowerCase()
          )
        : true;
      const prixMatch = livre.prix <= criteres.maxPrix;
      return titreMatch && auteurMatch && categorieMatch && prixMatch;
    });
  }

  /**
   * Adds a book to the cart (quantity 1 from the catalogue).
   * If not logged in, redirects to the login page.
   */
  ajouterAuPanier(livre: Livre): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/catalogue' } });
      return;
    }

    this.ajoutEnCours = livre.id!;

    this.panierService.ajouterAuPanier(livre.id!, 1).subscribe({
      next: () => {
        this.ajoutEnCours = null;
        this.messageAjout = `"${livre.titre}" a ete ajoute au panier !`;
        // Refresh the navbar badge
        this.panierService.getPanier().subscribe();
        setTimeout(() => (this.messageAjout = ''), 2000);
      },
      error: (err) => {
        this.ajoutEnCours = null;
        this.messageAjout = err.error?.message || 'Erreur lors de l\'ajout au panier.';
        setTimeout(() => (this.messageAjout = ''), 3000);
      },
    });
  }

  commander(livre: Livre): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/catalogue' } });
      return;
    }
    this.router.navigate(['/panier']);
  }
}
