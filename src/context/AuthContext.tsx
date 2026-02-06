'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isApprover: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Initialize cookie for middleware
      document.cookie = `token=${storedToken}; path=/; max-age=604800`;
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authAPI.login({ username, password });
    const { access_token, user: userData } = response;
    
    // Set state
    setToken(access_token);
    setUser(userData);
    
    // Set localStorage
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set cookie for middleware to read
    document.cookie = `token=${access_token}; path=/; max-age=604800`; // 7 days
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isApprover = user?.role === 'APPROVER' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin, isApprover }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
