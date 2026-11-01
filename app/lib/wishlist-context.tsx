'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './auth-context';
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
  type AddToWishlistInput,
} from './wishlist';
import type { WishlistItem } from './api-types';

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  addItem: (input: AddToWishlistInput) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistState {
  token: string | null;
  items: WishlistItem[];
}

const EMPTY_WISHLIST: WishlistState = { token: null, items: [] };

async function loadWishlist(): Promise<WishlistState> {
  try {
    const wishlist = await fetchWishlist();
    return { token: 'wishlist', items: wishlist?.items ?? [] };
  } catch (err) {
    console.error('Failed to load the wishlist', err);
    return { token: 'wishlist', items: [] };
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [state, setState] = useState<WishlistState>(EMPTY_WISHLIST);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items =
    state.token === 'wishlist' ? state.items : EMPTY_WISHLIST.items;

  const refresh = useCallback(async () => {
    const next = await loadWishlist();
    setState(next);
    setLoadedToken('wishlist');
  }, []);

  const isLoading = loadedToken !== 'wishlist';

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;

    loadWishlist().then((next) => {
      if (cancelled) {
        return;
      }

      setState(next);
      setLoadedToken('wishlist');
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  const addItem = useCallback(
    async (input: AddToWishlistInput) => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to add items to your wishlist.');
      }

      setError(null);

      try {
        await addToWishlist(input);
        await refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not add the item to the wishlist.';
        setError(message);
        throw err;
      }
    },
    [isAuthenticated, refresh],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to change your wishlist.');
      }

      setError(null);

      try {
        await removeFromWishlist(productId);
        await refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not remove the item from the wishlist.';
        setError(message);
        throw err;
      }
    },
    [isAuthenticated, refresh],
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<WishlistContextType>(
    () => ({
      items,
      itemCount: items.length,
      isLoading: authLoading || isLoading,
      isAuthenticated,
      error,
      addItem,
      removeItem,
      refresh,
      clearError,
    }),
    [
      items,
      authLoading,
      isLoading,
      isAuthenticated,
      error,
      addItem,
      removeItem,
      refresh,
      clearError,
    ],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
}
