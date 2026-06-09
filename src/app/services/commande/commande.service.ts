import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environements/environement';
import { Commande, PageCommande } from '../../Modeles/commande.model';

/**
 * CommandeService handles all HTTP calls related to orders.
 *
 * Endpoints:
 *   POST   /api/commandes/passer?adresseLivraison=...  -> place an order
 *   GET    /api/commandes/mes-commandes?page=0&size=10 -> paginated list (user)
 *   PUT    /api/commandes/{id}/annuler                 -> cancel an order
 *   GET    /api/commandes/{id}                         -> order details
 *   GET    /api/commandes/statut/{statut}?page=0&size=10 -> filter by status (admin)
 *   PUT    /api/commandes/{id}/statut?newStatus=X      -> change status (admin)
 */
@Injectable({
  providedIn: 'root',
})
export class CommandeService {
  private apiUrl = `${environment.apiBaseUrl}/api/commandes`;

  constructor(private http: HttpClient) {}

  /**
   * Places an order from the current user's cart.
   * The backend automatically empties the cart afterwards.
   * @param adresseLivraison - delivery address
   */
  passerCommande(adresseLivraison: string): Observable<Commande> {
    const params = new HttpParams().set('adresseLivraison', adresseLivraison);
    return this.http.post<Commande>(`${this.apiUrl}/passer`, {}, { params });
  }

  /**
   * Gets the logged-in user's orders (paginated).
   * @param page - page number (starts at 0)
   * @param size - number of items per page
   */
  getMesCommandes(page = 0, size = 10): Observable<PageCommande> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageCommande>(`${this.apiUrl}/mes-commandes`, { params });
  }

  /**
   * Cancels an order (only possible when status is PENDING).
   * @param id - order id
   */
  annulerCommande(id: number): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/annuler`, {});
  }

  /**
   * Gets an order by its ID.
   * @param id - order id
   */
  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  // ---- Admin-only methods ----

  /**
   * Gets all orders filtered by status (admin only).
   * @param statut - PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
   * @param page   - page number
   * @param size   - page size
   */
  getCommandesParStatut(statut: string, page = 0, size = 20): Observable<PageCommande> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageCommande>(`${this.apiUrl}/statut/${statut}`, { params });
  }

  /**
   * Gets all orders not yet delivered (PENDING + CONFIRMED + SHIPPED) (admin only).
   * @param page - page number
   * @param size - page size
   */
  getCommandesNonLivrees(page = 0, size = 20): Observable<PageCommande> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageCommande>(`${this.apiUrl}/non-livrees`, { params });
  }

  /**
   * Changes the status of an order (admin only).
   * @param id        - order id
   * @param newStatus - new status
   */
  changerStatut(id: number, newStatus: string): Observable<Commande> {
    const params = new HttpParams().set('newStatus', newStatus);
    return this.http.put<Commande>(`${this.apiUrl}/${id}/statut`, {}, { params });
  }
}
