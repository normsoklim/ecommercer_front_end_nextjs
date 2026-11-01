const DEFAULT_API_URL = 'http://localhost:3000/api/v1';

function getApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;

  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  return url.replace(/\/+$/, '');
}

/** Error thrown when the API answers with a non 2xx status. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Reads the human readable reason out of a NestJS error payload so the
 * customer sees "User with this email already exists" instead of a bare
 * "409 Conflict".
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();

    if (body && typeof body === 'object') {
      const { message } = body as { message?: unknown };

      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }

      if (Array.isArray(message)) {
        const joined = message
          .filter((item): item is string => typeof item === 'string')
          .join(', ');

        if (joined.length > 0) {
          return joined;
        }
      }
    }
  } catch {
    // The body is not JSON, fall back to the generic message below.
  }

  return `API request failed: ${response.status} ${response.statusText}`;
}

/**
 * CSRF token cache. Populated on first use by ensureCsrfToken() and cleared
 * when the server rejects it (403 Forbidden).
 */
let csrfToken: string | null = null;

/**
 * Fetches a CSRF token from the backend and caches it. The backend sets the
 * csrf-token HttpOnly cookie and returns the token value in the response body.
 */
async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await fetch(`${getApiUrl()}/csrf/token`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  const body = await response.json();
  csrfToken = body.csrfToken as string;
  return csrfToken;
}

/**
 * Kicks off a CSRF token pre-fetch so the token is cached before the first
 * state-changing request (e.g. add-to-cart). Safe to call multiple times;
 * subsequent calls are no-ops once the token is cached.
 *
 * Call this early (e.g. on app mount) to eliminate the extra round-trip that
 * would otherwise block the first add-to-cart request.
 */
export function prefetchCsrfToken(): void {
  void ensureCsrfToken().catch((err) => {
    console.warn('Failed to pre-fetch CSRF token:', err);
  });
}

/**
 * Base fetch wrapper. `credentials: 'include'` makes sure the HTTP-only
 * cookies (access_token, refresh_token) are sent with every request so the
 * session survives page refreshes.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isStateChanging = init?.method
    ? !['GET', 'HEAD', 'OPTIONS'].includes(init.method.toUpperCase())
    : false;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(init?.headers as Record<string, string>),
  };

  if (isStateChanging) {
    headers['X-CSRF-Token'] = await ensureCsrfToken();
  }

  const response = await fetch(
    `${getApiUrl()}${path.startsWith('/') ? path : `/${path}`}`,
    {
      ...init,
      credentials: 'include',
      headers,
    },
  );

  // If the CSRF token was rejected, clear the cache and retry once.
  if (response.status === 403 && isStateChanging) {
    csrfToken = null;
    headers['X-CSRF-Token'] = await ensureCsrfToken();

    const retryResponse = await fetch(
      `${getApiUrl()}${path.startsWith('/') ? path : `/${path}`}`,
      {
        ...init,
        credentials: 'include',
        headers,
      },
    );

    if (!retryResponse.ok) {
      throw new ApiError(await readErrorMessage(retryResponse), retryResponse.status);
    }

    return retryResponse.json() as Promise<T>;
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: (endpoint: string) => apiFetch<unknown>(endpoint),
  post: (endpoint: string, body: unknown) =>
    apiFetch<unknown>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body: unknown) =>
    apiFetch<unknown>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint: string, body: unknown) =>
    apiFetch<unknown>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string) =>
    apiFetch<unknown>(endpoint, { method: 'DELETE' }),
};

// Auth-specific API methods
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: string;
  emailVerified?: string | null;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  rememberMe?: boolean;
  expiresInMs?: number;
}

export interface RegisterResponse {
  user: AuthUser;
  requiresVerification: boolean;
  email: string;
  expiresInSeconds: number;
}

export interface SendVerificationCodeResponse {
  message: string;
  verified: boolean;
  expiresAt?: string;
  expiresInSeconds: number;
}

export interface VerifyEmailResponse {
  verified: boolean;
  email: string;
  status: string;
}

export const authApi = {
  register: (data: RegisterData) =>
    apiFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: LoginData) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe === true,
      }),
    }),
  sendVerificationCode: (email: string) =>
    apiFetch<SendVerificationCodeResponse>('/auth/email/verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyEmail: (email: string, code: string) =>
    apiFetch<VerifyEmailResponse>('/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
  /**
   * Logs out by revoking the server side session. The access token is no
   * longer sent in an Authorization header; the backend reads the refresh
   * token from the HTTP-only cookie.
   */
  logout: () =>
    apiFetch('/auth/logout', {
      method: 'POST',
    }),
  /**
   * Returns the profile of the authenticated user. The access token is read
   * from the HTTP-only cookie by the backend.
   */
  getProfile: () =>
    apiFetch<AuthUser>('/auth/profile', {
      method: 'GET',
    }),
  /**
   * Updates the profile of the authenticated user (firstName, lastName, phone).
   */
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string | null }) =>
    apiFetch<AuthUser>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  /**
   * Exchanges the refresh token (read from the HTTP-only cookie) for a new
   * access token. No body is needed.
   */
  refresh: () =>
    apiFetch<{ accessToken: string; refreshToken: string; expiresInMs: number }>('/auth/refresh', {
      method: 'POST',
    }),
};
