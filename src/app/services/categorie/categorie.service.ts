import { Injectable } from '@angular/core';
import { environment } from '../../../environements/environement';
import { Categorie } from '../../Modeles/categorie.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class CategorieService {
  
  constructor( private httpclient : HttpClient) {}

  private apiUrl = environment.apiBaseUrl + '/api/categories';

  // Recuperer tous les livres
  getCategories(): Observable<Categorie[]> {
    return this.httpclient.get<Categorie[]>(this.apiUrl + '/all');
  }

  // Ajouter un nouveau livre
  createCategorie(cat: Categorie): Observable<Categorie> {
    return this.httpclient.post<Categorie>(this.apiUrl + '/create', cat);
  }
}
