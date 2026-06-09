import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CommandeService } from '../services/commande/commande.service';
import { Commande, PageCommande } from '../Modeles/commande.model';

/**
 * Composant Mes Commandes : affiche l'historique des commandes de l'utilisateur.
 * Supporte la pagination (on charge les commandes page par page).
 */
@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mes-commandes.component.html',
  styleUrl: './mes-commandes.component.css',
})
export class MesCommandesComponent implements OnInit {
  commandes: Commande[] = [];    // liste des commandes de la page courante
  isLoading = true;
  errorMessage = '';

  // Pagination
  pageActuelle = 0;              // Spring Boot commence les pages à 0
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  // Pour la commande dont on affiche le détail (accordion)
  commandeOuverte: number | null = null;

  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.chargerCommandes();
  }

  /** Charge la page de commandes courante depuis l'API */
  chargerCommandes(): void {
    this.isLoading = true;
    this.commandeService.getMesCommandes(this.pageActuelle, this.pageSize).subscribe({
      next: (page: PageCommande) => {
        this.commandes = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger vos commandes.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  /** Navigue vers la page précédente */
  pagePrecedente(): void {
    if (this.pageActuelle > 0) {
      this.pageActuelle--;
      this.chargerCommandes();
    }
  }

  /** Navigue vers la page suivante */
  pageSuivante(): void {
    if (this.pageActuelle < this.totalPages - 1) {
      this.pageActuelle++;
      this.chargerCommandes();
    }
  }

  /**
   * Annule une commande (uniquement possible si statut = PENDING).
   * @param commande - la commande à annuler
   */
  annulerCommande(commande: Commande): void {
    if (!confirm(`Voulez-vous vraiment annuler la commande #${commande.id} ?`)) return;

    this.commandeService.annulerCommande(commande.id).subscribe({
      next: (commandeModifiee) => {
        // Mettre à jour localement sans recharger toute la page
        const index = this.commandes.findIndex((c) => c.id === commande.id);
        if (index !== -1) {
          this.commandes[index] = commandeModifiee;
        }
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Impossible d\'annuler cette commande.';
        console.error(err);
      },
    });
  }

  /** Ouvre/ferme le détail d'une commande (accordion) */
  toggleDetail(commandeId: number): void {
    this.commandeOuverte = this.commandeOuverte === commandeId ? null : commandeId;
  }

  /**
   * Retourne la classe CSS et le libellé correspondant au statut.
   * Cela permet d'afficher un badge coloré selon l'état de la commande.
   */
  getStatutInfo(status: string): { label: string; cssClass: string } {
    const map: Record<string, { label: string; cssClass: string }> = {
      PENDING:   { label: 'En attente',  cssClass: 'statut-pending' },
      CONFIRMED: { label: 'Confirmée',   cssClass: 'statut-confirmed' },
      SHIPPED:   { label: 'Expédiée',    cssClass: 'statut-shipped' },
      DELIVERED: { label: 'Livrée',      cssClass: 'statut-delivered' },
      CANCELLED: { label: 'Annulée',     cssClass: 'statut-cancelled' },
    };
    return map[status] ?? { label: status, cssClass: '' };
  }
}
