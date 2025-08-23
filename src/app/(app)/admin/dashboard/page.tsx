
"use client";

import { useI18n } from "@/hooks/use-i18n";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import { useAuth } from "@/hooks/use-auth";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (user?.role.toLowerCase() !== 'admin') {
    return <AccessDeniedMessage />;
  }

  return (
     <AdminDashboard user={user} />
  );
}
