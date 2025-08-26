
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
  
  console.log("[STREAK LOG] AuthProvider: Defining handleStreakAndBadges function.");
  const handleStreakAndBadges = async (userToUpdate: UserProfile): Promise<UserProfile> => {
      console.log("[STREAK LOG] AuthProvider: 1. Entering handleStreakAndBadges function.");
      
      const today = new Date();
      console.log("[STREAK LOG] AuthProvider: 2. Current datetime:", today.toISOString());
      
      const lastLogin = userToUpdate.lastLogin ? new Date(userToUpdate.lastLogin) : new Date(0);
      console.log("[STREAK LOG] AuthProvider: 3. Last login datetime from user profile:", lastLogin.toISOString());
      
      const startOfToday = startOfDay(today);
      console.log("[STREAK LOG] AuthProvider: 4. Calculated start of today:", startOfToday.toISOString());

      const startOfLastLoginDay = startOfDay(lastLogin);
      console.log("[STREAK LOG] AuthProvider: 5. Calculated start of last login:", startOfLastLoginDay.toISOString());
      
      const daysSinceLastLogin = differenceInCalendarDays(startOfToday, startOfLastLoginDay);
      console.log("[STREAK LOG] AuthProvider: 6. Days since last login:", daysSinceLastLogin);
      
      let updatedUserData: Partial<UserProfile> = {};
      console.log("[STREAK LOG] AuthProvider: 7. Initialized empty updatedUserData object.");

      if (daysSinceLastLogin > 0) {
          console.log("[STREAK LOG] AuthProvider: 8. Condition MET: daysSinceLastLogin > 0. Entering streak update logic.");
          setStreakPopupOpen(true);
          console.log("[STREAK LOG] AuthProvider: 9. Streak popup triggered.");

          let newStreak = userToUpdate.dailyStreak || 0;
          console.log("[STREAK LOG] AuthProvider: 10. Initial streak:", newStreak);

          let newLongestStreak = userToUpdate.longestStreak || 0;
          console.log("[STREAK LOG] AuthProvider: 11. Initial longest streak:", newLongestStreak);

          let newStreakFreezes = userToUpdate.streakFreezes || 0;
          console.log("[STREAK LOG] AuthProvider: 12. Initial streak freezes:", newStreakFreezes);

          let weeklyActivity = [...(userToUpdate.weeklyActivity || Array(7).fill(0))];
          console.log("[STREAK LOG] AuthProvider: 13. Initial weekly activity array:", weeklyActivity);

          // Shift weekly activity
          const daysToShift = Math.min(daysSinceLastLogin, 7);
          console.log("[STREAK LOG] AuthProvider: 14. Shifting weekly activity by", daysToShift, "days.");

          weeklyActivity = [...weeklyActivity.slice(daysToShift), ...Array(daysToShift).fill(0)];
          console.log("[STREAK LOG] AuthProvider: 15. Shifted weekly activity array:", weeklyActivity);

          if (daysSinceLastLogin === 1) {
              console.log("[STREAK LOG] AuthProvider: 16. Condition MET: daysSinceLastLogin === 1. Continuing streak.");
              newStreak++;
              console.log("[STREAK LOG] AuthProvider: 17. Incremented streak. New streak:", newStreak);
          } else if (daysSinceLastLogin > 1) {
              console.log("[STREAK LOG] AuthProvider: 18. Condition MET: daysSinceLastLogin > 1. Missed multiple days.");
              if (newStreakFreezes > 0) {
                  console.log("[STREAK LOG] AuthProvider: 19. Condition MET: User has streak freezes available.");
                  newStreakFreezes--; // Use a freeze
                  console.log("[STREAK LOG] AuthProvider: 20. Decremented freezes. New count:", newStreakFreezes);
                  toast({ title: "Streak Saved!", description: `You used a free pass to protect your ${newStreak}-day streak.` });
                  console.log("[STREAK LOG] AuthProvider: 21. Displayed 'Streak Saved' toast.");

                  // Mark the missed days as saved in weekly activity
                  console.log("[STREAK LOG] AuthProvider: 22. Starting loop to mark missed days as saved.");
                  for (let i = 1; i < daysToShift; i++) {
                    console.log("[STREAK LOG] AuthProvider: 23. Loop iteration", i);
                    const activityIndex = 6 - i;
                    console.log("[STREAK LOG] AuthProvider: 24. Calculated activityIndex:", activityIndex);
                    if(activityIndex >= 0) {
                        console.log("[STREAK LOG] AuthProvider: 25. Setting weeklyActivity at index", activityIndex, "to 2 (saved).");
                        weeklyActivity[activityIndex] = 2; // '2' represents a saved day
                    } else {
                        console.log("[STREAK LOG] AuthProvider: 26. activityIndex is out of bounds, skipping.");
                    }
                  }
                  console.log("[STREAK LOG] AuthProvider: 27. Finished loop for marking missed days.");
              } else {
                  console.log("[STREAK LOG] AuthProvider: 28. Condition FAILED: User has no streak freezes. Resetting streak.");
                  newStreak = 1; // Reset streak
                  console.log("[STREAK LOG] AuthProvider: 29. Streak reset to 1.");
              }
          }

          console.log("[STREAK LOG] AuthProvider: 30. Marking today as active (index 6, value 1).");
          weeklyActivity[6] = 1; // Mark today as active ('1')
          console.log("[STREAK LOG] AuthProvider: 31. Final weekly activity for update:", weeklyActivity);

          if (newStreak > newLongestStreak) {
              console.log("[STREAK LOG] AuthProvider: 32. New streak is greater than longest streak. Updating longest streak.");
              newLongestStreak = newStreak;
          } else {
              console.log("[STREAK LOG] AuthProvider: 33. New streak is not greater than longest streak.");
          }
          
          const STREAK_MILESTONES = [7, 14, 30];
          console.log("[STREAK LOG] AuthProvider: 34. Checking for streak milestones. Current streak:", newStreak);
          if (STREAK_MILESTONES.includes(newStreak)) {
            console.log("[STREAK LOG] AuthProvider: 35. Milestone MET. Awarding a streak freeze.");
            newStreakFreezes++;
            console.log("[STREAK LOG] AuthProvider: 36. Incremented freezes. New count:", newStreakFreezes);
            toast({
              title: "Streak Milestone Achieved!",
              description: `You've reached a ${newStreak}-day streak and earned a Free Pass!`
            });
            console.log("[STREAK LOG] AuthProvider: 37. Displayed 'Milestone' toast.");
          }
          
          console.log("[STREAK LOG] AuthProvider: 38. Assembling final user data for update.");
          updatedUserData = { 
              dailyStreak: newStreak, 
              longestStreak: newLongestStreak,
              streakFreezes: newStreakFreezes,
              lastLogin: startOfToday.toISOString(),
              weeklyActivity: weeklyActivity
          };
          console.log("[STREAK LOG] AuthProvider: 39. Final updatedUserData object:", updatedUserData);
      } else {
          console.log("[STREAK LOG] AuthProvider: 8. Condition FAILED: daysSinceLastLogin is 0. No streak update needed.");
      }
      
      if (Object.keys(updatedUserData).length > 0) {
        console.log("[STREAK LOG] AuthProvider: 40. updatedUserData has keys, proceeding to update.");
        console.log("[STREAK LOG] AuthProvider: 41. Calling updateUser with new data.");
        const updatedUser = await updateUser(userToUpdate.id, updatedUserData);
        if(updatedUser) {
            console.log("[STREAK LOG] AuthProvider: 42. updateUser successful. Now checking for badges.");
            const newBadges = await checkAndAwardBadges(updatedUser.id);
            console.log("[STREAK LOG] AuthProvider: 43. Badge check complete. New badges found:", newBadges.length);
            newBadges.forEach(badge => {
                toast({
                    title: "Badge Unlocked!",
                    description: `You've earned the "${badge.name}" badge.`,
                });
                console.log("[STREAK LOG] AuthProvider: 44. Displayed toast for new badge:", badge.name);
            });
            console.log("[STREAK LOG] AuthProvider: 45. Re-validating session to get final user state.");
            const finalUser = await validateSession(updatedUser.email, updatedUser.sessionId!);
            console.log("[STREAK LOG] AuthProvider: 46. Returning final user from handleStreakAndBadges.");
            return finalUser || updatedUser;
        } else {
            console.log("[STREAK LOG] AuthProvider: 42. updateUser FAILED. Returning original user.");
        }
      }
      
      console.log("[STREAK LOG] AuthProvider: 47. No updates to streak logic were needed. Returning original user.");
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
