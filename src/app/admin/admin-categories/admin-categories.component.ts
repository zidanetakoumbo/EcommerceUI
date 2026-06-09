import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorie/categorie.service';
import { Categorie } from '../../Modeles/categorie.model';

/**
 * Composant de gestion des catégories (section admin).
 *
 * Le backend expose :
 *   GET  /api/categories/all     → liste toutes les catégories
 *   POST /api/categories/create  → crée une nouvelle catégorie
 *
 * Note : le backend n'a pas d'endpoint DELETE ou PUT pour les catégories,
 * donc on peut seulement lister et ajouter (pas modifier ni supprimer).
 */
@Component({
  selector: 'app-admin-categories',
  standalone: true,
  // CommonModule : nécessaire pour *ngIf, *ngFor, AsyncPipe
  // FormsModule  : nécessaire pour [(ngModel)] dans le formulaire d'ajout
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css'],
})
export class AdminCategoriesComponent implements OnInit {

  // Liste de toutes les catégories chargées depuis l'API
  categories: Categorie[] = [];
  isLoading = true;

  // Champ de saisie pour le nom de la nouvelle catégorie (lié avec [(ngModel)])
  nomNouvelleCategorie = '';

  // État du bouton "Ajouter" (true pendant l'appel HTTP)
  isAdding = false;

  // Messages de feedback à afficher à l'utilisateur
  successMessage = '';
  errorMessage = '';

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    // Charger la liste des catégories au démarrage
    this.chargerCategories();
  }

  /** Charge toutes les catégories depuis l'API GET /api/categories/all */
  chargerCategories(): void {
    this.isLoading = true;

    this.categorieService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les catégories.';
        this.isLoading = false;
        console.error('Erreur chargement catégories', err);
      }
    });
  }

  /**
   * Crée une nouvelle catégorie via POST /api/categories/create.
   * Le backend n'a besoin que du champ "nomCat".
   */
  ajouterCategorie(): void {
    // Validation côté client avant d'appeler l'API
    if (!this.nomNouvelleCategorie.trim()) {
      this.errorMessage = 'Le nom de la catégorie est obligatoire.';
      return;
    }

    this.isAdding = true;
    this.errorMessage = '';

    // On construit l'objet à envoyer.
    // "as any" est utilisé car l'interface Categorie a "id" obligatoire,
    // mais le backend génère l'id automatiquement et ignore celui qu'on envoie.
    const payload = {
      nomCat: this.nomNouvelleCategorie.trim()
    };

    this.categorieService.createCategorie(payload as Categorie).subscribe({
      next: () => {
        this.isAdding = false;
        this.nomNouvelleCategorie = ''; // Vider le champ après succès
        this.successMessage = 'Catégorie ajoutée avec succès !';
        // Effacer le message après 3 secondes (setTimeout : exécuté une seule fois)
        setTimeout(() => this.successMessage = '', 3000);
        // Recharger la liste pour voir la nouvelle catégorie
        this.chargerCategories();
      },
      error: (err) => {
        this.isAdding = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création.';
        console.error('Erreur création catégorie', err);
      }
    });
  }
}
