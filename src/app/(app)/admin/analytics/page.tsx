
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, MessageSquare, TrendingUp, BarChart, PieChart as PieChartIcon, Activity, Building2, Percent, Users2, Coins, Trophy, ThumbsUp, DollarSign, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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
    if (!dashboardData) {
      return {
        kpiStats: { totalUsers: 0, newSignups: 0, dau: 0, mau: 0, stickiness: 0 },
        userGrowthData: [],
        featureAdoptionData: [],
        tenantActivityData: [],
        retentionData: [],
        coinStats: { totalInCirculation: 0, totalEarned: 0, totalSpent: 0, spendingByCategory: [], topEarners: [], topSpenders: [] }
      };
    }
    
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
        { name: t("adminAnalytics.features.resumeScans"), count: dashboardData.resumeScans.length },
        { name: t("adminAnalytics.features.jobApps"), count: dashboardData.jobApplications.length },
        { name: t("adminAnalytics.features.communityPosts"), count: dashboardData.communityPosts.length },
        { name: t("adminAnalytics.features.appointments"), count: dashboardData.appointments.length },
        { name: t("adminAnalytics.features.mockInterviews"), count: dashboardData.mockInterviews.length },
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
      cohort: t("adminAnalytics.retention.cohortDate", { date: format(new Date(date), 'MMM d') }),
      total: data.total,
      weeks: data.retained.map(count => (data.total > 0 ? parseFloat(((count / data.total) * 100).toFixed(1)) : 0))
    })).sort((a,b) => new Date(b.cohort.replace(t("adminAnalytics.retention.cohortPrefix"), '')).getTime() - new Date(a.cohort.replace(t("adminAnalytics.retention.cohortPrefix"), '')).getTime());


    return { kpiStats: kpis, userGrowthData: growthData, featureAdoptionData: featureData, tenantActivityData: tenantData, retentionData: retention, coinStats: dashboardData.coinStats };
  }, [dashboardData, dateRange, selectedTenantId, t]);
  
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
            {t("adminAnalytics.pageTitle")}
          </h1>
          <CardDescription>
            {t("adminAnalytics.pageDescription")}
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           <DatePickerWithRange date={dateRange} setDate={setDateRange} />
           <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t("adminAnalytics.filters.selectTenant")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t("adminAnalytics.filters.allTenants")}</SelectItem>
                    {dashboardData?.tenants.map((t: Tenant) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
           </Select>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Users2/>{t("adminAnalytics.kpi.totalUsers")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.totalUsers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Users/>{t("adminAnalytics.kpi.newSignups")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.newSignups}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Activity/>{t("adminAnalytics.kpi.dau")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.dau}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Activity/>{t("adminAnalytics.kpi.mau")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.mau}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><Percent/>{t("adminAnalytics.kpi.stickiness")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpiStats.stickiness}%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("adminAnalytics.charts.userGrowth.title")}</CardTitle>
          <CardDescription>{t("adminAnalytics.charts.userGrowth.description")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <RechartsBar dataKey="signups" fill="hsl(var(--primary))" name={t("adminAnalytics.charts.userGrowth.legend")}/>
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>{t("adminAnalytics.retention.title")}</CardTitle>
          <CardDescription>{t("adminAnalytics.retention.description")}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium text-muted-foreground">{t("adminAnalytics.retention.cohortColumn")}</th>
                <th className="p-2 text-center font-medium text-muted-foreground">{t("adminAnalytics.retention.newUsersColumn")}</th>
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="p-2 text-center font-medium text-muted-foreground">{t("adminAnalytics.retention.weekColumn", { week: i })}</th>
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
            <CardTitle>{t("adminAnalytics.charts.featureAdoption.title")}</CardTitle>
            <CardDescription>{t("adminAnalytics.charts.featureAdoption.description")}</CardDescription>
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
            <CardTitle>{t("adminAnalytics.charts.tenantLeaderboard.title")}</CardTitle>
            <CardDescription>{t("adminAnalytics.charts.tenantLeaderboard.description")}</CardDescription>
          </CardHeader>
           <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={tenantActivityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 10}}/>
                <Tooltip />
                <Legend />
                <RechartsBar dataKey="userCount" fill="hsl(var(--chart-1))" name={t("adminAnalytics.charts.tenantLeaderboard.legendUsers")} />
                <RechartsBar dataKey="activityScore" fill="hsl(var(--chart-2))" name={t("adminAnalytics.charts.tenantLeaderboard.legendActivity")}/>
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Coins className="h-6 w-6 text-primary"/>{t("adminAnalytics.coinEconomy.title")}</CardTitle>
          <CardDescription>{t("adminAnalytics.coinEconomy.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><DollarSign/>{t("adminAnalytics.coinEconomy.totalInCirculation")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{coinStats.totalInCirculation.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><ArrowUpCircle className="text-green-500"/>{t("adminAnalytics.coinEconomy.totalEarned")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{coinStats.totalEarned.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm font-medium flex items-center gap-1"><ArrowDownCircle className="text-red-500"/>{t("adminAnalytics.coinEconomy.totalSpent")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{coinStats.totalSpent.toLocaleString()}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary"/>{t("adminAnalytics.coinEconomy.spendingByCategory")}</CardTitle>
                    <CardDescription>{t("adminAnalytics.coinEconomy.spendingDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                            <Pie data={coinStats.spendingByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {coinStats.spendingByCategory.map((entry: any, index: number) => <Cell key={`cell-spend-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend wrapperStyle={{fontSize: '12px'}}/>
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary"/>{t("adminAnalytics.coinEconomy.topUsers")}</CardTitle><CardDescription>{t("adminAnalytics.coinEconomy.topUsersDescription")}</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <h4 className="font-semibold mb-2">{t("adminAnalytics.coinEconomy.topEarners")}</h4>
                      <Table>
                          <TableHeader><TableRow><TableHead>{t("adminAnalytics.coinEconomy.userColumn")}</TableHead><TableHead className="text-right">{t("adminAnalytics.coinEconomy.coinsEarnedColumn")}</TableHead></TableRow></TableHeader>
                          <TableBody>
                              {coinStats.topEarners.map((user: {name: string, value: number}, index: number) => (
                                  <TableRow key={index}><TableCell>{user.name}</TableCell><TableCell className="text-right font-semibold">{user.value.toLocaleString()}</TableCell></TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>
                  <div>
                      <h4 className="font-semibold mb-2">{t("adminAnalytics.coinEconomy.topSpenders")}</h4>
                      <Table>
                          <TableHeader><TableRow><TableHead>{t("adminAnalytics.coinEconomy.userColumn")}</TableHead><TableHead className="text-right">{t("adminAnalytics.coinEconomy.coinsSpentColumn")}</TableHead></TableRow></TableHeader>
                          <TableBody>
                              {coinStats.topSpenders.map((user: {name: string, value: number}, index: number) => (
                                  <TableRow key={index}><TableCell>{user.name}</TableCell><TableCell className="text-right font-semibold">{user.value.toLocaleString()}</TableCell></TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
