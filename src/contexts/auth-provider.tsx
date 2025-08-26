
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
      console.log("[STREAK LOG] AuthProvider: 1. Entering handleStreakAndBadges function.");
      
      const today = new Date();
      console.log(`[STREAK LOG] AuthProvider: 2. Current datetime: ${today.toISOString()}`);
      
      const lastLoginDate = userToUpdate.lastLogin ? new Date(userToUpdate.lastLogin) : new Date(0);
      console.log(`[STREAK LOG] AuthProvider: 3. Last login datetime from user profile: ${lastLoginDate.toISOString()}`);
      
      const startOfToday = startOfDay(today);
      console.log(`[STREAK LOG] AuthProvider: 4. Calculated start of today: ${startOfToday.toISOString()}`);

      const startOfLastLogin = startOfDay(lastLoginDate);
      console.log(`[STREAK LOG] AuthProvider: 5. Calculated start of last login: ${startOfLastLogin.toISOString()}`);
      
      const daysSinceLastLogin = differenceInCalendarDays(startOfToday, startOfLastLogin);
      console.log(`[STREAK LOG] AuthProvider: 6. Days since last login: ${daysSinceLastLogin}`);

      if (daysSinceLastLogin > 0) {
        console.log("[STREAK LOG] AuthProvider: 7. Condition MET: daysSinceLastLogin > 0. Starting streak logic.");
        
        setStreakPopupOpen(true);
        console.log("[STREAK LOG] AuthProvider: 8. Streak popup triggered.");

        let newStreak = userToUpdate.dailyStreak || 0;
        console.log(`[STREAK LOG] AuthProvider: 9. Initial streak: ${newStreak}`);

        let newLongestStreak = userToUpdate.longestStreak || 0;
        console.log(`[STREAK LOG] AuthProvider: 10. Initial longest streak: ${newLongestStreak}`);
        
        let newStreakFreezes = userToUpdate.streakFreezes || 0;
        console.log(`[STREAK LOG] AuthProvider: 11. Initial streak freezes: ${newStreakFreezes}`);
        
        let weeklyActivity = [...(userToUpdate.weeklyActivity || Array(7).fill(0))];
        console.log(`[STREAK LOG] AuthProvider: 12. Initial weekly activity array: [${weeklyActivity.join(', ')}]`);
        
        const daysToShift = Math.min(daysSinceLastLogin, 7);
        console.log(`[STREAK LOG] AuthProvider: 13. Shifting weekly activity by ${daysToShift} days.`);

        weeklyActivity = [...weeklyActivity.slice(daysToShift), ...Array(daysToShift).fill(0)];
        console.log(`[STREAK LOG] AuthProvider: 14. Shifted weekly activity array: [${weeklyActivity.join(', ')}]`);
        
        if (daysSinceLastLogin === 1) {
            console.log("[STREAK LOG] AuthProvider: 15a. Condition MET: daysSinceLastLogin === 1. Continuing streak.");
            newStreak++;
            console.log(`[STREAK LOG] AuthProvider: 16a. Streak incremented. New streak: ${newStreak}`);
        } else if (daysSinceLastLogin > 1) {
            console.log("[STREAK LOG] AuthProvider: 15b. Condition MET: daysSinceLastLogin > 1. Checking for freezes.");
            if (newStreakFreezes > 0) {
                console.log("[STREAK LOG] AuthProvider: 16b. Condition MET: newStreakFreezes > 0. Using a freeze.");
                newStreakFreezes--; 
                console.log(`[STREAK LOG] AuthProvider: 17b. Streak freeze decremented. New count: ${newStreakFreezes}`);
                
                toast({ title: "Streak Saved!", description: `You used a free pass to protect your ${newStreak}-day streak.` });
                console.log("[STREAK LOG] AuthProvider: 18b. 'Streak Saved' toast displayed.");
                
                console.log(`[STREAK LOG] AuthProvider: 19b. Starting loop to mark ${daysToShift - 1} missed days as saved.`);
                for (let i = 1; i < daysToShift; i++) {
                    const activityIndex = 6 - i;
                    console.log(`[STREAK LOG] AuthProvider: 20b. Loop i=${i}, marking index ${activityIndex}.`);
                    if(activityIndex >= 0) {
                        weeklyActivity[activityIndex] = 2; // '2' represents a saved day
                        console.log(`[STREAK LOG] AuthProvider: 21b. Set weeklyActivity[${activityIndex}] = 2.`);
                    }
                }
                console.log(`[STREAK LOG] AuthProvider: 22b. After loop, weekly activity is: [${weeklyActivity.join(', ')}]`);
            } else {
                console.log("[STREAK LOG] AuthProvider: 16c. Condition FAILED: newStreakFreezes is 0. Resetting streak.");
                newStreak = 1;
                console.log(`[STREAK LOG] AuthProvider: 17c. Streak reset. New streak: ${newStreak}`);
            }
        }

        weeklyActivity[6] = 1; // Mark today as active ('1')
        console.log(`[STREAK LOG] AuthProvider: 23. Marking today as active (index 6, value 1). Final activity: [${weeklyActivity.join(', ')}]`);

        if (newStreak > newLongestStreak) {
            console.log(`[STREAK LOG] AuthProvider: 24. New streak (${newStreak}) is greater than longest streak (${newLongestStreak}).`);
            newLongestStreak = newStreak;
            console.log(`[STREAK LOG] AuthProvider: 25. Longest streak updated to: ${newLongestStreak}`);
        } else {
            console.log(`[STREAK LOG] AuthProvider: 24. New streak (${newStreak}) is not greater than longest streak (${newLongestStreak}). No change.`);
        }
        
        const STREAK_MILESTONES = [7, 14, 30];
        console.log(`[STREAK LOG] AuthProvider: 26. Checking for streak milestones. Current streak: ${newStreak}`);
        if (STREAK_MILESTONES.includes(newStreak)) {
            console.log(`[STREAK LOG] AuthProvider: 27. MILESTONE REACHED: ${newStreak} days.`);
            newStreakFreezes++;
            console.log(`[STREAK LOG] AuthProvider: 28. Streak freeze incremented. New count: ${newStreakFreezes}`);
            toast({
              title: "Streak Milestone Achieved!",
              description: `You've reached a ${newStreak}-day streak and earned a Free Pass!`
            });
            console.log("[STREAK LOG] AuthProvider: 29. 'Milestone' toast displayed.");
        } else {
            console.log("[STREAK LOG] AuthProvider: 27. No milestone reached.");
        }
        
        const updatedUserData: Partial<UserProfile> = { 
            dailyStreak: newStreak, 
            longestStreak: newLongestStreak,
            streakFreezes: newStreakFreezes,
            lastLogin: startOfToday.toISOString(),
            weeklyActivity: weeklyActivity
        };

        console.log("[STREAK LOG] AuthProvider: 30. Assembling final user data for update:", updatedUserData);
      
        const updatedUser = await updateUser(userToUpdate.id, updatedUserData);
        console.log("[STREAK LOG] AuthProvider: 31. Called updateUser. Result:", updatedUser ? 'Success' : 'Failure');

        if(updatedUser) {
            console.log("[STREAK LOG] AuthProvider: 32. Starting badge check for user:", updatedUser.id);
            const newBadges = await checkAndAwardBadges(updatedUser.id);
            console.log(`[STREAK LOG] AuthProvider: 33. Badge check complete. Found ${newBadges.length} new badges.`);
            newBadges.forEach(badge => {
                toast({
                    title: "Badge Unlocked!",
                    description: `You've earned the "${badge.name}" badge.`,
                });
            });
            console.log("[STREAK LOG] AuthProvider: 34. Re-validating session to get latest user state.");
            const finalUser = await validateSession(updatedUser.email, updatedUser.sessionId!);
            console.log("[STREAK LOG] AuthProvider: 35. Returning final user state from handleStreakAndBadges.");
            return finalUser || updatedUser;
        }
      }
      
      console.log("[STREAK LOG] AuthProvider: 36. No updates to streak logic were needed (logged in on same day). Returning original user.");
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
