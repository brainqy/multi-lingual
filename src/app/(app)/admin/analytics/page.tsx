
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, MessageSquare, TrendingUp, BarChart, PieChart as PieChartIcon, Activity, Building2 } from "lucide-react";
import { getDashboardData } from "@/lib/actions/dashboard";
import type { UserProfile, Tenant } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useI18n } from "@/hooks/use-i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AnalyticsDashboardPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const {
    kpiStats,
    userGrowthData,
    featureAdoptionData,
    tenantActivityData,
  } = useMemo(() => {
    if (!dashboardData) return { kpiStats: {}, userGrowthData: [], featureAdoptionData: [], tenantActivityData: [] };
    
    const { from, to } = dateRange || {};
    const filteredUsers = dashboardData.users.filter((u: UserProfile) => {
        const createdAt = u.createdAt ? new Date(u.createdAt) : null;
        if (!createdAt) return false;
        return (!from || createdAt >= from) && (!to || createdAt <= to);
    });
    
    const usersForTenantFilter = selectedTenantId === 'all'
        ? dashboardData.users
        : dashboardData.users.filter((u: UserProfile) => u.tenantId === selectedTenantId);

    const kpis = {
      totalUsers: usersForTenantFilter.length,
      newSignups: filteredUsers.length,
      activeUsers: usersForTenantFilter.filter((u: UserProfile) => u.lastLogin && new Date(u.lastLogin) >= (from || new Date(0))).length,
    };

    const growthData: { date: string; signups: number }[] = [];
    if (from && to) {
        let currentDate = new Date(from);
        while (currentDate <= to) {
            const dateString = format(currentDate, 'MMM d');
            const signups = dashboardData.users.filter((u: UserProfile) => u.createdAt && format(new Date(u.createdAt), 'MMM d') === dateString).length;
            growthData.push({ date: dateString, signups });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    const featureData = [
        { name: 'Resume Scans', count: dashboardData.resumeScans.length },
        { name: 'Job Apps', count: dashboardData.jobApplications.length },
        { name: 'Community Posts', count: dashboardData.communityPosts.length },
        { name: 'Appointments', count: dashboardData.appointments.length },
        { name: 'Mock Interviews', count: dashboardData.mockInterviews.length },
    ];

    const tenantData = dashboardData.tenants.map((tenant: Tenant) => ({
      name: tenant.name,
      userCount: dashboardData.users.filter((u: UserProfile) => u.tenantId === tenant.id).length,
      activityScore: (dashboardData.resumeScans.filter((s: any) => s.tenantId === tenant.id).length * 2) + 
                     (dashboardData.communityPosts.filter((p: any) => p.tenantId === tenant.id).length)
    }));

    return { kpiStats: kpis, userGrowthData: growthData, featureAdoptionData: featureData, tenantActivityData: tenantData };
  }, [dashboardData, dateRange, selectedTenantId]);

  if (isLoading || !currentUser) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart className="h-8 w-8" />
            Platform Analytics
          </h1>
          <CardDescription>
            Insights into user growth, engagement, and feature adoption.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           <DatePickerWithRange date={dateRange} setDate={setDateRange} />
           <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Tenant" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Tenants</SelectItem>
                    {dashboardData?.tenants.map((t: Tenant) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
           </Select>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.totalUsers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">New Signups (Period)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.newSignups}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Active Users (Period)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.activeUsers}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Growth Trends</CardTitle>
          <CardDescription>New user signups over the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <RechartsBar dataKey="signups" fill="hsl(var(--primary))" name="New Signups"/>
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Adoption</CardTitle>
            <CardDescription>Total usage count for key platform features.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie data={featureAdoptionData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label>
                        {featureAdoptionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip/>
                    <Legend/>
                </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tenant Leaderboard</CardTitle>
            <CardDescription>Most active tenants by user count and activity score.</CardDescription>
          </CardHeader>
           <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={tenantActivityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 10}}/>
                <Tooltip />
                <Legend />
                <RechartsBar dataKey="userCount" fill="hsl(var(--chart-1))" name="Total Users" />
                <RechartsBar dataKey="activityScore" fill="hsl(var(--chart-2))" name="Activity Score"/>
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
