// Models for orders - matches Spring Boot CommandDto / CommandItemDto

/**
 * One order line (a book with its quantity and unit price).
 * Maps to CommandItemDto on the Spring Boot side.
 */
export interface CommandeItem {
  id: number;
  livreId: number;
  titreLivre: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
}

/**
 * A full order with all its lines.
 * Maps to CommandDto on the Spring Boot side.
 *
 * Possible statuses:
 *   PENDING   - waiting for processing
 *   CONFIRMED - confirmed by admin
 *   SHIPPED   - shipped
 *   DELIVERED - delivered
 *   CANCELLED - cancelled
 */
export interface Commande {
  id: number;
  userId: string;
  userNom: string;
  dateCommande: string;
  dateExpedition?: string;
  dateLivraison?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalPrice: number;
  adresseLivraison: string;
  items: CommandeItem[];
}

/**
 * Paginated response from Spring Boot (Page<CommandDto>).
 * Used for /mes-commandes and /statut/{statut} endpoints.
 */
export interface PageCommande {
  content: Commande[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
