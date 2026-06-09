import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CommandeService } from '../../services/commande/commande.service';
import { Commande, PageCommande } from '../../Modeles/commande.model';

@Component({
  selector: 'app-admin-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-commandes.component.html',
  styleUrl: './admin-commandes.component.css',
})
export class AdminCommandesComponent implements OnInit {
  commandes: Commande[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // 'NON_LIVREES' = vue par défaut : toutes commandes non encore livrées
  statutFiltre = 'NON_LIVREES';

  // 'NON_LIVREES' en premier, puis les statuts individuels
  statuts = ['NON_LIVREES', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  // Pagination
  pageActuelle = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  commandeOuverte: number | null = null;
  commandeEnMaj: number | null = null;

  // Statuts disponibles pour le changement de statut d'une commande
  readonly statutsAction = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const obs =
      this.statutFiltre === 'NON_LIVREES'
        ? this.commandeService.getCommandesNonLivrees(this.pageActuelle, this.pageSize)
        : this.commandeService.getCommandesParStatut(
            this.statutFiltre,
            this.pageActuelle,
            this.pageSize
          );

    obs.subscribe({
      next: (page: PageCommande) => {
        this.commandes = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les commandes.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  onStatutFiltreChange(): void {
    this.pageActuelle = 0;
    this.chargerCommandes();
  }

  changerStatut(commande: Commande, newStatus: string): void {
    this.commandeEnMaj = commande.id;
    this.errorMessage = '';

    this.commandeService.changerStatut(commande.id, newStatus).subscribe({
      next: (commandeModifiee) => {
        this.commandeEnMaj = null;
        const index = this.commandes.findIndex((c) => c.id === commande.id);
        if (index !== -1) {
          // En vue "non livrées", on retire la commande si elle devient DELIVERED ou CANCELLED
          if (
            this.statutFiltre === 'NON_LIVREES' &&
            (newStatus === 'DELIVERED' || newStatus === 'CANCELLED')
          ) {
            this.commandes.splice(index, 1);
            this.totalElements = Math.max(0, this.totalElements - 1);
          } else {
            this.commandes[index] = commandeModifiee;
          }
        }
        this.successMessage = `Statut de la commande #${commande.id} mis à jour.`;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.commandeEnMaj = null;
        this.errorMessage =
          err.error?.message || 'Erreur lors du changement de statut.';
        console.error(err);
      },
    });
  }

  toggleDetail(commandeId: number): void {
    this.commandeOuverte =
      this.commandeOuverte === commandeId ? null : commandeId;
  }

  getStatutInfo(status: string): { label: string; cssClass: string } {
    const map: Record<string, { label: string; cssClass: string }> = {
      NON_LIVREES: { label: 'Non livrées',  cssClass: '' },
      PENDING:     { label: 'En attente',   cssClass: 'statut-pending' },
      CONFIRMED:   { label: 'Confirmée',    cssClass: 'statut-confirmed' },
      SHIPPED:     { label: 'Expédiée',     cssClass: 'statut-shipped' },
      DELIVERED:   { label: 'Livrée',       cssClass: 'statut-delivered' },
      CANCELLED:   { label: 'Annulée',      cssClass: 'statut-cancelled' },
    };
    return map[status] ?? { label: status, cssClass: '' };
  }

  pagePrecedente(): void {
    if (this.pageActuelle > 0) {
      this.pageActuelle--;
      this.chargerCommandes();
    }
  }

  pageSuivante(): void {
    if (this.pageActuelle < this.totalPages - 1) {
      this.pageActuelle++;
      this.chargerCommandes();
    }
  }
}
