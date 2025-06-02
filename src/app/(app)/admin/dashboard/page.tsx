
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { LayoutDashboard } from "lucide-react"; 
import AdminDashboard from "@/components/dashboards/AdminDashboard";


export default function AdminDashboardPage() {
  const { t } = useI18n();
  const pageTitle = "Admin Dashboard";

  return (
     <AdminDashboard />
  );
}
