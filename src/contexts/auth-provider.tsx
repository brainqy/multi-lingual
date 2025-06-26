
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { samplePlatformUsers, ensureFullUserProfile } from '@/lib/sample-data'; // Import server-side data and helper
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  signup: (name: string, email: string, role: 'user' | 'admin') => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bhashaSetuUser');
    if (!pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('bhashaSetuUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUser(null);
      localStorage.removeItem('bhashaSetuUser');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Session validation effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && user.id && user.sessionId) {
        const serverUser = samplePlatformUsers.find(u => u.id === user.id);
        if (serverUser && serverUser.sessionId !== user.sessionId) {
          toast({
            title: "Session Expired",
            description: "You have been logged out because you signed in on another device.",
            variant: "destructive",
            duration: 7000,
          });
          logout();
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user, logout, toast]);


  const login = useCallback((email: string, name?: string) => {
    const sessionId = `session-${Date.now()}`;
    let userToLogin: UserProfile | undefined = samplePlatformUsers.find(u => u.email === email);
    let userToStore: UserProfile;
    
    if (userToLogin) {
      // User exists. Update their session ID and use their existing data.
      userToStore = { ...userToLogin, sessionId };
      const userIndex = samplePlatformUsers.findIndex(u => u.id === userToLogin!.id);
      if(userIndex !== -1) {
        samplePlatformUsers[userIndex] = userToStore;
      }
    } else {
      // User does not exist, create a new one with 'user' role by default.
      userToStore = ensureFullUserProfile({
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        role: 'user',
        sessionId: sessionId,
      });
      samplePlatformUsers.push(userToStore);
    }
    
    setUser(userToStore);
    localStorage.setItem('bhashaSetuUser', JSON.stringify(userToStore));
    router.push('/dashboard');

  }, [router]);

  const signup = useCallback((name: string, email: string, role: 'user' | 'admin') => {
    const existingUser = samplePlatformUsers.find(u => u.email === email);
    if (existingUser) {
        toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please login instead.",
            variant: "destructive",
        });
        return;
    }
    
    const sessionId = `session-${Date.now()}`;
    const newUser = ensureFullUserProfile({
        id: Date.now().toString(),
        email,
        name,
        role,
        sessionId,
    });
    
    samplePlatformUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('bhashaSetuUser', JSON.stringify(newUser));
    router.push('/dashboard');
  }, [router, toast]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
