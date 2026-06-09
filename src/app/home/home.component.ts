import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { LivreService } from '../services/livre/livre.service';
import { CouvertureService } from '../services/couverture/couverture.service';
import { Livre } from '../Modeles/livre.model';

interface Advantage {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  userName: Signal<string | null>;
  userEmail: Signal<string | null>;
  isLogged: Signal<boolean>;
  featuredBooks: Livre[] = [];
  private auth = inject(AuthService);
  private livreService = inject(LivreService);
  private couvertureService = inject(CouvertureService);

  advantages: Advantage[] = [
    {
      title: 'Recommandations personnalisées',
      description: 'Des livres choisis pour vous, selon vos intérêts.',
      icon: 'bi bi-stars',
    },
    {
      title: 'Navigation rapide',
      description: 'Accédez facilement au catalogue, aux auteurs et à votre compte.',
      icon: 'bi bi-box-arrow-in-right',
    },
    {
      title: 'Interface claire',
      description: 'Une expérience simple et fluide pour retrouver vos livres.',
      icon: 'bi bi-phone',
    },
  ];

  constructor() {
    this.isLogged = toSignal(this.auth.isLoggedIn$, { initialValue: false });
    this.userName = computed(() => (this.isLogged() ? this.auth.getUserName() : null));
    this.userEmail = computed(() => (this.isLogged() ? this.auth.getEmail() : null));
  }

  ngOnInit(): void {
    this.loadFeaturedBooks();
  }

  private loadFeaturedBooks(): void {
    this.livreService.getLivres().subscribe({
      next: (books) => {
        this.featuredBooks = books.slice(0, 5);
        // Charger les couvertures manquantes
        this.chargerCouverturesManquantes();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des livres', err);
      },
    });
  }

  private chargerCouverturesManquantes(): void {
    this.featuredBooks.forEach((livre) => {
      if (!livre.openCouverture || livre.openCouverture.trim() === '') {
        this.couvertureService
          .getCouverture(livre.titre, `${livre.autheur.prenom} ${livre.autheur.nom}`)
          .subscribe({
            next: (url) => {
              if (url) {
                livre.openCouverture = url;
              }
            },
            error: (err) => {
              console.warn(`Couverture non trouvée pour "${livre.titre}"`);
            },
          });
      }
    });
  }
}
