
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname

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
  const pathname = usePathname(); // Get current path

  useEffect(() => {
    const storedUser = localStorage.getItem('bhashaSetuUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, name?: string, role: 'user' | 'admin' = 'user') => {
    const loggedInUser: User = { id: Date.now().toString(), email, name: name || email.split('@')[0], role };
    setUser(loggedInUser);
    localStorage.setItem('bhashaSetuUser', JSON.stringify(loggedInUser));
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bhashaSetuUser');
    // If already on an auth page, no need to push, otherwise push to login
    if (!pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }
  }, [router, pathname]);

  const signup = useCallback((name: string, email: string, role: 'user' | 'admin') => {
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
