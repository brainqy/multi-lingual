
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
      const storedUserJSON = localStorage.getItem('bhashaSetuUser');
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON);
        // Re-validate user from our "database" to prevent stale roles
        const freshUser = samplePlatformUsers.find(u => u.id === storedUser.id);
        if (freshUser) {
          // If the user still exists, use the fresh data from the source
          // and just keep the session ID from the stored data.
          setUser({ ...freshUser, sessionId: storedUser.sessionId });
        } else {
          // User doesn't exist anymore, clear session
          setUser(null);
          localStorage.removeItem('bhashaSetuUser');
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUser(null);
      localStorage.removeItem('bhashaSetuUser');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Session validation effect for multi-device logout
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
    }, 10000); 

    return () => clearInterval(interval);
  }, [user, logout, toast]);


  const login = useCallback((email: string, name?: string) => {
    const userToLogin = samplePlatformUsers.find(u => u.email === email);

    if (userToLogin) {
      const sessionId = `session-${Date.now()}`;
      const userWithSession = { ...userToLogin, sessionId };

      const userIndex = samplePlatformUsers.findIndex(u => u.id === userToLogin.id);
      if (userIndex > -1) {
        samplePlatformUsers[userIndex] = userWithSession;
      }
      
      setUser(userWithSession);
      localStorage.setItem('bhashaSetuUser', JSON.stringify(userWithSession));
      router.push('/dashboard');
      toast({ title: "Login Successful", description: `Welcome back, ${userToLogin.name}!` });
    } else {
      toast({
        title: "Login Failed",
        description: "User not found. Please check your email or sign up.",
        variant: "destructive",
      });
    }
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
        role, 
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
