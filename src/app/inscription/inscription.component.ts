import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../environements/environement';

@Component({
  selector: 'app-inscription',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.css',
})
export class InscriptionComponent {
  // Champs du formulaire (liés au template avec [(ngModel)])
  email = '';
  password = '';
  confirmPassword = '';
  nom = '';
  prenom = '';
  adresse = '';
  datenaissance = '';

  // Messages affichés à l'utilisateur
  message = '';  // message de succès
  error = '';    // message d'erreur
  isLoading = false;

  // URL construite depuis l'environnement (ne jamais coder l'URL en dur !)
  private registerUrl = `${environment.apiBaseUrl}/api/user/register`;

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Vérifie que tous les champs sont remplis et que les mots de passe concordent.
   * Retourne TRUE si tout est OK, FALSE sinon (et remplit this.error).
   */
  private validerFormulaire(): boolean {
    this.message = '';
    this.error = '';

    if (!this.nom || !this.prenom || !this.email || !this.datenaissance || !this.password || !this.confirmPassword) {
      this.error = 'Tous les champs obligatoires (*) doivent être remplis.';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return false;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères.';
      return false;
    }

    return true; // tout est valide
  }

  register(): void {
    // IMPORTANT : on valide d'abord, et si invalide on s'arrête ici avec "return"
    // Avant ce bug était absent : l'inscription continuait même avec des erreurs
    if (!this.validerFormulaire()) {
      return;
    }

    this.isLoading = true;

    // Objet envoyé au backend Spring Boot
    const user = {
      email: this.email,
      password: this.password,
      nom: this.nom,
      prenom: this.prenom,
      adresse: this.adresse,
      // IMPORTANT : le backend attend "dateNaissance" (camelCase) — pas "datenaissance"
      dateNaissance: this.datenaissance,
    };

    this.http.post(this.registerUrl, user).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = 'Inscription réussie ! Redirection vers la connexion...';
        // Redirige automatiquement vers /login après 2 secondes
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        // On affiche le message du backend si disponible, sinon un message générique
        this.error = err.error?.message || 'Erreur lors de l\'inscription. Vérifiez vos informations.';
        console.error('Erreur inscription:', err);
      },
    });
  }
}
