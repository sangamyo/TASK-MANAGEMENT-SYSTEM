"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, logoutUser, refreshSession, registerUser } from '@/lib/auth';
import { registerAuthRefreshHandler } from '@/lib/api';
import { setAccessToken } from '@/lib/tokenStore';
import type { User } from '@/types';
import { toast } from 'sonner';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');

  const handleAuthSuccess = useCallback((payload: { user: User; accessToken: string }) => {
    setUser(payload.user);
    setToken(payload.accessToken);
    setAccessToken(payload.accessToken);
    setStatus('authenticated');
  }, []);

  const login = useCallback(async (input: { email: string; password: string }) => {
    setStatus('loading');
    try {
      const data = await loginUser(input);
      handleAuthSuccess(data);
    } catch (error) {
      setStatus('unauthenticated');
      throw error;
    }
  }, [handleAuthSuccess]);

  const register = useCallback(async (input: { name: string; email: string; password: string }) => {
    setStatus('loading');
    try {
      const data = await registerUser(input);
      handleAuthSuccess(data);
    } catch (error) {
      setStatus('unauthenticated');
      throw error;
    }
  }, [handleAuthSuccess]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await refreshSession();
      handleAuthSuccess(data);
    } catch {
      setStatus('unauthenticated');
      setUser(null);
      setToken(null);
      setAccessToken(null);
    }
  }, [handleAuthSuccess]);

  const logout = useCallback(async () => {
    setStatus('loading');
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setToken(null);
      setAccessToken(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    setStatus('loading');
    refresh().catch(() => setStatus('unauthenticated'));
  }, [refresh]);

  useEffect(() => {
    registerAuthRefreshHandler((payload) => {
      handleAuthSuccess(payload);
      toast.success('Session refreshed');
    });
  }, [handleAuthSuccess]);

  const value = useMemo(
    () => ({ user, accessToken, status, login, register, logout, refresh }),
    [user, accessToken, status, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
