
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
    const userToLogin: UserProfile | undefined = samplePlatformUsers.find(
      (u) => u.email === email
    );

    if (!userToLogin) {
      toast({
        title: "Login Failed",
        description: "User not found. Please check your email or sign up.",
        variant: "destructive",
      });
      return;
    }

    // User found, proceed with login
    const sessionId = `session-${Date.now()}`;
    const userWithSession: UserProfile = { ...userToLogin, sessionId: sessionId };

    // Update the session ID in the in-memory store for multi-device detection
    const userIndex = samplePlatformUsers.findIndex(u => u.id === userToLogin.id);
    if (userIndex !== -1) {
        samplePlatformUsers[userIndex] = userWithSession;
    }

    // Set state and local storage with the correct user data
    setUser(userWithSession);
    localStorage.setItem('bhashaSetuUser', JSON.stringify(userWithSession));
    router.push('/dashboard');
    
  }, [router, toast]);

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
    
    const newUser = ensureFullUserProfile({
        id: Date.now().toString(),
        email,
        name,
        role, // The role from the form is used here.
        sessionId: `session-${Date.now()}`,
    });
    
    samplePlatformUsers.push(newUser);
    
    // Log in the new user immediately
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
