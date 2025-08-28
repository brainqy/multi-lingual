
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, MessageSquare, TrendingUp, BarChart, PieChart as PieChartIcon, Activity, Building2, Percent, Users2, Coins, Trophy, ThumbsUp } from "lucide-react";
import { getDashboardData } from "@/lib/actions/dashboard";
import type { UserProfile, Tenant } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useI18n } from "@/hooks/use-i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays, endOfWeek, format, startOfISOWeek, isAfter, isSameDay, addWeeks } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    retentionData,
    coinStats,
  } = useMemo(() => {
    if (!dashboardData) return { kpiStats: {}, userGrowthData: [], featureAdoptionData: [], tenantActivityData: [], retentionData: [], coinStats: { totalInCirculation: 0, totalEarned: 0, totalSpent: 0, spendingByCategory: [], topEarners: [], topSpenders: [] } };
    
    const { from, to } = dateRange || {};
    const filteredUsers = dashboardData.users.filter((u: UserProfile) => {
        const createdAt = u.createdAt ? new Date(u.createdAt) : null;
        if (!createdAt) return false;
        return (!from || createdAt >= from) && (!to || createdAt <= to);
    });
    
    const usersForTenantFilter = selectedTenantId === 'all'
        ? dashboardData.users
        : dashboardData.users.filter((u: UserProfile) => u.tenantId === selectedTenantId);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = subDays(today, 29);

    const dau = usersForTenantFilter.filter((u: UserProfile) => u.lastLogin && isSameDay(new Date(u.lastLogin), today)).length;
    const mau = usersForTenantFilter.filter((u: UserProfile) => u.lastLogin && isAfter(new Date(u.lastLogin), thirtyDaysAgo)).length;


    const kpis = {
      totalUsers: usersForTenantFilter.length,
      newSignups: filteredUsers.length,
      dau: dau,
      mau: mau,
      stickiness: mau > 0 ? parseFloat(((dau / mau) * 100).toFixed(1)) : 0,
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

    // --- Retention Cohort Calculation ---
    const cohorts: Record<string, { total: number; retained: number[] }> = {};
    const cohortWeeks = 8; 
    const firstWeekStart = startOfISOWeek(subDays(now, (cohortWeeks - 1) * 7));

    for (const user of usersForTenantFilter) {
      if (!user.createdAt) continue;
      const signupDate = new Date(user.createdAt);
      if (isAfter(signupDate, firstWeekStart)) {
        const cohortWeekStart = startOfISOWeek(signupDate);
        const cohortKey = format(cohortWeekStart, 'yyyy-MM-dd');
        
        if (!cohorts[cohortKey]) {
          cohorts[cohortKey] = { total: 0, retained: Array(cohortWeeks).fill(0) };
        }
        cohorts[cohortKey].total++;

        for (let i = 0; i < cohortWeeks; i++) {
          const weekStart = addWeeks(cohortWeekStart, i);
          const weekEnd = endOfWeek(weekStart);
          const userWasActive = dashboardData.activities.some((act: any) => 
            act.userId === user.id && 
            new Date(act.timestamp) >= weekStart && 
            new Date(act.timestamp) <= weekEnd
          );
          if (userWasActive) {
            cohorts[cohortKey].retained[i]++;
          }
        }
      }
    }

    const retention = Object.entries(cohorts).map(([date, data]) => ({
      cohort: `Week of ${format(new Date(date), 'MMM d')}`,
      total: data.total,
      weeks: data.retained.map(count => (data.total > 0 ? parseFloat(((count / data.total) * 100).toFixed(1)) : 0))
    })).sort((a,b) => new Date(b.cohort.replace('Week of ', '')).getTime() - new Date(a.cohort.replace('Week of ', '')).getTime());


    return { kpiStats: kpis, userGrowthData: growthData, featureAdoptionData: featureData, tenantActivityData: tenantData, retentionData: retention, coinStats: dashboardData.coinStats };
  }, [dashboardData, dateRange, selectedTenantId]);
  
  const getRetentionColor = (percentage: number) => {
    if (percentage > 50) return 'bg-primary/80 text-primary-foreground';
    if (percentage > 30) return 'bg-primary/60 text-primary-foreground';
    if (percentage > 20) return 'bg-primary/40 text-foreground';
    if (percentage > 10) return 'bg-primary/20 text-foreground';
    if (percentage > 0) return 'bg-primary/10 text-muted-foreground';
    return 'bg-muted/50 text-muted-foreground';
  };

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
      
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Users2/>Total Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.totalUsers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Users/>New Signups (Period)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.newSignups}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Activity/>Daily Active Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.dau}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Activity/>Monthly Active Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.mau}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Percent/>Stickiness (DAU/MAU)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.stickiness}%</p></CardContent></Card>
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
      
       <Card>
        <CardHeader>
          <CardTitle>User Retention by Signup Week</CardTitle>
          <CardDescription>Percentage of new users who returned in the weeks following their signup.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium text-muted-foreground">Cohort</th>
                <th className="p-2 text-center font-medium text-muted-foreground">New Users</th>
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="p-2 text-center font-medium text-muted-foreground">Week {i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retentionData.map((row) => (
                <tr key={row.cohort} className="border-b">
                  <td className="p-2 font-medium">{row.cohort}</td>
                  <td className="p-2 text-center">{row.total}</td>
                  {row.weeks.map((percentage, i) => (
                    <td key={i} className={`p-2 text-center ${getRetentionColor(percentage)}`}>
                      {percentage > 0 ? `${percentage}%` : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tenant Leaderboard</CardTitle>
            <CardDescription>Most active tenants by user count and activity score.</CardDescription>
          </CardHeader>
           <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={tenantActivityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 10}}/>
                <Tooltip />
                <Legend />
                <RechartsBar dataKey="userCount" fill="hsl(var(--chart-1))" name="Total Users" />
                <RechartsBar dataKey="activityScore" fill="hsl(var(--chart-2))" name="Activity Score"/>
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary"/>Coin Spending by Feature</CardTitle>
                <CardDescription>What users are spending their coins on.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie data={coinStats.spendingByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {coinStats.spendingByCategory.map((entry: any, index: number) => <Cell key={`cell-spend-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary"/>Top Coin Earners</CardTitle><CardDescription>Users who earned the most coins (all time).</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>User</TableHead><TableHead className="text-right">Coins Earned</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {coinStats.topEarners.map((user: {name: string, value: number}, index: number) => (
                            <TableRow key={index}><TableCell>{user.name}</TableCell><TableCell className="text-right font-semibold">{user.value.toLocaleString()}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ThumbsUp className="h-5 w-5 text-primary"/>Top Coin Spenders</CardTitle><CardDescription>Users who spent the most coins (all time).</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>User</TableHead><TableHead className="text-right">Coins Spent</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {coinStats.topSpenders.map((user: {name: string, value: number}, index: number) => (
                            <TableRow key={index}><TableCell>{user.name}</TableCell><TableCell className="text-right font-semibold">{user.value.toLocaleString()}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

    