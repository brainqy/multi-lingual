
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, Wallet } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { loginUser, signupUser, validateSession } from '@/lib/actions/auth';
import { getWallet } from '@/lib/actions/wallet';
import { differenceInCalendarDays } from 'date-fns';
import { updateUser } from '@/lib/data-services/users';
import { checkAndAwardBadges } from '@/lib/actions/gamification';

interface AuthContextType {
  user: UserProfile | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string, tenantId?: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, role: 'user' | 'admin', password?: string, tenantId?: string) => Promise<void>;
  isLoading: boolean;
  refreshWallet: () => Promise<void>;
  isStreakPopupOpen: boolean;
  setStreakPopupOpen: (isOpen: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreakPopupOpen, setStreakPopupOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchWalletForUser = useCallback(async (userId: string) => {
    const walletData = await getWallet(userId);
    setWallet(walletData);
  }, []);
  
  const handleStreakAndBadges = async (userToUpdate: UserProfile): Promise<UserProfile> => {
      const today = new Date();
      const lastLogin = userToUpdate.lastLogin ? new Date(userToUpdate.lastLogin) : new Date(0);
      const daysSinceLastLogin = differenceInCalendarDays(today, lastLogin);
      
      let updatedUserData: Partial<UserProfile> = {};

      if (daysSinceLastLogin > 0) { // Only update if it's a new day
          setStreakPopupOpen(true); // Show popup on new day login
          let newStreak = userToUpdate.dailyStreak || 0;
          let newLongestStreak = userToUpdate.longestStreak || 0;
          let newStreakFreezes = userToUpdate.streakFreezes || 0;

          if (daysSinceLastLogin === 1) {
              newStreak++;
          } else if (daysSinceLastLogin > 1) {
              if (newStreakFreezes > 0) {
                  newStreakFreezes--; // Use a freeze
                  toast({ title: "Streak Saved!", description: `You used a free pass to protect your ${newStreak}-day streak.` });
              } else {
                  newStreak = 1; // Reset streak
              }
          }
          if (newStreak > newLongestStreak) {
              newLongestStreak = newStreak;
          }
          
          const STREAK_MILESTONES = [7, 14, 30];
          if (STREAK_MILESTONES.includes(newStreak)) {
            newStreakFreezes++;
            toast({
              title: "Streak Milestone Achieved!",
              description: `You've reached a ${newStreak}-day streak and earned a Free Pass!`
            });
          }
          
          updatedUserData = { 
              ...updatedUserData,
              dailyStreak: newStreak, 
              longestStreak: newLongestStreak,
              streakFreezes: newStreakFreezes,
              lastLogin: today.toISOString() 
          };
      }
      
      if (Object.keys(updatedUserData).length > 0) {
        const updatedUser = await updateUser(userToUpdate.id, updatedUserData);
        if(updatedUser) {
            const newBadges = await checkAndAwardBadges(updatedUser.id);
            newBadges.forEach(badge => {
                toast({
                    title: "Badge Unlocked!",
                    description: `You've earned the "${badge.name}" badge.`,
                });
            });
            const finalUser = await validateSession(updatedUser.email, updatedUser.sessionId!);
            return finalUser || updatedUser;
        }
      }
      
      return userToUpdate;
  };


  const logout = useCallback(() => {
    setUser(null);
    setWallet(null);
    localStorage.removeItem('bhashaSetuUser');
    if (!pathname.startsWith('/auth') && pathname !== '/') {
      router.push('/auth/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedUserJSON = localStorage.getItem('bhashaSetuUser');
        if (storedUserJSON) {
          const storedUser = JSON.parse(storedUserJSON);
          let freshUser = await validateSession(storedUser.email, storedUser.sessionId);
          if (freshUser) {
            freshUser = await handleStreakAndBadges(freshUser);
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


  const login = useCallback(async (email: string, password?: string, tenantId?: string) => {
    try {
      let userToLogin = await loginUser(email, password || "mock_password", tenantId);

      if (userToLogin) {
        userToLogin = await handleStreakAndBadges(userToLogin);
        setUser(userToLogin);
        await fetchWalletForUser(userToLogin.id);
        localStorage.setItem('bhashaSetuUser', JSON.stringify(userToLogin));
        router.push('/dashboard');
        toast({ title: "Login Successful", description: `Welcome back, ${userToLogin.name}!` });
      } else {
        toast({
          title: "Login Failed",
          description: "User not found in this tenant or password incorrect. Please check your credentials or sign up.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: "Login Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  }, [router, toast, fetchWalletForUser]);

  const signup = useCallback(async (name: string, email: string, role: 'user' | 'admin', password?: string, tenantId?: string) => {
    try {
        if (!password) {
            throw new Error("Password is required for signup.");
        }
        const result = await signupUser({ name, email, role, password, tenantId });
        
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
    <AuthContext.Provider value={{ user, wallet, isAuthenticated, isAdmin, login, logout, signup, isLoading, refreshWallet, isStreakPopupOpen, setStreakPopupOpen }}>
      {children}
    </AuthContext.Provider>
  );
}
