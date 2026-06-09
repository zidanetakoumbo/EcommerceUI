import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LivreService } from '../services/livre/livre.service';
import { CouvertureService } from '../services/couverture/couverture.service';
import { PanierService } from '../services/panier/panier.service';
import { AuthService } from '../services/auth/auth.service';
import { Livre } from '../Modeles/livre.model';
import { RecommendationsComponent } from '../recommendations/recommendations.component';

@Component({
  selector: 'app-livre-detail',
  imports: [CommonModule, FormsModule, RecommendationsComponent],
  templateUrl: './livre-detail.component.html',
  styleUrl: './livre-detail.component.css'
})
export class LivreDetailComponent implements OnInit {

  livre: Livre | null = null;
  isLoading = true;
  error: string | null = null;
  quantite = 1;  // quantité choisie par l'utilisateur (minimum 1)

  // État des boutons
  ajoutEnCours = false;    // true pendant l'ajout au panier
  messageAjout = '';       // message de succès affiché sous les boutons
  messageErreur = '';      // message d'erreur

  constructor(
    private route: ActivatedRoute,
    private livreService: LivreService,
    private couvertureService: CouvertureService,
    private panierService: PanierService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerLivre();
  }

  /** Charge les données du livre depuis l'API en utilisant l'ID dans l'URL */
  chargerLivre(): void {
    this.isLoading = true;
    this.error = null;

    // route.snapshot.paramMap.get('id') lit le paramètre :id dans l'URL
    // Ex: /livreDetails/42 → id = "42"
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Identifiant du livre manquant dans l\'URL.';
      this.isLoading = false;
      return;
    }

    // Number(id) convertit la chaîne "42" en nombre 42
    this.livreService.getLivreById(Number(id)).subscribe({
      next: (livre) => {
        this.livre = livre;
        this.chargerCouverturesManquantes();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement livre', err);
        this.error = 'Livre introuvable ou erreur de chargement.';
        this.isLoading = false;
      }
    });
  }

  /** Tente de charger les couvertures depuis OpenLibrary si elles ne sont pas en base */
  private chargerCouverturesManquantes(): void {
    if (!this.livre) return;

    if (!this.livre.openCouverture || this.livre.openCouverture.trim() === '') {
      this.couvertureService
        .getCouverture(this.livre.titre, `${this.livre.autheur.prenom} ${this.livre.autheur.nom}`)
        .subscribe({
          next: (url) => { if (url && this.livre) this.livre.openCouverture = url; },
          error: () => {} // pas d'erreur visible si pas de couverture
        });
    }

    if (!this.livre.closeCouverture || this.livre.closeCouverture.trim() === '') {
      this.couvertureService
        .getCouverture(this.livre.titre, `${this.livre.autheur.prenom} ${this.livre.autheur.nom}`)
        .subscribe({
          next: (url) => { if (url && this.livre) this.livre.closeCouverture = url; },
          error: () => {}
        });
    }
  }

  /** Augmente la quantité de 1 (limite : le stock disponible) */
  augmenterQuantite(): void {
    if (this.livre && this.quantite < this.livre.quantiteStock) {
      this.quantite++;
    }
  }

  /** Diminue la quantité de 1 (minimum : 1) */
  diminuerQuantite(): void {
    if (this.quantite > 1) this.quantite--;
  }

  /**
   * Ajoute le livre au panier avec la quantité choisie.
   * Si l'utilisateur n'est pas connecté, redirige vers /login.
   * Après ajout, met à jour le badge dans la navbar.
   */
  ajouterAuPanier(): void {
    if (!this.livre) return;

    // Vérifie si l'utilisateur est connecté (présence d'un token JWT)
    if (!this.authService.getToken()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/livreDetails/${this.livre.id}` }
      });
      return;
    }

    this.ajoutEnCours = true;
    this.messageAjout = '';
    this.messageErreur = '';

    this.panierService.ajouterAuPanier(this.livre.id!, this.quantite).subscribe({
      next: () => {
        this.ajoutEnCours = false;
        this.messageAjout = `${this.quantite} exemplaire(s) ajouté(s) au panier !`;
        // Rafraîchit le compteur dans la navbar (badge panier)
        this.panierService.getPanier().subscribe();
        // Efface le message après 3 secondes
        setTimeout(() => this.messageAjout = '', 3000);
      },
      error: (err) => {
        this.ajoutEnCours = false;
        this.messageErreur = err.error?.message || 'Erreur lors de l\'ajout au panier.';
      }
    });
  }

  /**
   * "Commander" : ajoute le livre au panier ET navigue directement vers /panier.
   * C'est un raccourci pour "ajouter + aller payer tout de suite".
   */
  commander(): void {
    if (!this.livre) return;

    if (!this.authService.getToken()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/livreDetails/${this.livre.id}` }
      });
      return;
    }

    if (this.livre.quantiteStock === 0) {
      this.messageErreur = 'Ce livre est actuellement épuisé.';
      return;
    }

    this.ajoutEnCours = true;
    this.messageAjout = '';
    this.messageErreur = '';

    // On ajoute au panier d'abord, puis on navigue vers /panier
    this.panierService.ajouterAuPanier(this.livre.id!, this.quantite).subscribe({
      next: () => {
        // Mise à jour du badge avant de naviguer
        this.panierService.getPanier().subscribe();
        this.router.navigate(['/panier']);
      },
      error: (err) => {
        this.ajoutEnCours = false;
        this.messageErreur = err.error?.message || 'Erreur lors de l\'ajout au panier.';
      }
    });
  }

  retournerCatalogue(): void {
    this.router.navigate(['/catalogue']);
  }
}
