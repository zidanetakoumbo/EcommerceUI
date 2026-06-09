import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environements/environement';

/**
 * AuthService handles everything related to authentication:
 *  - login / logout
 *  - token storage in localStorage
 *  - fetching user profile (roles)
 *  - exposing login state to components
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = `${environment.apiBaseUrl}/api/connexion/login`;
  private profilUrl = `${environment.apiBaseUrl}/api/user/profil`;

  // BehaviorSubject: an Observable with memory - it remembers the last value.
  // Initialized by checking if a token already exists (handles page reload).
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  // Public Observable that components can subscribe to
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Sends email + password to the API and returns the token.
   * API responds: { token, email, userName }
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginUrl, { email, password });
  }

  /**
   * Fetches the full profile of the logged-in user.
   * API returns: { id, nom, prenom, email, roles: ['ROLE_ADMIN', 'ROLE_USER'], ... }
   * Saves isAdmin and userId to localStorage.
   */
  fetchProfil(): Observable<any> {
    // tap() lets us run a side-effect without transforming the value
    return this.http.get<any>(this.profilUrl).pipe(
      tap((profil) => {
        const isAdmin = profil.roles?.includes('ROLE_ADMIN') ?? false;
        localStorage.setItem('isAdmin', isAdmin.toString());
        if (profil.id) {
          localStorage.setItem('userId', profil.id);
        }
      })
    );
  }

  /** Checks that a token exists in localStorage */
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  /** Updates the login state (called after login/logout) */
  setLoggedIn(value: boolean) {
    this.isLoggedInSubject.next(value);
  }

  /** Logout: clears localStorage and notifies components */
  logout() {
    localStorage.clear();
    this.setLoggedIn(false);
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

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  /** Returns true if the logged-in user is an admin */
  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }
}
