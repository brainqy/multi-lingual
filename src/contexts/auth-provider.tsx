
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, Wallet } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { loginUser, signupUser, validateSession, loginOrSignupWithGoogle } from '@/lib/actions/auth';
import { getWallet } from '@/lib/actions/wallet';
import { updateUser } from '@/lib/data-services/users';
import { checkAndAwardBadges } from '@/lib/actions/gamification';
import { createActivity } from '@/lib/actions/activities';
import { differenceInCalendarDays } from 'date-fns';

interface AuthContextType {
  user: UserProfile | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: (tenantId?: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, role: 'user' | 'admin', password?: string, tenantId?: string) => Promise<void>;
  isLoading: boolean;
  refreshWallet: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isStreakPopupOpen: boolean;
  setStreakPopupOpen: (isOpen: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const handleStreakAndBadges = async (userToUpdate: UserProfile, toast: any, setStreakPopupOpen: (isOpen: boolean) => void): Promise<UserProfile> => {
      const today = new Date();
      const lastLogin = userToUpdate.lastLogin ? new Date(userToUpdate.lastLogin) : new Date(0);
      const isNewDay = differenceInCalendarDays(today, lastLogin) > 0;
      
      const todayString = today.toISOString().split('T')[0];
      const popupShownKey = `dailyStreakPopupShown_${userToUpdate.id}_${todayString}`;
      const hasPopupBeenShown = typeof window !== 'undefined' ? localStorage.getItem(popupShownKey) : false;

      // Only run streak logic on the first login of a new day.
      if (!isNewDay) {
        return userToUpdate;
      }
      
      // And only show the popup once per day
      if (!hasPopupBeenShown) {
        setStreakPopupOpen(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(popupShownKey, 'true');
        }
      }

      let weeklyActivity = (Array.isArray(userToUpdate.weeklyActivity) && userToUpdate.weeklyActivity.length === 7)
        ? [...userToUpdate.weeklyActivity]
        : [0, 0, 0, 0, 0, 0, 0];

      // Shift activity for the new day
      weeklyActivity.shift();
      weeklyActivity.push(0); // Today starts as inactive, will be marked active later

      // Find the index of the last activity before today.
      const lastActiveDayIndex = weeklyActivity.slice(0, 6).findLastIndex(day => day === 1 || day === 2);
      
      // Calculate days missed since the last activity.
      const daysSinceLastLogin = lastActiveDayIndex === -1 ? 7 : 6 - 1 - lastActiveDayIndex;


      let newStreak = userToUpdate.dailyStreak || 0;
      let newLongestStreak = userToUpdate.longestStreak || 0;
      let newStreakFreezes = userToUpdate.streakFreezes || 0;
      
      if (daysSinceLastLogin === 0) { // Logged in yesterday
          newStreak++;
      } else if (daysSinceLastLogin > 0) { // Missed one or more days
          if (newStreakFreezes >= daysSinceLastLogin) {
              newStreakFreezes -= daysSinceLastLogin; 
              toast({ title: "Streak Saved!", description: `You used ${daysSinceLastLogin} free pass(es) to protect your ${newStreak}-day streak.` });
              await createActivity({ userId: userToUpdate.id, tenantId: userToUpdate.tenantId, description: `Used a streak freeze to protect a ${newStreak}-day streak.`});
              
              for (let i = 1; i <= daysSinceLastLogin; i++) {
                  const activityIndex = 6 - i;
                  if (activityIndex >= 0) {
                      weeklyActivity[activityIndex] = 2; // 2 represents 'saved by freeze'
                  }
              }
              newStreak++; // Continue the streak
          } else {
              newStreak = 1; // Reset streak
          }
      } else { // First login
          newStreak = 1;
      }
      
      weeklyActivity[6] = 1; // Mark today as active

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
      
      const updatedUserData: Partial<UserProfile> = { 
          dailyStreak: newStreak, 
          longestStreak: newLongestStreak,
          streakFreezes: newStreakFreezes,
          lastLogin: today.toISOString(),
          weeklyActivity: weeklyActivity
      };
      
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
      } else {
          // If update fails, at least update lastLogin to prevent loop
          const fallbackUser = await updateUser(userToUpdate.id, { lastLogin: today.toISOString() });
          return fallbackUser || userToUpdate;
      }
  };

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

  const logout = useCallback(() => {
    setUser(null);
    setWallet(null);
    localStorage.removeItem('bhashaSetuUser');
    if (!pathname.startsWith('/auth') && pathname !== '/') {
      router.push('/auth/login');
    }
  }, [router, pathname]);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
        const freshUser = await validateSession(user.email, user.sessionId!);
        if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('bhashaSetuUser', JSON.stringify(freshUser));
        } else {
            logout();
        }
    } catch (error) {
        console.error("Failed to refresh user session", error);
        logout();
    }
  }, [user, logout]);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedUserJSON = localStorage.getItem('bhashaSetuUser');
        if (storedUserJSON) {
          const storedUser = JSON.parse(storedUserJSON);
          let freshUser = await validateSession(storedUser.email, storedUser.sessionId);
          if (freshUser) {
            freshUser = await handleStreakAndBadges(freshUser, toast, setStreakPopupOpen);
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
  }, [logout, fetchWalletForUser, toast]);
  
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
      let userToLogin = await loginUser(email, password, tenantId);

      if (userToLogin) {
        userToLogin = await handleStreakAndBadges(userToLogin, toast, setStreakPopupOpen);
        setUser(userToLogin);
        await fetchWalletForUser(userToLogin.id);
        localStorage.setItem('bhashaSetuUser', JSON.stringify(userToLogin));
        
        // Redirect admin users to the admin dashboard
        if (userToLogin.role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard');
        }
        
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

  const loginWithGoogle = useCallback(async (tenantId?: string) => {
    try {
      const result = await loginOrSignupWithGoogle(tenantId);
      if (result.success && result.user) {
        let userToLogin = result.user;
        userToLogin = await handleStreakAndBadges(userToLogin, toast, setStreakPopupOpen);
        setUser(userToLogin);
        await fetchWalletForUser(userToLogin.id);
        localStorage.setItem('bhashaSetuUser', JSON.stringify(userToLogin));
        
        if (userToLogin.role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard');
        }
        
        toast({ title: "Login Successful", description: `Welcome, ${userToLogin.name}!` });
      } else {
        toast({
          title: "Google Sign-In Failed",
          description: result.message || "Could not sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({ title: "Google Sign-In Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  }, [router, toast, fetchWalletForUser]);

  const signup = useCallback(async (name: string, email: string, role: 'user' | 'admin', password?: string, tenantId?: string) => {
    try {
      if (!password) {
        throw new Error("Password is required for signup.");
      }
      const result = await signupUser({ name, email, role, password, tenantId });
      
      if (result.success && result.user) {
        let signedUpUser = result.user;
        signedUpUser = await handleStreakAndBadges(signedUpUser, toast, setStreakPopupOpen);
        setUser(signedUpUser);
        await fetchWalletForUser(signedUpUser.id);
        localStorage.setItem('bhashaSetuUser', JSON.stringify(signedUpUser));
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
    <AuthContext.Provider value={{ user, wallet, isAuthenticated, isAdmin, login, loginWithGoogle, logout, signup, isLoading, refreshWallet, refreshUser, isStreakPopupOpen, setStreakPopupOpen }}>
      {children}
    </AuthContext.Provider>
  );
}
