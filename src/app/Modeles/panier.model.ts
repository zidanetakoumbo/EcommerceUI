// Models for the shopping cart - matches Spring Boot PanierDto / PanierItemDto

/**
 * One item in the cart (a book + quantity).
 * Maps to PanierItemDto on the Spring Boot side.
 */
export interface PanierItem {
  id: number;
  livreId: number;
  titreLivre: string;
  prixUnitaire: number;
  quantite: number;
  prixTotal: number;
}

/**
 * The full cart for the logged-in user.
 * Maps to PanierDto on the Spring Boot side.
 */
export interface Panier {
  id: number;
  userId: string;
  items: PanierItem[];
  totalPrice: number;
}
