
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
import { startOfDay, differenceInCalendarDays } from 'date-fns';

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

console.log("[STREAK LOG] AuthProvider: Defining handleStreakAndBadges function.");
const handleStreakAndBadges = async (userToUpdate: UserProfile, toast: any, setStreakPopupOpen: (isOpen: boolean) => void): Promise<UserProfile> => {
      console.log("[STREAK LOG] AuthProvider: 1. Entering handleStreakAndBadges function.");
      let updatedUserData: Partial<UserProfile> = {};
      
      console.log("[STREAK LOG] AuthProvider: 2. Getting current user's weekly activity.");
      const weeklyActivity = [...(userToUpdate.weeklyActivity || Array(7).fill(0))];
      console.log("[STREAK LOG] AuthProvider: 3. Initial weekly activity array:", weeklyActivity);

      console.log("[STREAK LOG] AuthProvider: 4. Finding last active day (value of 1).");
      const lastActiveDayIndex = weeklyActivity.lastIndexOf(1);
      console.log("[STREAK LOG] AuthProvider: 5. Last active day index is:", lastActiveDayIndex);

      // Today is represented by index 6. The number of missed days is the distance from the last active day.
      // If lastActiveDayIndex is 5, that was yesterday, so 1 day missed.
      // If lastActiveDayIndex is 6, they already logged in today.
      const daysSinceLastLogin = lastActiveDayIndex === -1 ? 7 : 6 - lastActiveDayIndex;
      console.log("[STREAK LOG] AuthProvider: 6. Calculated days since last login:", daysSinceLastLogin);
      
      if (daysSinceLastLogin > 0) {
          console.log("[STREAK LOG] AuthProvider: 7. Detected login on a new day.");
          setStreakPopupOpen(true);
          console.log("[STREAK LOG] AuthProvider: 8. Streak popup triggered.");

          let newStreak = userToUpdate.dailyStreak || 0;
          console.log("[STREAK LOG] AuthProvider: 9. Initial streak:", newStreak);
          let newLongestStreak = userToUpdate.longestStreak || 0;
          console.log("[STREAK LOG] AuthProvider: 10. Initial longest streak:", newLongestStreak);
          let newStreakFreezes = userToUpdate.streakFreezes || 0;
          console.log("[STREAK LOG] AuthProvider: 11. Initial streak freezes:", newStreakFreezes);

          const daysToShift = Math.min(daysSinceLastLogin, 7);
          console.log("[STREAK LOG] AuthProvider: 12. Shifting weekly activity by", daysToShift, "days.");
          
          const shiftedActivity = [...weeklyActivity.slice(daysToShift), ...Array(daysToShift).fill(0)];
          console.log("[STREAK LOG] AuthProvider: 13. Shifted weekly activity array:", shiftedActivity);

          if (daysSinceLastLogin === 1) {
              console.log("[STREAK LOG] AuthProvider: 14. Logged in consecutively (1 day since last login).");
              newStreak++;
              console.log("[STREAK LOG] AuthProvider: 15. Incremented streak to:", newStreak);
          } else { 
              console.log("[STREAK LOG] AuthProvider: 16. Missed more than one day. Days missed:", daysSinceLastLogin);
              if (newStreakFreezes > 0) {
                  console.log("[STREAK LOG] AuthProvider: 17. Streak freezes available. Using one.");
                  newStreakFreezes--; 
                  console.log("[STREAK LOG] AuthProvider: 18. Decremented streak freezes to:", newStreakFreezes);
                  toast({ title: "Streak Saved!", description: `You used a free pass to protect your ${newStreak}-day streak.` });
                  console.log("[STREAK LOG] AuthProvider: 19. Displayed 'Streak Saved' toast.");
                  
                  // Mark the missed days as 'saved'
                  console.log("[STREAK LOG] AuthProvider: 20. Marking missed days as saved in activity array.");
                  for (let i = 1; i < daysToShift; i++) {
                    const activityIndex = 6 - i;
                    console.log("[STREAK LOG] AuthProvider: 21. Loop", i, "- Marking index", activityIndex, "as saved (value 2).");
                    if(activityIndex >= 0) {
                        shiftedActivity[activityIndex] = 2; // '2' represents a saved day
                    }
                  }

              } else {
                  console.log("[STREAK LOG] AuthProvider: 22. No streak freezes available.");
                  newStreak = 1; // Reset streak
                  console.log("[STREAK LOG] AuthProvider: 23. Reset streak to 1.");
              }
          }

          shiftedActivity[6] = 1; // Mark today as active ('1')
          console.log("[STREAK LOG] AuthProvider: 24. Marking today as active (index 6, value 1).");
          console.log("[STREAK LOG] AuthProvider: 25. Final weekly activity for update:", shiftedActivity);

          if (newStreak > newLongestStreak) {
              console.log("[STREAK LOG] AuthProvider: 26. New streak is greater than longest streak.");
              newLongestStreak = newStreak;
              console.log("[STREAK LOG] AuthProvider: 27. Updated longest streak to:", newLongestStreak);
          }
          
          const STREAK_MILESTONES = [7, 14, 30];
          console.log("[STREAK LOG] AuthProvider: 28. Checking for streak milestones. Current streak:", newStreak);
          if (STREAK_MILESTONES.includes(newStreak)) {
            console.log("[STREAK LOG] AuthProvider: 29. Milestone reached!");
            newStreakFreezes++;
            console.log("[STREAK LOG] AuthProvider: 30. Incremented streak freezes to:", newStreakFreezes);
            toast({
              title: "Streak Milestone Achieved!",
              description: `You've reached a ${newStreak}-day streak and earned a Free Pass!`
            });
            console.log("[STREAK LOG] AuthProvider: 31. Displayed 'Milestone' toast.");
          }
          
          console.log("[STREAK LOG] AuthProvider: 32. Assembling final user data for update.");
          updatedUserData = { 
              dailyStreak: newStreak, 
              longestStreak: newLongestStreak,
              streakFreezes: newStreakFreezes,
              lastLogin: new Date().toISOString(),
              weeklyActivity: shiftedActivity
          };
          console.log("[STREAK LOG] AuthProvider: 33. Final updatedUserData object:", updatedUserData);
      }
      
      if (Object.keys(updatedUserData).length > 0) {
        console.log("[STREAK LOG] AuthProvider: 35. Changes detected, calling updateUser.");
        const updatedUser = await updateUser(userToUpdate.id, updatedUserData);
        if(updatedUser) {
            console.log("[STREAK LOG] AuthProvider: 36. User updated in DB. Checking for badges.");
            const newBadges = await checkAndAwardBadges(updatedUser.id);
            console.log("[STREAK LOG] AuthProvider: 37. Badge check complete. New badges found:", newBadges.length);
            newBadges.forEach(badge => {
                toast({
                    title: "Badge Unlocked!",
                    description: `You've earned the "${badge.name}" badge.`,
                });
            });
            console.log("[STREAK LOG] AuthProvider: 38. Re-validating session to get final user state.");
            const finalUser = await validateSession(updatedUser.email, updatedUser.sessionId!);
            console.log("[STREAK LOG] AuthProvider: 39. Returning final user state.");
            return finalUser || updatedUser;
        } else {
           console.log("[STREAK LOG] AuthProvider: 39b. Update user failed, returning original user.");
           return userToUpdate;
        }
      }
      
      console.log("[STREAK LOG] AuthProvider: 40. No updates to streak logic were needed. Returning original user.");
      return userToUpdate;
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
      let userToLogin = await loginUser(email, password || "mock_password", tenantId);

      if (userToLogin) {
        userToLogin = await handleStreakAndBadges(userToLogin, toast, setStreakPopupOpen);
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
