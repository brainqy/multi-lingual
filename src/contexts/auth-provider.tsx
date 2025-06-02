// src/contexts/auth-provider.tsx
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, name?: string, role?: 'user' | 'admin') => void;
  logout: () => void;
  signup: (name: string, email: string, role: 'user' | 'admin') => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth status from localStorage or an API
    const storedUser = localStorage.getItem('bhashaSetuUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, name?: string, role: 'user' | 'admin' = 'user') => {
    // In a real app, this would involve an API call
    const loggedInUser: User = { id: Date.now().toString(), email, name: name || email.split('@')[0], role };
    setUser(loggedInUser);
    localStorage.setItem('bhashaSetuUser', JSON.stringify(loggedInUser));
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bhashaSetuUser');
    router.push('/');
  }, [router]);

  const signup = useCallback((name: string, email: string, role: 'user' | 'admin') => {
    // In a real app, this would involve an API call
    const newUser: User = { id: Date.now().toString(), email, name, role };
    setUser(newUser);
    localStorage.setItem('bhashaSetuUser', JSON.stringify(newUser));
    router.push('/dashboard');
  }, [router]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
