import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../environements/environement';

/**
 * Page Profil :
 * - Affiche les informations de l'utilisateur connecté
 * - Permet de les modifier (nom, prénom, adresse)
 * - Utilise GET /api/user/profil et PUT /api/user/profil
 */
@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css',
})
export class ProfilComponent implements OnInit {

  // Données du profil (chargées depuis l'API)
  profil: any = null;
  isLoading = true;
  isEditing = false;    // true quand on est en mode édition
  isSaving = false;     // true pendant la sauvegarde

  // Messages de feedback
  successMessage = '';
  errorMessage = '';

  // Copie temporaire des données en cours d'édition
  editData: any = {};

  private profilUrl = `${environment.apiBaseUrl}/api/user/profil`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerProfil();
  }

  /** Charge le profil de l'utilisateur connecté depuis l'API */
  chargerProfil(): void {
    this.isLoading = true;
    this.http.get<any>(this.profilUrl).subscribe({
      next: (data) => {
        this.profil = data;
        // On garde une copie pour l'édition
        this.editData = { ...data };
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger votre profil.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  /** Passe en mode édition */
  activerEdition(): void {
    // Remet la copie d'édition à jour avec les données actuelles
    this.editData = { ...this.profil };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  /** Annule l'édition sans sauvegarder */
  annulerEdition(): void {
    this.isEditing = false;
    this.editData = { ...this.profil }; // remet les données initiales
  }

  /** Sauvegarde les modifications via PUT /api/user/profil */
  sauvegarder(): void {
    if (!this.editData.nom || !this.editData.prenom) {
      this.errorMessage = 'Le nom et le prénom sont obligatoires.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    // On envoie uniquement les champs modifiables
    const donnees = {
      nom:           this.editData.nom,
      prenom:        this.editData.prenom,
      adresse:       this.editData.adresse || '',
      dateNaissance: this.editData.dateNaissance || '',
    };

    this.http.put<any>(this.profilUrl, donnees).subscribe({
      next: (profilMisAJour) => {
        this.profil = profilMisAJour;
        this.editData = { ...profilMisAJour };
        this.isSaving = false;
        this.isEditing = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la sauvegarde.';
      }
    });
  }
}
