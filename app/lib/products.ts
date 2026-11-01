'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import type {
  Category,
  PaginatedProductsResponse,
  Product,
  ProductQuery,
} from './api-types';

const DEFAULT_API_URL = 'http://localhost:3001/api/v1';

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
  return url.replace(/\/+$/, '');
}

const FETCH_TIMEOUT_MS = 10000;

async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${getApiUrl()}${path.startsWith('/') ? path : `/${path}`}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getProducts(
  query: ProductQuery = {},
): Promise<PaginatedProductsResponse> {
  cacheLife('minutes');
  cacheTag('products');

  const searchParams = new URLSearchParams();
  if (query.page) searchParams.set('page', String(query.page));
  if (query.limit) searchParams.set('limit', String(query.limit));
  if (query.categoryId) searchParams.set('categoryId', query.categoryId);
  if (query.search) searchParams.set('q', query.search);

  const search = searchParams.toString();

  try {
    return await fetchJson<PaginatedProductsResponse>(
      `/products${search ? `?${search}` : ''}`,
    );
  } catch {
    return {
      data: [],
      meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  cacheLife('minutes');
  cacheTag('products', `product-${slug}`);

  try {
    return await fetchJson<Product>(`/products/slug/${slug}`);
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  cacheLife('hours');
  cacheTag('categories');

  try {
    return await fetchJson<Category[]>('/categories');
  } catch {
    return [];
  }
}
