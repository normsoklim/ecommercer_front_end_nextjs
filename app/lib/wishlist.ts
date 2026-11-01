import { apiFetch } from './api';
import type { Wishlist, WishlistItem } from './api-types';

export interface AddToWishlistInput {
  productId: string;
}

/** Reads the wishlist of the signed in customer. The session cookie is sent
 * automatically by the browser because apiFetch uses credentials: 'include'. */
export function fetchWishlist(): Promise<Wishlist> {
  return apiFetch<Wishlist>('/wishlist');
}

/** Adds a product to the wishlist. */
export function addToWishlist(
  input: AddToWishlistInput,
): Promise<WishlistItem> {
  return apiFetch<WishlistItem>('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify({
      productId: input.productId,
    }),
  });
}

/** Removes a product from the wishlist. */
export function removeFromWishlist(
  productId: string,
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/wishlist/item/${productId}`, {
    method: 'DELETE',
  });
}
