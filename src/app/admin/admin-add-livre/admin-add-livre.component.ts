import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LivreService } from '../../services/livre/livre.service';
import { Livre } from '../../Modeles/livre.model';
import { CommonModule } from '@angular/common';
import { CategorieService } from '../../services/categorie/categorie.service';
import { Observable } from 'rxjs';
import { Categorie } from '../../Modeles/categorie.model';
import { Autheur } from '../../Modeles/autheur.model';
import { AutheurService } from '../../services/autheur/autheur.service';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-add-livre',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './admin-add-livre.component.html',
  styleUrls: ['./admin-add-livre.component.css'],
})
export class AdminAddLivreComponent implements OnInit {

  livreForm!: FormGroup;
  isEditMode = false;
  livreId?: number;
  imagePreview: string | ArrayBuffer | null = '';

  // Observables des listes déroulantes
  categories$!: Observable<Categorie[]>;
  autheursList: Autheur[] = [];           // liste complète des auteurs
  auteursListFiltered: Autheur[] = [];    // liste filtrée selon la saisie
  selectedAutheur?: Autheur;             // auteur sélectionné dans l'autocomplete

  // Messages de feedback
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private livreService: LivreService,
    private catServ: CategorieService,
    private authServ: AutheurService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Si un ID est dans l'URL (/admin/livres/update/42), on est en mode édition
    this.livreId = this.route.snapshot.params['id'];
    if (this.livreId) {
      this.isEditMode = true;
      this.loadLivre(this.livreId);
    }
  }

  initForm(): void {
    // FormBuilder.group() crée un FormGroup avec des validators
    // [valeurInitiale, [validators]] pour chaque champ
    this.livreForm = this.fb.group({
      titre:          ['', [Validators.required, Validators.minLength(2)]],
      autheur:        ['', Validators.required],
      prix:           [0, [Validators.required, Validators.min(0.01)]],
      quantiteStock:  [1, [Validators.required, Validators.min(0)]],  // ← champ ajouté
      categories:     ['', Validators.required],
      resume:         ['', Validators.required],
      openCouverture: [''],  // facultatif : on génère un placeholder si vide
    });

    // Charge les catégories depuis l'API (retourne un Observable)
    this.categories$ = this.catServ.getCategories();

    // Charge les auteurs et stocke la liste pour l'autocomplete
    this.authServ.getAutheurs().subscribe((data) => {
      this.autheursList = data;
      this.auteursListFiltered = data;
    });
  }

  /** Filtre la liste d'auteurs selon ce que l'utilisateur tape */
  filter(value: string): void {
    const terme = value.toLowerCase();
    this.auteursListFiltered = this.autheursList.filter((auth) =>
      `${auth.nom} ${auth.prenom}`.toLowerCase().includes(terme)
    );
  }

  /**
   * displayFn : utilisé par MatAutocomplete pour convertir un objet Autheur
   * en texte affiché dans le champ (ex: "Dupont Marie")
   */
  displayFn(auth: Autheur): string {
    return auth ? `${auth.nom} ${auth.prenom}` : '';
  }

  /** Appelé quand l'utilisateur sélectionne un auteur dans la liste déroulante */
  onSelectedAutheur(event: MatAutocompleteSelectedEvent): void {
    // event.option.value contient l'objet Autheur complet (défini dans le template)
    this.selectedAutheur = event.option.value as Autheur;
  }

  /** Appelé à chaque frappe dans le champ auteur pour filtrer la liste */
  onSearch(event: Event): void {
    const valeur = (event.target as HTMLInputElement).value;
    this.filter(valeur);
  }

  /** Charge les données d'un livre existant dans le formulaire (mode édition) */
  loadLivre(id: number): void {
    this.livreService.getLivreById(id).subscribe((livre) => {
      if (!livre) return;

      // patchValue met à jour uniquement les champs du formulaire présents dans l'objet
      this.livreForm.patchValue({
        titre:          livre.titre,
        prix:           livre.prix,
        quantiteStock:  livre.quantiteStock,
        resume:         livre.resume,
        openCouverture: livre.openCouverture,
        // Pour la catégorie, on met l'ID de la première catégorie (select simple)
        categories:     livre.categories?.length ? livre.categories[0].id : '',
        // Pour l'auteur, on met l'objet Autheur complet (displayFn l'affiche correctement)
        autheur:        livre.autheur,
      });

      this.selectedAutheur = livre.autheur;
      this.imagePreview = livre.openCouverture;
    });
  }

  /** Met à jour l'aperçu de couverture quand l'URL change */
  onImageChange(event: Event): void {
    const url = (event.target as HTMLInputElement).value;
    if (url) this.imagePreview = url;
  }

  onSubmit(): void {
    if (this.livreForm.invalid) {
      // Marque tous les champs comme "touchés" pour déclencher l'affichage des erreurs
      this.livreForm.markAllAsTouched();
      return;
    }

    // On reconstruit l'objet Livre à envoyer au backend
    // "as Livre" indique à TypeScript que l'objet respecte l'interface Livre
    const livreData = {
      titre:          this.livreForm.value.titre,
      prix:           this.livreForm.value.prix,
      quantiteStock:  this.livreForm.value.quantiteStock,
      resume:         this.livreForm.value.resume,
      openCouverture: this.livreForm.value.openCouverture || '',
      // On envoie l'objet auteur complet sélectionné (Spring Boot le reconnaît par id)
      autheur:        this.selectedAutheur,
      categories:     [] as Categorie[],
    };

    // On récupère la catégorie sélectionnée depuis la liste
    this.categories$.subscribe((categories) => {
      const catId = this.livreForm.get('categories')?.value;
      const cat = categories.find(c => c.id == catId);
      if (cat) livreData.categories.push(cat);

      if (this.isEditMode && this.livreId) {
        // Mode édition : PUT /api/livres/{id}
        this.livreService.updateLivre(this.livreId, livreData as Livre).subscribe({
          next: () => this.router.navigate(['/admin/livres/list']),
          error: (err) => {
            this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour.';
          }
        });
      } else {
        // Mode création : POST /api/livres
        this.livreService.createLivre(livreData as Livre).subscribe({
          next: () => this.router.navigate(['/admin/livres/list']),
          error: (err) => {
            this.errorMessage = err.error?.message || 'Erreur lors de la création.';
          }
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/livres/list']);
  }
}
