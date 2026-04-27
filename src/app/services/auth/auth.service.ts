
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environements/environement';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiBaseUrl+'/api/connexion/login'

  // 1. On crée le "sujet" qui contient l'état (true = connecté, false = déconnecté)
  // On l'initialise en vérifiant si un token existe déjà dans le localStorage
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  // 2. On expose cet état sous forme d'Observable pour que les composants puissent "l'écouter"
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  // connexion via l'api pour la connexion 
  login(email: string, password: string): Observable<any> {

      return this.http.post<any>(this.apiUrl, {email, password});
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
  // 3. Méthode pour mettre à jour l'état
  setLoggedIn(value: boolean) {
    this.isLoggedInSubject.next(value);
  }

  logout() {
    localStorage.clear() // je supprime toutes les données enregistrées
    this.setLoggedIn(false); // On prévient tout le monde qu'on est déconnecté
    /*localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userName');*/
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getEmail(): string | null {
    return localStorage.getItem('email');
  }
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }
}
