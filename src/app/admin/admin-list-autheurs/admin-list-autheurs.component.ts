import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Autheur } from '../../Modeles/autheur.model';
import { AutheurService } from '../../services/autheur/autheur.service';

@Component({
  selector: 'app-admin-list-autheurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-list-autheurs.component.html',
  styleUrls: ['./admin-list-autheurs.component.css'],
})
export class AdminListAutheursComponent implements OnInit {
  autheurs: Autheur[] = [];
  autheursFiltres: Autheur[] = [];
  recherche = '';

  constructor(private autheurService: AutheurService) {}

  ngOnInit(): void {
    this.chargerAutheurs();
  }

  chargerAutheurs(): void {
    this.autheurService.getAutheurs().subscribe({
      next: (data) => {
        this.autheurs = data;
        this.autheursFiltres = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des auteurs', err);
      },
    });
  }

  appliquerFiltre(): void {
    const terme = this.recherche.trim().toLowerCase();
    this.autheursFiltres = this.autheurs.filter((autheur) =>
      `${autheur.nom} ${autheur.prenom}`.toLowerCase().includes(terme),
    );
  }

  supprimerAutheur(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet auteur ?')) {
      this.autheurService.supprimerAutheur(id).subscribe({
        next: () => this.chargerAutheurs(),
        error: (err) => console.error('Erreur suppression auteur', err),
      });
    }
  }
}
