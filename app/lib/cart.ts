import { apiFetch } from './api';
import type { Cart, CartItem } from './api-types';

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

/** Reads the cart of the signed in customer. The session cookie is sent
 * automatically by the browser because apiFetch uses credentials: 'include'. */
export function fetchCart(): Promise<Cart> {
  return apiFetch<Cart>('/cart');
}

/**
 * Adds a product to the cart. The API answers with the full cart so the
 * caller can synchronise state without an extra round-trip.
 */
export function addToCart(
  input: AddToCartInput,
): Promise<Cart> {
  return apiFetch<Cart>('/cart/add', {
    method: 'POST',
    body: JSON.stringify({
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
    }),
  });
}

/** Updates the quantity of a cart item. Returns the full cart. */
export function updateCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<Cart> {
  return apiFetch<Cart>(`/cart/item/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

/** Removes a single item from the cart. Returns the full cart. */
export function removeCartItem(
  itemId: string,
): Promise<Cart> {
  return apiFetch<Cart>(`/cart/item/${itemId}`, {
    method: 'DELETE',
  });
}

/** Removes every item from the cart. Returns the empty cart. */
export function clearCart(): Promise<Cart> {
  return apiFetch<Cart>('/cart/clear', {
    method: 'DELETE',
  });
}

/** The sum of all cart lines in minor units. */
export function cartSubtotal(items: CartItem[] = []): number {
  return items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
}

/** The number of pieces in the cart, it drives the badge in the header. */
export function cartItemCount(items: CartItem[] = []): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
