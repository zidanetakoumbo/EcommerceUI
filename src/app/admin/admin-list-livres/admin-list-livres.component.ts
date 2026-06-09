import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LivreService } from '../../services/livre/livre.service';
import { Livre } from '../../Modeles/livre.model';
import { LivreFilterComponent } from '../../livre-filter/livre-filter.component';
import { RouterLink } from '@angular/router';
import { CritereLivreFilter } from '../../Modeles/critere.model';

@Component({
  selector: 'app-admin-list-livres',
  standalone: true,
  imports: [CommonModule, LivreFilterComponent, RouterLink],
  templateUrl: './admin-list-livres.component.html',
  styleUrl: './admin-list-livres.component.css',
})
export class AdminListLivresComponent implements OnInit {
  livres: Livre[] = [];        // tous les livres
  livresFiltres: Livre[] = []; // livres après filtrage
  currentPage = 1;
  itemsPerPage = 10;

  // Nombre total de pages (recalculé à chaque changement de livresFiltres)
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.livresFiltres.length / this.itemsPerPage));
  }

  // Tableau de numéros de page : [1, 2, 3, ...]
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Sous-liste des livres à afficher pour la page courante
  get livresPage(): Livre[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    // .slice(start, start + itemsPerPage) extrait les livres de la page courante
    return this.livresFiltres.slice(start, start + this.itemsPerPage);
  }

  constructor(private livreServ: LivreService) {}

  ngOnInit(): void {
    this.chargerLivres();
  }

  chargerLivres(): void {
    this.livreServ.getLivres().subscribe({
      next: (data) => {
        this.livres = data;
        this.livresFiltres = data;
        this.currentPage = 1;
      },
      error: (err) => {
        console.error('Erreur chargement des livres', err);
      },
    });
  }

  supprimerLivre(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce livre ?')) {
      this.livreServ.supprimerLivre(id).subscribe({
        next: () => this.chargerLivres(),
        error: (err) => console.error('Erreur suppression', err),
      });
    }
  }

  previousPage(): void { this.setPage(this.currentPage - 1); }
  nextPage(): void     { this.setPage(this.currentPage + 1); }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Filtre les livres selon les critères reçus du composant LivreFilter
  appliquerFiltre(criteres: CritereLivreFilter): void {
    this.livresFiltres = this.livres.filter((livre) => {
      const matchTitre = criteres.titre
        ? livre.titre.toLowerCase().includes(criteres.titre.toLowerCase())
        : true;

      const matchAutheur = criteres.autheur
        ? `${livre.autheur.nom} ${livre.autheur.prenom}`.toLowerCase().includes(criteres.autheur.toLowerCase())
        : true;

      // === compare la valeur ET le type (plus sûr que ==)
      const matchCat = !criteres.categorie
        || livre.categories.some(cat => cat.nomCat.toLowerCase() === criteres.categorie.toLowerCase());

      const matchPrice = livre.prix <= criteres.maxPrix;

      return matchTitre && matchAutheur && matchCat && matchPrice;
    });
    this.currentPage = 1; // retour à la page 1 après filtrage
  }

  /**
   * Retourne l'URL de la couverture à afficher dans le tableau.
   * Utilise openCouverture du livre, sinon une image placeholder générique.
   */
  getCouverture(livre: Livre): string {
    if (livre.openCouverture && !livre.openCouverture.startsWith('data:image')) {
      return livre.openCouverture;
    }
    return `https://placehold.co/50x70/e9ecef/6c757d?text=${encodeURIComponent(livre.titre.slice(0,2))}`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.src = 'https://placehold.co/45x65/e9ecef/6c757d?text=?';
  }
}
