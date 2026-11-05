'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './auth-context';
import {
  addToCart,
  cartItemCount,
  cartSubtotal,
  clearCart as clearCartRequest,
  fetchCart,
  removeCartItem,
  updateCartItemQuantity,
  type AddToCartInput,
} from './cart';
import { ApiError, prefetchCsrfToken } from './api';
import type { Cart, CartItem } from './api-types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  addItem: (input: AddToCartInput) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  /** True while an add-to-cart request for the given product is in flight. */
  isAdding: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartState {
  /** The token the items belong to, a cart of another customer is never shown. */
  token: string | null;
  items: CartItem[];
}

const EMPTY_CART: CartState = { token: null, items: [] };

/** Removes duplicate cart items by id, keeping the last occurrence. Guards
 * against React duplicate-key errors if the server ever returns the same
 * cart item id more than once. */
function dedupeItems(items: CartItem[]): CartItem[] {
  const seen = new Map<string, CartItem>();
  for (const item of items) {
    seen.set(item.id, item);
  }
  return [...seen.values()];
}

/** Loads the cart of a customer, a failing request results in an empty cart. */
async function loadCart(): Promise<CartState> {
  try {
    const cart = await fetchCart();
    return { token: 'cart', items: cart?.items ?? [] };
  } catch (err) {
    console.error('Failed to load the cart', err);
    return { token: 'cart', items: [] };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [state, setState] = useState<CartState>(EMPTY_CART);
  // The token the cart was loaded for, it doubles as the loading flag.
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mirrors the latest committed items so rollback can restore them without
  // relying on a stale closure over the `items` state value.
  const itemsRef = useRef<CartItem[]>([]);

  // Tracks products currently being added, prevents duplicate requests for the
  // same product while one is already in flight.
  const addingRef = useRef<Set<string>>(new Set());

  const items =
    state.token === 'cart' ? dedupeItems(state.items ?? []) : EMPTY_CART.items;

  // Keep the ref in sync with the committed state.
  itemsRef.current = items;

  const refresh = useCallback(async () => {
    const next = await loadCart();
    setState(next);
    setLoadedToken('cart');
  }, []);

  const isLoading = loadedToken !== 'cart';

  // The cart belongs to a customer, it is loaded as soon as the session is
  // known.
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;

    loadCart().then((next) => {
      if (cancelled) {
        return;
      }

      setState(next);
      setLoadedToken('cart');
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  // Pre-fetch the CSRF token as soon as the provider mounts so the first
  // state-changing request (e.g. add-to-cart) does not block on an extra
  // round-trip to /csrf/token.
  useEffect(() => {
    prefetchCsrfToken();
  }, []);

  const addItem = useCallback(
    async (input: AddToCartInput) => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to add items to your cart.');
      }

      // Duplicate-click protection: ignore if this product is already being added.
      if (addingRef.current.has(input.productId)) {
        return;
      }
      addingRef.current.add(input.productId);

      setError(null);

      // Snapshot the current items so we can roll back on failure.
      const previousItems = [...itemsRef.current];

      // --- Optimistic update: show the item immediately ---
      setState((prev) => {
        if (prev.token !== 'cart') {
          return prev;
        }

        const variantKey = input.variantId ?? null;
        const existing = prev.items.find(
          (item) => item.productId === input.productId && item.variantId === variantKey,
        );

        const optimisticItem: CartItem = {
          id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          cartId: 'optimistic',
          productId: input.productId,
          variantId: variantKey,
          quantity: input.quantity,
          unitPrice: existing?.unitPrice ?? 0,
          product: existing?.product,
          variant: existing?.variant,
        };

        const nextItems = existing
          ? prev.items.map((item) =>
              item.productId === input.productId && item.variantId === variantKey
                ? { ...item, quantity: item.quantity + input.quantity }
                : item
            )
          : [...prev.items, optimisticItem];

        return { ...prev, items: nextItems };
      });

      try {
        // Persist the change on the backend. The server returns the full cart.
        const cart = await addToCart(input);

        // Replace optimistic state with the server's cart.
        setState({
          token: 'cart',
          items: cart.items,
        });
      } catch (err) {
        // --- Roll back the optimistic change ---
        setState({ token: 'cart', items: previousItems });

        const message =
          err instanceof Error ? err.message : 'Could not add the item to the cart.';
        setError(message);
        throw err;
      } finally {
        addingRef.current.delete(input.productId);
      }
    },
    [isAuthenticated],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to change your cart.');
      }

      setError(null);

      const previousItems = [...itemsRef.current];

      // Optimistic update for quantity changes.
      setState((prev) => {
        if (prev.token !== 'cart') {
          return prev;
        }
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      });

      try {
        const cart = await updateCartItemQuantity(itemId, quantity);

        // Reconcile with the server's cart. Guard against a missing items
        // array (e.g. if the backend returns a partial payload) by falling
        // back to an empty array so the cart UI never crashes.
        setState({
          token: 'cart',
          items: cart.items ?? [],
        });
      } catch (err) {
        // If the item is already gone on the server (404), just sync with the
        // server instead of surfacing an error to the user.
        if (err instanceof ApiError && err.status === 404) {
          await refresh();
          return;
        }
        // Roll back the optimistic change.
        setState({ token: 'cart', items: previousItems });

        const message =
          err instanceof Error ? err.message : 'Could not update the cart item.';
        setError(message);
        throw err;
      }
    },
    [isAuthenticated, refresh],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to change your cart.');
      }

      setError(null);

      const previousItems = [...itemsRef.current];

      // Optimistic update: remove the item immediately.
      setState((prev) => {
        if (prev.token !== 'cart') {
          return prev;
        }
        return {
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
        };
      });

      try {
        const cart = await removeCartItem(itemId);

        // Reconcile with the server's cart. Guard against a missing items
        // array (e.g. if the backend returns a partial payload) by falling
        // back to an empty array so the cart UI never crashes.
        setState({
          token: 'cart',
          items: cart.items ?? [],
        });
      } catch (err) {
        // If the item is already gone on the server (404), just sync with the
        // server instead of surfacing an error to the user.
        if (err instanceof ApiError && err.status === 404) {
          await refresh();
          return;
        }
        // Roll back the optimistic change.
        setState({ token: 'cart', items: previousItems });

        const message =
          err instanceof Error ? err.message : 'Could not remove the item.';
        setError(message);
        throw err;
      }
    },
    [isAuthenticated, refresh],
  );

  const clear = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setError(null);

    const previousItems = [...itemsRef.current];

    setState({ token: 'cart', items: [] });

    try {
      const cart = await clearCartRequest();

      // Reconcile with the server's cart.
      setState({
        token: 'cart',
        items: cart.items,
      });
    } catch (err) {
      setState({ token: 'cart', items: previousItems });

      const message =
        err instanceof Error ? err.message : 'Could not empty the cart.';
      setError(message);
      throw err;
    }
  }, [isAuthenticated]);

  const clearError = useCallback(() => setError(null), []);

  const isAdding = useCallback(
    (productId: string) => addingRef.current.has(productId),
    [],
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      itemCount: cartItemCount(items),
      subtotal: cartSubtotal(items),
      isLoading: authLoading || isLoading,
      isAuthenticated,
      error,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      refresh,
      clearError,
      isAdding,
    }),
    [
      items,
      authLoading,
      isLoading,
      isAuthenticated,
      error,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      refresh,
      clearError,
      isAdding,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
