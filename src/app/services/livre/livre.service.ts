import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Livre } from '../../Modeles/livre.model';
import { environment } from '../../../environements/environement';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LivreService {
  // L'URL de base est maintenant simplement /api/livres
  private apiUrl = `${environment.apiBaseUrl}/api/livres`;

  constructor(private http: HttpClient) {}

  // GET /api/livres
  getLivres(): Observable<Livre[]> {
    return this.http.get<Livre[]>(this.apiUrl);
  }

  // GET /api/livres/:id
  getLivreById(id: number): Observable<Livre> {
    return this.http.get<Livre>(`${this.apiUrl}/${id}`);
  }

  // POST /api/livres
  createLivre(livre: Livre): Observable<Livre> {
    //console.log("api create livre =")
    //console.log(livre)
    return this.http.post<Livre>(this.apiUrl, livre);
  }

  // PUT /api/livres/:id
  updateLivre(id: number, livre: Livre): Observable<Livre> {
    return this.http.put<Livre>(`${this.apiUrl}/${id}`,livre);
  }

  // DELETE /api/livres/:id
  supprimerLivre(id: number): Observable<void> {
    // Le backend renvoie 204 No Content, donc on attend un Observable<void>
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}