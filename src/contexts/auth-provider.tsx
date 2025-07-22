
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { getUserByEmail, createUser, updateUser } from '@/lib/data-services/users';
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
    const checkUserSession = async () => {
      try {
        const storedUserJSON = localStorage.getItem('bhashaSetuUser');
        if (storedUserJSON) {
          const storedUser = JSON.parse(storedUserJSON);
          const freshUser = await getUserByEmail(storedUser.email);
          if (freshUser) {
            setUser({ ...freshUser, sessionId: storedUser.sessionId });
          } else {
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
    };
    checkUserSession();
  }, []);
  
  // Session validation effect for multi-device logout
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && user.email && user.sessionId) {
        const serverUser = await getUserByEmail(user.email);
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


  const login = useCallback(async (email: string, name?: string) => {
    const userToLogin = await getUserByEmail(email);

    if (userToLogin) {
      const sessionId = `session-${Date.now()}`;
      const userWithSession = { ...userToLogin, sessionId };

      await updateUser(userToLogin.id, { sessionId });
      
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

  const signup = useCallback(async (name: string, email: string, role: 'user' | 'admin') => {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please login instead.",
            variant: "destructive",
        });
        return;
    }
    
    const newUser = await createUser({ name, email, role });
    
    if (newUser) {
      // Log in the new user immediately
      setUser(newUser);
      localStorage.setItem('bhashaSetuUser', JSON.stringify(newUser));
      router.push('/dashboard');
    } else {
       toast({
        title: "Signup Failed",
        description: "Could not create a new user account.",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
