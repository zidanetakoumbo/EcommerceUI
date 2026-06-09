import { Autheur } from './autheur.model';
import { Categorie } from './categorie.model';

export interface Livre {
  id: number;
  titre: string;
  autheur: Autheur;
  prix: number;
  categories: Categorie[];
  outDate: string;
  resume: string;
  openCouverture: string;
  closeCouverture: string;
  // Stock : nombre d'exemplaires disponibles (géré côté backend)
  quantiteStock: number;
  // Nombre d'exemplaires vendus (info statistique)
  quantiteVendue: number;
}
