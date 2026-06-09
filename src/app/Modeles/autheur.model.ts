import { Livre } from './livre.model';

export interface Autheur {
  id?: number;
  nom: string;
  prenom: string;
  livres?: Livre[];
}
