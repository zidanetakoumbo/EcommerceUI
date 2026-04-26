
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environements/environement';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiBaseUrl+'/api/connexion/login'

  constructor(private http: HttpClient) {}

  // connexion via l'api pour la connexion 
  login(email: string, password: string): Observable<any> {

      return this.http.post<any>(this.apiUrl, {email, password});
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userName');
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
