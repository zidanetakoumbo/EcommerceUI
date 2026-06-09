import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CritereLivreFilter } from '../Modeles/critere.model';
import { CategorieService } from '../services/categorie/categorie.service';
import { Categorie } from '../Modeles/categorie.model';

/**
 * Composant de filtrage des livres.
 * Il est utilisé à la fois dans le catalogue public et dans l'interface admin.
 *
 * @Output filterChange : événement émis vers le composant PARENT chaque fois que
 * l'utilisateur modifie un filtre. Le parent reçoit un objet CritereLivreFilter.
 *
 * Exemple d'utilisation dans le catalogue :
 *   <app-livre-filter (filterChange)="appliquerFiltre($event)"></app-livre-filter>
 */
@Component({
  selector: 'app-livre-filter',
  imports: [FormsModule, CommonModule],
  templateUrl: './livre-filter.component.html',
  styleUrl: './livre-filter.component.css'
})
export class LivreFilterComponent implements OnInit {

  // @Output() crée un "événement personnalisé" qu'on peut écouter depuis le template parent
  // EventEmitter<T> est le type Angular pour émettre des événements typés
  @Output() filterChange = new EventEmitter<CritereLivreFilter>();

  // Valeurs initiales des filtres
  // maxPrix à 500 pour ne pas filtrer par défaut (couvre tous les livres du catalogue)
  filters: CritereLivreFilter = {
    titre: '',
    autheur: '',
    categorie: '',
    maxPrix: 500,
  };

  // Liste des catégories chargées depuis l'API pour le <select>
  categriesList: Categorie[] = [];

  constructor(private catServ: CategorieService) {}

  ngOnInit(): void {
    // On charge les catégories au démarrage du composant pour remplir la liste déroulante
    this.catServ.getCategories().subscribe({
      next: (data) => {
        this.categriesList = data;
      },
      error: (err) => {
        // En cas d'erreur réseau, la liste reste vide : l'utilisateur voit juste "Toutes les catégories"
        console.error('Erreur lors du chargement des catégories', err);
      }
    });
  }

  /**
   * Envoie les filtres actuels au composant parent via l'EventEmitter.
   * On spread les filters { ...this.filters } pour envoyer une COPIE,
   * car en JavaScript les objets sont passés par référence.
   * Sans le spread, le parent recevrait une référence au même objet
   * et verrait toutes les modifications futures sans re-déclencher ngOnChanges.
   */
  sendFilters(): void {
    this.filterChange.emit({ ...this.filters });
  }

  /**
   * Réinitialise tous les filtres à leur valeur initiale,
   * puis envoie les filtres vides au parent pour réafficher tous les livres.
   */
  reset(): void {
    this.filters = { titre: '', autheur: '', categorie: '', maxPrix: 500 };
    this.sendFilters();
  }
}
