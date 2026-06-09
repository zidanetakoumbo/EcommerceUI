import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LivreService } from '../services/livre/livre.service';
import { Livre } from '../Modeles/livre.model';

interface RecommendationResult {
  livre: Livre;
  score: number;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css'],
})
export class RecommendationsComponent implements OnInit {
  description = '';
  allBooks: Livre[] = [];
  results: RecommendationResult[] = [];
  loading = false;
  message = 'Écrivez quelques phrases pour trouver des livres proches de vos intérêts.';

  constructor(private livreService: LivreService) {}

  ngOnInit(): void {
    this.livreService.getLivres().subscribe({
      next: (data) => {
        this.allBooks = data;
      },
      error: (err) => {
        console.error('Erreur chargement des livres pour recommandations', err);
        this.message = 'Impossible de charger les livres. Réessayez plus tard.';
      },
    });
  }

  generateRecommendations(): void {
    const descriptionText = this.description.trim();
    if (!descriptionText) {
      this.message = 'Veuillez décrire ce que vous recherchez avant de lancer la recommandation.';
      this.results = [];
      return;
    }

    this.loading = true;
    setTimeout(() => {
      this.results = this.computeRecommendations(descriptionText);
      this.loading = false;
      if (this.results.length === 0) {
        this.message = 'Aucun livre trouvé avec la description fournie. Essayez d\'autres mots clés.';
      } else {
        this.message = `Résultats basés sur votre description : ${this.results.length} livre(s) trouvés.`;
      }
    }, 300);
  }

  private computeRecommendations(description: string): RecommendationResult[] {
    const normalizedDescription = this.normalizeText(description);
    const queryWords = this.uniqueWords(normalizedDescription);

    const scored = this.allBooks
      .map((livre) => {
        const score = this.computeScore(livre, queryWords);
        return { livre, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return scored;
  }

  private computeScore(livre: Livre, queryWords: string[]): number {
    const corpus = this.normalizeText([
      livre.titre,
      livre.autheur?.nom,
      livre.autheur?.prenom,
      livre.resume,
      ...(livre.categories || []).map((cat) => cat.nomCat),
    ].join(' '));

    const matches = queryWords.filter((word) => corpus.includes(word));
    const uniqueMatches = Array.from(new Set(matches));
    return queryWords.length ? Math.round((uniqueMatches.length / queryWords.length) * 100) : 0;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private uniqueWords(text: string): string[] {
    return Array.from(new Set(text.split(' ').filter((word) => word.length > 2)));
  }
}
