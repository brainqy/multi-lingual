
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
import { differenceInCalendarDays, startOfDay } from 'date-fns';

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
  
  console.log("[STREAK LOG] Defining handleStreakAndBadges function.");
  const handleStreakAndBadges = async (userToUpdate: UserProfile): Promise<UserProfile> => {
      console.log("[STREAK LOG] 1. Entering handleStreakAndBadges function.");
      const today = new Date();
      console.log("[STREAK LOG] 2. Current datetime:", today.toISOString());
      const lastLogin = userToUpdate.lastLogin ? new Date(userToUpdate.lastLogin) : new Date(0);
      console.log("[STREAK LOG] 3. Last login datetime from user profile:", lastLogin.toISOString());
      const startOfToday = startOfDay(today);
      console.log("[STREAK LOG] 4. Calculated start of today:", startOfToday.toISOString());
      const startOfLastLogin = startOfDay(lastLogin);
      console.log("[STREAK LOG] 5. Calculated start of last login:", startOfLastLogin.toISOString());

      let weeklyActivity = [...(userToUpdate.weeklyActivity || Array(7).fill(0))];
      console.log("[STREAK LOG] 6. Initial weekly activity array:", JSON.stringify(weeklyActivity));
      
      const lastActiveIndex = weeklyActivity.map(Number).lastIndexOf(1);
      console.log("[STREAK LOG] 7. Found last active index (where 1 is present):", lastActiveIndex);

      const daysSinceLastLogin = lastActiveIndex === -1 ? 7 : 6 - lastActiveIndex;
      console.log("[STREAK LOG] 8. Calculated days since last login based on weeklyActivity:", daysSinceLastLogin);
      
      let updatedUserData: Partial<UserProfile> = {};
      console.log("[STREAK LOG] 9. Initialized empty updatedUserData object.");

      if (daysSinceLastLogin > 0) {
        console.log("[STREAK LOG] 10. Detected login on a new day. Entering streak logic block.");
        setStreakPopupOpen(true);
        console.log("[STREAK LOG] 11. Streak popup triggered.");
        
        let newStreak = userToUpdate.dailyStreak || 0;
        console.log("[STREAK LOG] 12. Initial streak:", newStreak);
        let newLongestStreak = userToUpdate.longestStreak || 0;
        console.log("[STREAK LOG] 13. Initial longest streak:", newLongestStreak);
        let newStreakFreezes = userToUpdate.streakFreezes || 0;
        console.log("[STREAK LOG] 14. Initial streak freezes:", newStreakFreezes);

        console.log("[STREAK LOG] 15. Shifting weekly activity array...");
        const daysToShift = Math.min(daysSinceLastLogin, 7);
        console.log("[STREAK LOG] 16. Days to shift:", daysToShift);
        weeklyActivity = [...weeklyActivity.slice(daysToShift), ...Array(daysToShift).fill(0)];
        console.log("[STREAK LOG] 17. Shifted weekly activity array:", JSON.stringify(weeklyActivity));
        
        console.log("[STREAK LOG] 18. Checking if streak continued (daysSinceLastLogin === 1).");
        if (daysSinceLastLogin === 1) {
            console.log("[STREAK LOG] 19. Streak continues. Incrementing streak.");
            newStreak++;
        } else if (daysSinceLastLogin > 1) {
            console.log("[STREAK LOG] 20. Missed more than one day. Checking for freezes.");
            if (newStreakFreezes > 0) {
                console.log("[STREAK LOG] 21. Freeze available. Using one.");
                newStreakFreezes--; // Use a freeze
                console.log("[STREAK LOG] 22. Decremented freezes. New count:", newStreakFreezes);
                toast({ title: "Streak Saved!", description: `You used a free pass to protect your ${newStreak}-day streak.` });
                console.log("[STREAK LOG] 23. Displayed 'Streak Saved' toast.");

                console.log("[STREAK LOG] 24. Marking missed days as saved in weekly activity.");
                for (let i = 1; i < daysToShift; i++) {
                    console.log(`[STREAK LOG] 25. Loop iteration i=${i}.`);
                    const activityIndex = 6 - i;
                    console.log(`[STREAK LOG] 26. Calculated activity index to mark as saved: ${activityIndex}`);
                    if(activityIndex >= 0) {
                        console.log(`[STREAK LOG] 27. Setting weeklyActivity[${activityIndex}] to 2.`);
                        weeklyActivity[activityIndex] = 2; // '2' represents a saved day
                    }
                }
                console.log("[STREAK LOG] 28. Finished marking saved days. Array:", JSON.stringify(weeklyActivity));
            } else {
                console.log("[STREAK LOG] 29. No freezes available. Resetting streak.");
                newStreak = 1; // Reset streak
            }
        }

        console.log("[STREAK LOG] 30. Marking today as active (index 6, value 1).");
        weeklyActivity[6] = 1; // Mark today as active ('1')
        console.log("[STREAK LOG] 31. Final weekly activity for update:", JSON.stringify(weeklyActivity));

        console.log("[STREAK LOG] 32. Checking if new streak is longer than longest streak.");
        if (newStreak > newLongestStreak) {
            console.log("[STREAK LOG] 33. New longest streak detected. Updating value.");
            newLongestStreak = newStreak;
        }
        
        const STREAK_MILESTONES = [7, 14, 30];
        console.log("[STREAK LOG] 34. Checking for streak milestones. Current streak:", newStreak);
        if (STREAK_MILESTONES.includes(newStreak)) {
          console.log("[STREAK LOG] 35. Milestone reached! Awarding a new streak freeze.");
          newStreakFreezes++;
          toast({
            title: "Streak Milestone Achieved!",
            description: `You've reached a ${newStreak}-day streak and earned a Free Pass!`
          });
        }
        
        console.log("[STREAK LOG] 36. Assembling final user data for update.");
        updatedUserData = { 
            dailyStreak: newStreak, 
            longestStreak: newLongestStreak,
            streakFreezes: newStreakFreezes,
            lastLogin: startOfDay(today).toISOString(),
            weeklyActivity: weeklyActivity
        };
        console.log("[STREAK LOG] 37. Final updatedUserData object:", JSON.stringify(updatedUserData));
      } else {
          console.log("[STREAK LOG] 10a. Login is on the same day. No streak logic needed.");
      }
      
      console.log("[STREAK LOG] 38. Checking if there are any updates to save.");
      if (Object.keys(updatedUserData).length > 0) {
        console.log("[STREAK LOG] 39. Calling updateUser with new data.");
        const updatedUser = await updateUser(userToUpdate.id, updatedUserData);
        console.log("[STREAK LOG] 40. updateUser returned:", updatedUser ? `user ${updatedUser.id}` : 'null');

        if(updatedUser) {
            console.log("[STREAK LOG] 41. User updated successfully. Checking for new badges.");
            const newBadges = await checkAndAwardBadges(updatedUser.id);
            console.log("[STREAK LOG] 42. New badges found:", newBadges.length);
            newBadges.forEach(badge => {
                console.log("[STREAK LOG] 43. Displaying toast for new badge:", badge.name);
                toast({
                    title: "Badge Unlocked!",
                    description: `You've earned the "${badge.name}" badge.`,
                });
            });
            console.log("[STREAK LOG] 44. Re-validating session to get the absolute latest user data.");
            const finalUser = await validateSession(updatedUser.email, updatedUser.sessionId!);
            console.log("[STREAK LOG] 45. Returning the final, fully updated user object.");
            return finalUser || updatedUser;
        }
      }
      
      console.log("[STREAK LOG] 46. No updates to streak logic were needed. Returning original user.");
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
