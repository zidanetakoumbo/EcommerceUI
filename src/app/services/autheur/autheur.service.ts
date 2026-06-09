import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environements/environement';
import { Observable } from 'rxjs';
import { Autheur } from '../../Modeles/autheur.model';

@Injectable({
  providedIn: 'root',
})
export class AutheurService {
  private apiUrl = environment.apiBaseUrl + '/api/autheurs';

  constructor(private httpclient: HttpClient) {}

  getAutheurs(): Observable<Autheur[]> {
    return this.httpclient.get<Autheur[]>(`${this.apiUrl}/all`);
  }

  getAutheurById(id: number): Observable<Autheur> {
    return this.httpclient.get<Autheur>(`${this.apiUrl}/${id}`);
  }

  createAutheur(autheur: Autheur): Observable<Autheur> {
    return this.httpclient.post<Autheur>(`${this.apiUrl}/create`, autheur);
  }

  updateAutheur(id: number, autheur: Autheur): Observable<Autheur> {
    return this.httpclient.put<Autheur>(`${this.apiUrl}/update/${id}`, autheur);
  }

  supprimerAutheur(id: number): Observable<void> {
    return this.httpclient.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
