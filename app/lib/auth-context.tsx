'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  authApi,
  type AuthUser,
  type RegisterResponse,
  type SendVerificationCodeResponse,
  type VerifyEmailResponse,
} from './api';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<RegisterResponse>;
  verifyEmail: (email: string, code: string) => Promise<VerifyEmailResponse>;
  resendVerificationCode: (
    email: string,
  ) => Promise<SendVerificationCodeResponse>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Fired when the session is written or cleared inside the same tab. */
const SESSION_CHANGED_EVENT = 'storefront:session-changed';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restores the session after a page refresh. The access token lives in an
   * HTTP-only cookie so JavaScript cannot read it. We call /auth/profile to
   * check whether the session is still valid. If the access token expired we
   * call /auth/refresh to rotate it and retry /auth/profile.
   */
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const profile = await authApi.getProfile();
        if (!cancelled) {
          setUser(profile);
        }
      } catch (error) {
        // The access token may have expired, try to refresh it.
        try {
          await authApi.refresh();
          const profile = await authApi.getProfile();
          if (!cancelled) {
            setUser(profile);
          }
        } catch {
          // The refresh session is invalid or expired, the user must log in
          // again. No redirect here so the caller can show a loading state.
          if (!cancelled) {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthenticated = !!user;

  const login = useCallback(
    async (email: string, password: string, rememberMe?: boolean) => {
      const response = await authApi.login({ email, password, rememberMe });

      setUser(response.user);
      setIsLoading(false);

      // Notify other components in the same tab that the session changed.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
      }
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    await authApi.refresh();
    const profile = await authApi.getProfile();
    setUser(profile);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
    }
  }, []);

  const updateProfile = useCallback(
    async (data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
    }): Promise<AuthUser> => {
      const updated = await authApi.updateProfile(data);
      setUser(updated);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
      }

      return updated;
    },
    [],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
    ): Promise<RegisterResponse> => {
      return authApi.register({ email, password, firstName, lastName });
    },
    [],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string): Promise<VerifyEmailResponse> => {
      return authApi.verifyEmail(email, code);
    },
    [],
  );

  const resendVerificationCode = useCallback(
    async (email: string): Promise<SendVerificationCodeResponse> => {
      return authApi.sendVerificationCode(email);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors, the session is cleared regardless.
    }

    setUser(null);
    setIsLoading(false);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    resendVerificationCode,
    refreshSession,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
