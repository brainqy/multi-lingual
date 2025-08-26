
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, Wallet } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { loginUser, signupUser, validateSession } from '@/lib/actions/auth';
import { getWallet } from '@/lib/actions/wallet';
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
      let updatedUserData: Partial<UserProfile> = {};
      
      const lastLoginDate = userToUpdate.lastLogin ? new Date(userToUpdate.lastLogin) : new Date(0);
      const today = new Date();
      
      // Check if today is a new day since the last login
      if (today.toDateString() === lastLoginDate.toDateString()) {
          return userToUpdate; // Already logged in today, no streak change
      }

      const weeklyActivity = [...(userToUpdate.weeklyActivity || Array(7).fill(0))];
      const lastActiveIndex = weeklyActivity.lastIndexOf(1);

      // today is index 6. If last active was index 5, it was 1 day ago. If 4, 2 days ago.
      const daysSinceLastLogin = lastActiveIndex === -1 ? 7 : 6 - lastActiveIndex;

      if (daysSinceLastLogin > 0) {
          setStreakPopupOpen(true);
          let newStreak = userToUpdate.dailyStreak || 0;
          let newLongestStreak = userToUpdate.longestStreak || 0;
          let newStreakFreezes = userToUpdate.streakFreezes || 0;

          const daysToShift = Math.min(daysSinceLastLogin, 7);
          const shiftedActivity = [...weeklyActivity.slice(daysToShift), ...Array(daysToShift).fill(0)];
          
          if (daysSinceLastLogin === 1) {
              newStreak++;
          } else { // Missed more than one day
              if (newStreakFreezes > 0) {
                  newStreakFreezes--; // Use a freeze
                  toast({ title: "Streak Saved!", description: `You used a free pass to protect your ${newStreak}-day streak.` });
                  // Mark the missed days as saved in weekly activity
                  for (let i = 1; i < daysToShift; i++) {
                    const activityIndex = 6 - i;
                    if(activityIndex >= 0) {
                        shiftedActivity[activityIndex] = 2; // '2' represents a saved day
                    }
                  }
              } else {
                  newStreak = 1; // Reset streak
              }
          }

          shiftedActivity[6] = 1; // Mark today as active ('1')

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
              dailyStreak: newStreak, 
              longestStreak: newLongestStreak,
              streakFreezes: newStreakFreezes,
              lastLogin: today.toISOString(),
              weeklyActivity: shiftedActivity
          };
      } else {
           // This handles the very first login case for a user
           const newWeeklyActivity = [...weeklyActivity.slice(1), 1];
           updatedUserData = {
               lastLogin: today.toISOString(),
               dailyStreak: 1,
               longestStreak: Math.max(1, userToUpdate.longestStreak || 0),
               weeklyActivity: newWeeklyActivity
           }
           setStreakPopupOpen(true);
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
