
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
      
      const numericWeeklyActivity = (userToUpdate.weeklyActivity || Array(7).fill(0)).map(val => val === true ? 1 : val === false ? 0 : val);
      console.log("[STREAK LOG] AuthProvider: 2. Initial weekly activity array converted to numbers:", numericWeeklyActivity);
      
      const lastActiveDayIndex = numericWeeklyActivity.slice(0, 6).lastIndexOf(1);
      console.log("[STREAK LOG] AuthProvider: 3. Last active day index (before today) is:", lastActiveDayIndex);

      const daysSinceLastLogin = lastActiveDayIndex === -1 ? 7 : 6 - lastActiveDayIndex;
      console.log("[STREAK LOG] AuthProvider: 4. Calculated days since last login based on array:", daysSinceLastLogin);
      
      const hasLoggedInToday = numericWeeklyActivity[6] === 1;
      console.log("[STREAK LOG] AuthProvider: 5. Has user already logged in today?", hasLoggedInToday);

      if (daysSinceLastLogin > 0 && !hasLoggedInToday) {
          console.log("[STREAK LOG] AuthProvider: 6. Detected login on a new day. Days since last login:", daysSinceLastLogin);
          setStreakPopupOpen(true);
          console.log("[STREAK LOG] AuthProvider: 7. Streak popup triggered.");

          let newStreak = userToUpdate.dailyStreak || 0;
          console.log("[STREAK LOG] AuthProvider: 8. Initial streak:", newStreak);
          let newLongestStreak = userToUpdate.longestStreak || 0;
          console.log("[STREAK LOG] AuthProvider: 9. Initial longest streak:", newLongestStreak);
          let newStreakFreezes = userToUpdate.streakFreezes || 0;
          console.log("[STREAK LOG] AuthProvider: 10. Initial streak freezes:", newStreakFreezes);
          
          const daysToShift = Math.min(daysSinceLastLogin, 7);
          console.log("[STREAK LOG] AuthProvider: 11. Shifting weekly activity by", daysToShift, "days.");
          
          const recentActivity = numericWeeklyActivity.slice(daysToShift);
          const shiftedActivity = [...Array(daysToShift).fill(0), ...recentActivity];
          console.log("[STREAK LOG] AuthProvider: 12. Shifted weekly activity array:", shiftedActivity);

          if (daysSinceLastLogin === 1) {
              console.log("[STREAK LOG] AuthProvider: 13. Logged in consecutively (1 day since last login).");
              newStreak++;
              console.log("[STREAK LOG] AuthProvider: 14. Incremented streak to:", newStreak);
          } else if (daysSinceLastLogin > 1) { 
              console.log("[STREAK LOG] AuthProvider: 15. Missed more than one day. Days missed:", daysSinceLastLogin);
              if (newStreakFreezes > 0) {
                  console.log("[STREAK LOG] AuthProvider: 16. Streak freezes available. Using one.");
                  newStreakFreezes--; 
                  console.log("[STREAK LOG] AuthProvider: 17. Decremented streak freezes to:", newStreakFreezes);
                  toast({ title: "Streak Saved!", description: `You used a free pass to protect your ${newStreak}-day streak.` });
                  console.log("[STREAK LOG] AuthProvider: 18. Displayed 'Streak Saved' toast.");
                  
                  console.log("[STREAK LOG] AuthProvider: 19. Marking missed days as saved in activity array.");
                  for (let i = 1; i < daysToShift; i++) {
                    const activityIndex = 6 - i;
                    console.log("[STREAK LOG] AuthProvider: 20. Loop", i, "- Marking index", activityIndex, "as saved (value 2).");
                    if(activityIndex >= 0) {
                        shiftedActivity[activityIndex] = 2;
                    }
                  }

              } else {
                  console.log("[STREAK LOG] AuthProvider: 21. No streak freezes available.");
                  newStreak = 1; // Reset streak
                  console.log("[STREAK LOG] AuthProvider: 22. Reset streak to 1.");
              }
          }

          shiftedActivity[6] = 1;
          console.log("[STREAK LOG] AuthProvider: 23. Marking today as active (index 6, value 1).");
          console.log("[STREAK LOG] AuthProvider: 24. Final weekly activity for update:", shiftedActivity);

          if (newStreak > newLongestStreak) {
              console.log("[STREAK LOG] AuthProvider: 25. New streak is greater than longest streak.");
              newLongestStreak = newStreak;
              console.log("[STREAK LOG] AuthProvider: 26. Updated longest streak to:", newLongestStreak);
          }
          
          const STREAK_MILESTONES = [7, 14, 30];
          console.log("[STREAK LOG] AuthProvider: 27. Checking for streak milestones. Current streak:", newStreak);
          if (STREAK_MILESTONES.includes(newStreak)) {
            console.log("[STREAK LOG] AuthProvider: 28. Milestone reached!");
            newStreakFreezes++;
            console.log("[STREAK LOG] AuthProvider: 29. Incremented streak freezes to:", newStreakFreezes);
            toast({
              title: "Streak Milestone Achieved!",
              description: `You've reached a ${newStreak}-day streak and earned a Free Pass!`
            });
            console.log("[STREAK LOG] AuthProvider: 30. Displayed 'Milestone' toast.");
          }
          
          console.log("[STREAK LOG] AuthProvider: 31. Assembling final user data for update.");
          const updatedUserData: Partial<UserProfile> = { 
              dailyStreak: newStreak, 
              longestStreak: newLongestStreak,
              streakFreezes: newStreakFreezes,
              lastLogin: new Date().toISOString(),
              weeklyActivity: shiftedActivity
          };
          console.log("[STREAK LOG] AuthProvider: 32. Final updatedUserData object:", updatedUserData);
          
          console.log("[STREAK LOG] AuthProvider: 33. Changes detected, calling updateUser with new data:", userToUpdate.id, updatedUserData);
          const updatedUser = await updateUser(userToUpdate.id, updatedUserData);
          console.log("[STREAK LOG] AuthProvider: 34. updateUser returned:", updatedUser);

          if(updatedUser) {
              console.log("[STREAK LOG] AuthProvider: 35. User updated in DB. Checking for badges.");
              const newBadges = await checkAndAwardBadges(updatedUser.id);
              console.log("[STREAK LOG] AuthProvider: 36. Badge check complete. New badges found:", newBadges.length);
              newBadges.forEach(badge => {
                  toast({
                      title: "Badge Unlocked!",
                      description: `You've earned the "${badge.name}" badge.`,
                  });
              });
              console.log("[STREAK LOG] AuthProvider: 37. Re-validating session to get final user state.");
              const finalUser = await validateSession(updatedUser.email, updatedUser.sessionId!);
              console.log("[STREAK LOG] AuthProvider: 38. Returning final user state from handleStreakAndBadges.");
              return finalUser || updatedUser;
          } else {
             console.log("[STREAK LOG] AuthProvider: 39. Update user failed, returning original user from handleStreakAndBadges.");
             return userToUpdate;
          }
      }
      
      console.log("[STREAK LOG] AuthProvider: 40. No updates to streak logic were needed (logged in on same day). Returning original user.");
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
