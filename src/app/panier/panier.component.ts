import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PanierService } from '../services/panier/panier.service';
import { CommandeService } from '../services/commande/commande.service';
import { AuthService } from '../services/auth/auth.service';
import { Panier, PanierItem } from '../Modeles/panier.model';

/**
 * Composant Panier : affiche les articles dans le panier,
 * permet de modifier les quantités, supprimer des articles,
 * et passer une commande.
 */
@Component({
  selector: 'app-panier',
  standalone: true,
  // Les modules nécessaires pour ce composant :
  //   CommonModule → *ngIf, *ngFor, pipes (async, currency, etc.)
  //   RouterLink   → liens de navigation
  //   FormsModule  → [(ngModel)] pour l'input quantité
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './panier.component.html',
  styleUrl: './panier.component.css',
})
export class PanierComponent implements OnInit {
  panier: Panier | null = null;    // le panier chargé depuis l'API
  isLoading = true;                // indicateur de chargement
  errorMessage = '';               // message d'erreur à afficher
  successMessage = '';             // message de succès
  adresseLivraison = '';           // saisie par l'utilisateur avant de commander
  isPassingOrder = false;          // true pendant l'envoi de la commande

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Pré-remplir l'adresse avec celle du profil si disponible
    this.chargerPanier();
  }

  /** Charge le panier depuis l'API */
  chargerPanier(): void {
    this.isLoading = true;
    this.panierService.getPanier().subscribe({
      next: (panier) => {
        this.panier = panier;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger le panier.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  /**
   * Met à jour la quantité d'un article.
   * Si la quantité est 0 ou moins, on supprime l'article.
   */
  modifierQuantite(item: PanierItem, nouvelleQuantite: number): void {
    if (nouvelleQuantite <= 0) {
      this.supprimerItem(item);
      return;
    }

    this.panierService.modifierQuantite(item.id, nouvelleQuantite).subscribe({
      next: () => {
        // Recharger le panier pour avoir les prix recalculés par le backend
        this.chargerPanier();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la modification de la quantité.';
        console.error(err);
      },
    });
  }

  /** Supprime un article du panier */
  supprimerItem(item: PanierItem): void {
    this.panierService.supprimerItem(item.id).subscribe({
      next: () => {
        this.chargerPanier();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la suppression.';
        console.error(err);
      },
    });
  }

  /** Vide entièrement le panier */
  viderPanier(): void {
    if (!confirm('Voulez-vous vraiment vider votre panier ?')) return;

    this.panierService.viderPanier().subscribe({
      next: () => {
        this.chargerPanier();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la vidange du panier.';
        console.error(err);
      },
    });
  }

  /**
   * Passe la commande avec l'adresse de livraison saisie.
   * Après succès, on redirige vers l'historique des commandes.
   */
  passerCommande(): void {
    if (!this.adresseLivraison.trim()) {
      this.errorMessage = 'Veuillez saisir une adresse de livraison.';
      return;
    }

    if (!this.panier?.items?.length) {
      this.errorMessage = 'Votre panier est vide.';
      return;
    }

    this.isPassingOrder = true;
    this.errorMessage = '';

    this.commandeService.passerCommande(this.adresseLivraison).subscribe({
      next: (commande) => {
        this.isPassingOrder = false;
        // Réinitialiser le badge panier dans la navbar
        this.panierService.resetCartCount();
        this.successMessage = `Commande #${commande.id} passée avec succès !`;
        // Redirection après 2 secondes
        setTimeout(() => this.router.navigate(['/mes-commandes']), 2000);
      },
      error: (err) => {
        this.isPassingOrder = false;
        this.errorMessage =
          err.error?.message || 'Erreur lors du passage de la commande.';
        console.error(err);
      },
    });
  }

  /** Calcule le total du panier (somme de tous les prixTotal) */
  get total(): number {
    if (!this.panier?.items) return 0;
    return this.panier.items.reduce((sum, item) => sum + item.prixTotal, 0);
  }

  /** Calcule le nombre total d'articles dans le panier */
  get nbArticles(): number {
    if (!this.panier?.items) return 0;
    return this.panier.items.reduce((sum, item) => sum + item.quantite, 0);
  }
}
