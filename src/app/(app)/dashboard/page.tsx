
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useEffect, useState } from "react";
import type { UserProfile, UserRole } from "@/types";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import DailyStreakPopup from "@/components/features/DailyStreakPopup";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import { userDashboardTourSteps, adminDashboardTourSteps, managerDashboardTourSteps } from "@/lib/sample-data";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { t } = useI18n();
  const { user, isLoading } = useAuth();
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<any[]>([]);
  const [tourKey, setTourKey] = useState('');
  const [tourTitle, setTourTitle] = useState('');

  useEffect(() => {
    if (isLoading || !user) return;

    const role = user.role;
    
    const today = new Date().toISOString().split('T')[0];
    if (typeof window !== 'undefined') {
      // Condition to show popup for user, manager, or admin roles
      if (role === 'user' || role === 'manager' || role === 'admin') {
        const popupShownKey = `dailyStreakPopupShown_${user.id}_${today}`;
        if (!localStorage.getItem(popupShownKey)) {
          console.log(`[DashboardPage] Daily streak popup condition met for user ${user.id}, role ${role}. Key: ${popupShownKey}`);
          setShowStreakPopup(true);
          localStorage.setItem(popupShownKey, 'true');
        } else {
          console.log(`[DashboardPage] Daily streak popup already shown today for user ${user.id}. Key: ${popupShownKey}`);
        }
      }

      let currentTourKey = '';
      let currentTourSteps: any[] = [];
      let currentTourTitle = '';

      if (role === 'admin') {
        // Admins are redirected, so this tour might not be seen here.
        // Kept for robustness in case of direct navigation.
        currentTourKey = 'adminDashboardTourSeen';
        currentTourSteps = adminDashboardTourSteps;
        currentTourTitle = "Welcome Admin!";
      } else if (role === 'manager') {
        currentTourKey = 'managerDashboardTourSeen';
        currentTourSteps = managerDashboardTourSteps;
        currentTourTitle = "Welcome Manager!";
      } else { // user
        currentTourKey = 'userDashboardTourSeen';
        currentTourSteps = userDashboardTourSteps;
        currentTourTitle = "Welcome to Your Dashboard!";
      }

      setTourKey(currentTourKey);
      setTourSteps(currentTourSteps);
      setTourTitle(currentTourTitle);

      const tourSeen = localStorage.getItem(currentTourKey);
      if (!tourSeen) {
        setShowWelcomeTour(true);
      }
    }
  }, [isLoading, user]);
  
  useEffect(() => {
    const handleShowStreakPopup = () => setShowStreakPopup(true);
    
    window.addEventListener('show-streak-popup', handleShowStreakPopup);

    return () => {
      window.removeEventListener('show-streak-popup', handleShowStreakPopup);
    };
  }, []);

  const handleCloseStreakPopup = () => {
    setShowStreakPopup(false);
  };

  const handleCloseWelcomeTour = () => {
    setShowWelcomeTour(false);
    if (typeof window !== 'undefined' && tourKey) {
      localStorage.setItem(tourKey, 'true');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        // Admin users should be on /admin/dashboard. This is a fallback.
        return <AdminDashboard user={user} />;
      case 'manager':
        return <ManagerDashboard user={user} />;
      case 'user':
      default:
        return <UserDashboard user={user} />;
    }
  };

  return (
    <>
      {renderDashboard()}
      {(user.role === 'user' || user.role === 'manager' || user.role === 'admin') && user && (
         <DailyStreakPopup
          isOpen={showStreakPopup}
          onClose={handleCloseStreakPopup}
          userProfile={user}
        />
      )}
      {tourSteps.length > 0 && tourKey && (
         <WelcomeTourDialog
          isOpen={showWelcomeTour}
          onClose={handleCloseWelcomeTour}
          tourKey={tourKey}
          steps={tourSteps}
          title={tourTitle}
        />
      )}
    </>
  );
}
