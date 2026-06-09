import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environements/environement';
import { Panier, PanierItem } from '../../Modeles/panier.model';

/**
 * PanierService handles all HTTP calls related to the shopping cart.
 *
 * Endpoints:
 *   GET    /api/panier                            -> get the cart
 *   POST   /api/panier/ajouter?livreId=X&quantite=Y -> add a book
 *   PUT    /api/panier/modifier/{id}?quantite=X   -> update quantity
 *   DELETE /api/panier/supprimer/{id}             -> remove one item
 *   DELETE /api/panier/vider                      -> empty the cart
 *
 * Also exposes cartCount$ for the navbar badge.
 */
@Injectable({
  providedIn: 'root',
})
export class PanierService {
  private apiUrl = `${environment.apiBaseUrl}/api/panier`;

  // BehaviorSubject for cart item count - navbar subscribes to display the badge
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Gets the cart for the logged-in user.
   * Also updates the navbar badge count.
   */
  getPanier(): Observable<Panier> {
    return this.http.get<Panier>(this.apiUrl).pipe(
      tap((panier) => this.updateCartCount(panier))
    );
  }

  /**
   * Adds a book to the cart.
   * @param livreId  - the book's ID
   * @param quantite - quantity to add
   */
  ajouterAuPanier(livreId: number, quantite: number): Observable<PanierItem> {
    const params = new HttpParams()
      .set('livreId', livreId.toString())
      .set('quantite', quantite.toString());
    return this.http.post<PanierItem>(`${this.apiUrl}/ajouter`, {}, { params });
  }

  /**
   * Updates the quantity of a cart item.
   * @param itemId   - the PanierItem id
   * @param quantite - new quantity
   */
  modifierQuantite(itemId: number, quantite: number): Observable<PanierItem> {
    const params = new HttpParams().set('quantite', quantite.toString());
    return this.http.put<PanierItem>(`${this.apiUrl}/modifier/${itemId}`, {}, { params });
  }

  /**
   * Removes one item from the cart.
   * @param itemId - the PanierItem id to remove
   */
  supprimerItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/supprimer/${itemId}`);
  }

  /**
   * Empties the whole cart.
   * Also resets the navbar badge to 0.
   */
  viderPanier(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vider`).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }

  /**
   * Updates the navbar badge count from a Panier object.
   * Sums all item quantities.
   */
  updateCartCount(panier: Panier | null): void {
    if (!panier || !panier.items) {
      this.cartCountSubject.next(0);
      return;
    }
    const total = panier.items.reduce((sum, item) => sum + item.quantite, 0);
    this.cartCountSubject.next(total);
  }

  /** Resets the badge to 0 (after logout or order placement) */
  resetCartCount(): void {
    this.cartCountSubject.next(0);
  }
}
