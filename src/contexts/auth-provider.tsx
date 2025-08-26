
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, Wallet } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { loginUser, signupUser, validateSession } from '@/lib/actions/auth';
import { getWallet } from '@/lib/actions/wallet';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
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
      const today = startOfDay(new Date());
      const lastLoginDate = userToUpdate.lastLogin ? startOfDay(new Date(userToUpdate.lastLogin)) : startOfDay(new Date(0));
      const daysSinceLastLogin = differenceInCalendarDays(today, lastLoginDate);
      
      console.log(`[STREAK LOG] AuthProvider: Checking streak. Today: ${today.toISOString()}, Last Login: ${lastLoginDate.toISOString()}, Days Since: ${daysSinceLastLogin}`);
      
      let updatedUserData: Partial<UserProfile> = {};

      if (daysSinceLastLogin > 0) {
        console.log(`[STREAK LOG] AuthProvider: Detected login on a new day. Days since last login: ${daysSinceLastLogin}`);
        setStreakPopupOpen(true);
        console.log("[STREAK LOG] AuthProvider: Streak popup triggered.");

        let newStreak = userToUpdate.dailyStreak || 0;
        console.log(`[STREAK LOG] AuthProvider: Initial streak: ${newStreak}`);

        let newLongestStreak = userToUpdate.longestStreak || 0;
        console.log(`[STREAK LOG] AuthProvider: Initial longest streak: ${newLongestStreak}`);

        let newStreakFreezes = userToUpdate.streakFreezes || 0;
        console.log(`[STREAK LOG] AuthProvider: Initial streak freezes: ${newStreakFreezes}`);

        let weeklyActivity = [...(userToUpdate.weeklyActivity || Array(7).fill(0))];
        console.log(`[STREAK LOG] AuthProvider: Initial weekly activity array: [${weeklyActivity.join(', ')}]`);
        
        const daysToShift = Math.min(daysSinceLastLogin, 7);
        console.log(`[STREAK LOG] AuthProvider: Shifting weekly activity by ${daysToShift} days.`);

        const shiftedActivity = [...weeklyActivity.slice(daysToShift), ...Array(daysToShift).fill(0)];
        console.log(`[STREAK LOG] AuthProvider: Shifted weekly activity array: [${shiftedActivity.join(', ')}]`);
        weeklyActivity = shiftedActivity;
        
        if (daysSinceLastLogin === 1) {
            console.log("[STREAK LOG] AuthProvider: Missed 0 days (consecutive login). Incrementing streak.");
            newStreak++;
            console.log(`[STREAK LOG] AuthProvider: New streak is now ${newStreak}.`);
        } else if (daysSinceLastLogin > 1) {
            console.log(`[STREAK LOG] AuthProvider: Missed ${daysSinceLastLogin - 1} day(s). Checking for freezes.`);
            if (newStreakFreezes > 0) {
                console.log(`[STREAK LOG] AuthProvider: Freeze found (${newStreakFreezes}). Using one to save the streak.`);
                newStreakFreezes--;
                console.log(`[STREAK LOG] AuthProvider: New freeze count: ${newStreakFreezes}.`);
                toast({ title: "Streak Saved!", description: `You used a free pass to protect your ${newStreak}-day streak.` });

                console.log(`[STREAK LOG] AuthProvider: Marking ${daysSinceLastLogin - 1} missed days as saved (value 2).`);
                for (let i = 1; i < daysToShift; i++) {
                    const activityIndex = 6 - i;
                    if(activityIndex >= 0) {
                        console.log(`[STREAK LOG] AuthProvider: Marking index ${activityIndex} (representing ${i} day(s) ago) as saved.`);
                        weeklyActivity[activityIndex] = 2; // '2' represents a saved day
                    }
                }
            } else {
                console.log("[STREAK LOG] AuthProvider: No freezes available. Resetting streak.");
                newStreak = 1;
                console.log(`[STREAK LOG] AuthProvider: New streak is now ${newStreak}.`);
            }
        }

        console.log("[STREAK LOG] AuthProvider: Marking today as active (index 6, value 1).");
        weeklyActivity[6] = 1; // Mark today as active ('1')
        console.log(`[STREAK LOG] AuthProvider: Final weekly activity for update: [${weeklyActivity.join(', ')}]`);

        if (newStreak > newLongestStreak) {
            console.log(`[STREAK LOG] AuthProvider: New streak (${newStreak}) is greater than longest streak (${newLongestStreak}). Updating longest streak.`);
            newLongestStreak = newStreak;
        }

        const STREAK_MILESTONES = [7, 14, 30];
        console.log(`[STREAK LOG] AuthProvider: Checking for streak milestones. Current streak: ${newStreak}`);
        if (STREAK_MILESTONES.includes(newStreak)) {
            newStreakFreezes++;
            console.log(`[STREAK LOG] AuthProvider: Milestone of ${newStreak} days reached! Awarding a freeze. New count: ${newStreakFreezes}.`);
            toast({
              title: "Streak Milestone Achieved!",
              description: `You've reached a ${newStreak}-day streak and earned a Free Pass!`
            });
        }

        console.log("[STREAK LOG] AuthProvider: Assembling final user data for update.");
        updatedUserData = { 
            dailyStreak: newStreak, 
            longestStreak: newLongestStreak,
            streakFreezes: newStreakFreezes,
            lastLogin: today.toISOString(),
            weeklyActivity: weeklyActivity
        };
        console.log("[STREAK LOG] AuthProvider: Final updatedUserData object:", updatedUserData);
      }
      
      if (Object.keys(updatedUserData).length > 0) {
        console.log("[STREAK LOG] AuthProvider: Calling updateUser with new data.");
        const updatedUser = await updateUser(userToUpdate.id, updatedUserData);
        if(updatedUser) {
            console.log("[STREAK LOG] AuthProvider: updateUser successful. Checking for new badges.");
            const newBadges = await checkAndAwardBadges(updatedUser.id);
            newBadges.forEach(badge => {
                toast({
                    title: "Badge Unlocked!",
                    description: `You've earned the "${badge.name}" badge.`,
                });
            });
            console.log("[STREAK LOG] AuthProvider: Badge check complete. Re-validating session to get final user state.");
            const finalUser = await validateSession(updatedUser.email, updatedUser.sessionId!);
            return finalUser || updatedUser;
        }
      }
      
      console.log("[STREAK LOG] AuthProvider: No updates to streak logic were needed (logged in on same day). Returning original user.");
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
