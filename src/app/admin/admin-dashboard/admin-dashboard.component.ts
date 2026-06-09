import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommandeService } from '../../services/commande/commande.service';
import { LivreService } from '../../services/livre/livre.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  username: string | null;

  // ===== KPIs (Key Performance Indicators) =====
  commandesEnAttente = 0;   // commandes à traiter (statut PENDING)
  totalLivres = 0;           // nombre de livres dans le catalogue
  commandesLivreesTotal = 0; // total des commandes livrées
  chiffreAffaireMois = 0;    // CA du mois en cours (commandes DELIVERED ce mois-ci)

  isLoading = true;
  erreur: string | null = null;

  constructor(
    private auth: AuthService,
    private commandeService: CommandeService,
    private livreService: LivreService
  ) {
    this.username = auth.getUserName();
  }

  ngOnInit(): void {
    this.chargerStatistiques();
  }

  chargerStatistiques(): void {
    this.isLoading = true;
    this.erreur = null;

    // 1. Charger les livres (comptage du catalogue)
    this.livreService.getLivres().subscribe({
      next: (livres) => {
        this.totalLivres = livres.length;
        // 2. Après les livres, charger les commandes en attente
        this.chargerCommandesEnAttente();
      },
      error: () => {
        this.erreur = 'Impossible de charger les statistiques.';
        this.isLoading = false;
      }
    });
  }

  /** Charge le nombre de commandes en attente (statut PENDING) */
  private chargerCommandesEnAttente(): void {
    // page=0, size=1 : on ne veut que le totalElements, pas le contenu
    this.commandeService.getCommandesParStatut('PENDING', 0, 1).subscribe({
      next: (page) => {
        this.commandesEnAttente = page.totalElements;
        // 3. Après ça, charger les commandes livrées pour le CA
        this.chargerCommandesLivrees();
      },
      error: () => {
        // Si erreur sur les commandes, on affiche quand même les livres
        this.isLoading = false;
      }
    });
  }

  /** Charge les commandes livrées pour calculer le chiffre d'affaires du mois */
  private chargerCommandesLivrees(): void {
    // On charge jusqu'à 200 commandes DELIVERED (assez pour calculer le CA)
    this.commandeService.getCommandesParStatut('DELIVERED', 0, 200).subscribe({
      next: (page) => {
        this.commandesLivreesTotal = page.totalElements;

        // Calculer le premier jour du mois en cours
        const maintenant = new Date();
        const premierJourDuMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

        // Filtrer les commandes de ce mois et sommer leurs totaux
        this.chiffreAffaireMois = page.content
          .filter(cmd => new Date(cmd.dateCommande) >= premierJourDuMois)
          .reduce((somme, cmd) => somme + cmd.totalPrice, 0);

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
