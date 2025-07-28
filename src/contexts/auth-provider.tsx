
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, Wallet } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { loginUser, signupUser, validateSession } from '@/lib/actions/auth';
import { getWallet } from '@/lib/actions/wallet';

interface AuthContextType {
  user: UserProfile | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, role: 'user' | 'admin', password?: string) => Promise<void>;
  isLoading: boolean;
  refreshWallet: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchWalletForUser = useCallback(async (userId: string) => {
    const walletData = await getWallet(userId);
    setWallet(walletData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setWallet(null);
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
          const freshUser = await validateSession(storedUser.email, storedUser.sessionId);
          if (freshUser) {
            setUser(freshUser);
            await fetchWalletForUser(freshUser.id);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, [logout, fetchWalletForUser]);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && user.email && user.sessionId) {
        const serverUser = await validateSession(user.email, user.sessionId);
        if (!serverUser) {
          toast({
            title: "Session Expired",
            description: "You have been logged out because you signed in on another device or your session ended.",
            variant: "destructive",
            duration: 7000,
          });
          logout();
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user, logout, toast]);


  const login = useCallback(async (email: string, password?: string) => {
    try {
      const userToLogin = await loginUser(email, password || "mock_password");

      if (userToLogin) {
        setUser(userToLogin);
        await fetchWalletForUser(userToLogin.id);
        localStorage.setItem('bhashaSetuUser', JSON.stringify(userToLogin));
        router.push('/dashboard');
        toast({ title: "Login Successful", description: `Welcome back, ${userToLogin.name}!` });
      } else {
        toast({
          title: "Login Failed",
          description: "User not found or password incorrect. Please check your credentials or sign up.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: "Login Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  }, [router, toast, fetchWalletForUser]);

  const signup = useCallback(async (name: string, email: string, role: 'user' | 'admin', password?: string) => {
    try {
        if (!password) {
            throw new Error("Password is required for signup.");
        }
        const result = await signupUser({ name, email, role, password });
        
        if (result.success && result.user) {
          setUser(result.user);
          await fetchWalletForUser(result.user.id);
          localStorage.setItem('bhashaSetuUser', JSON.stringify(result.user));
          router.push('/dashboard');
          toast({
            title: "Signup Successful!",
            description: `Welcome, ${name}! Your account has been created.`,
          });
        } else {
           toast({
            title: result.error === "Account Exists" ? "Account Exists" : "Signup Failed",
            description: result.message || "Could not create a new user account.",
            variant: "destructive",
          });
        }
    } catch (error) {
        console.error("Signup error:", error);
        toast({ title: "Signup Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  }, [router, toast, fetchWalletForUser]);

  const refreshWallet = useCallback(async () => {
    if (user) {
      await fetchWalletForUser(user.id);
    }
  }, [user, fetchWalletForUser]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, wallet, isAuthenticated, isAdmin, login, logout, signup, isLoading, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
}
