
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart, Users, Settings, Activity, Building2, FileText, MessageSquare, Zap as ZapIcon, ShieldQuestion, UserPlus, Briefcase, Handshake, Mic, ListChecks, Clock, TrendingUp, Megaphone, CalendarDays, Edit3 as CustomizeIcon, PieChartIcon, ShieldAlert, ServerIcon, Info, AlertTriangle, CheckCircle as CheckCircleIcon, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import {
  adminDashboardTourSteps,
} from "@/lib/sample-data";
import { getDashboardData } from "@/lib/actions/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Tenant, UserProfile, SystemAlert } from "@/types"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns"; 
import { useI18n } from "@/hooks/use-i18n";
import { Skeleton } from "../ui/skeleton";

interface TenantActivityStats extends Tenant {
  userCount: number;
  newUsersThisPeriod: number;
  resumesAnalyzedThisPeriod: number;
  communityPostsCountThisPeriod: number;
  jobApplicationsCount: number;
}

const mockTimeSpentData = {
  averageSessionDuration: 25.5,
  topFeaturesByTime: [
    { name: "Resume Analyzer", time: 1200 },
    { name: "Community Feed", time: 950 },
    { name: "Job Tracker", time: 800 },
    { name: "Alumni Connect", time: 700 },
    { name: "Profile Editing", time: 600 },
  ],
  platformUsageData: {
    weekly: [
      { periodLabel: "Week 1", hours: 150 },
      { periodLabel: "Week 2", hours: 180 },
      { periodLabel: "Week 3", hours: 165 },
      { periodLabel: "Week 4", hours: 200 },
    ],
    monthly: [
      { periodLabel: "Jan", hours: 650 },
      { periodLabel: "Feb", hours: 700 },
      { periodLabel: "Mar", hours: 680 },
      { periodLabel: "Apr", hours: 720 },
    ],
  },
  topUsersByTime: (period: 'weekly' | 'monthly', users: UserProfile[]) => users.slice(0,5).map((user) => ({
    name: user.name,
    time: Math.floor(Math.random() * (period === 'weekly' ? 20 : 80)) + (period === 'weekly' ? 5 : 20),
  })).sort((a,b) => b.time - a.time),
};

const aiFeatureUsageData = [
  { name: 'Resume Analyzer', count: 1250, fill: 'hsl(var(--chart-1))' },
  { name: 'Mock Interviews', count: 780, fill: 'hsl(var(--chart-2))' },
  { name: 'Cover Letter Gen', count: 950, fill: 'hsl(var(--chart-3))' },
  { name: 'AI Resume Writer', count: 620, fill: 'hsl(var(--chart-4))' },
  { name: 'Skill Suggestions', count: 1100, fill: 'hsl(var(--chart-5))' },
];

type AdminDashboardWidgetId =
  | 'promotionalSpotlight'
  | 'totalUsersStat'
  | 'totalTenantsStat'
  | 'resumesAnalyzedStat'
  | 'communityPostsStat'
  | 'platformActivityStat'
  | 'jobApplicationsStat'
  | 'alumniConnectionsStat'
  | 'mockInterviewsStat'
  | 'timeSpentStats'
  | 'tenantActivityOverview'
  | 'registrationTrendsChart'
  | 'aiUsageBreakdownChart'
  | 'contentModerationQueueSummary'
  | 'systemAlerts' 
  | 'adminQuickActions';

interface WidgetConfig {
  id: AdminDashboardWidgetId;
  titleKey: string;
  defaultVisible: boolean;
}

const AVAILABLE_WIDGETS: WidgetConfig[] = [
  { id: 'promotionalSpotlight', titleKey: 'adminDashboard.widgets.promotionalSpotlight', defaultVisible: true },
  { id: 'totalUsersStat', titleKey: 'adminDashboard.widgets.totalUsersStat', defaultVisible: true },
  { id: 'totalTenantsStat', titleKey: 'adminDashboard.widgets.totalTenantsStat', defaultVisible: true },
  { id: 'resumesAnalyzedStat', titleKey: 'adminDashboard.widgets.resumesAnalyzedStat', defaultVisible: true },
  { id: 'communityPostsStat', titleKey: 'adminDashboard.widgets.communityPostsStat', defaultVisible: true },
  { id: 'platformActivityStat', titleKey: 'adminDashboard.widgets.platformActivityStat', defaultVisible: true },
  { id: 'jobApplicationsStat', titleKey: 'adminDashboard.widgets.jobApplicationsStat', defaultVisible: true },
  { id: 'alumniConnectionsStat', titleKey: 'adminDashboard.widgets.alumniConnectionsStat', defaultVisible: true },
  { id: 'mockInterviewsStat', titleKey: 'adminDashboard.widgets.mockInterviewsStat', defaultVisible: true },
  { id: 'timeSpentStats', titleKey: 'adminDashboard.widgets.timeSpentStats', defaultVisible: true },
  { id: 'tenantActivityOverview', titleKey: 'adminDashboard.widgets.tenantActivityOverview', defaultVisible: true },
  { id: 'registrationTrendsChart', titleKey: 'adminDashboard.widgets.registrationTrendsChart', defaultVisible: true },
  { id: 'aiUsageBreakdownChart', titleKey: 'adminDashboard.widgets.aiUsageBreakdownChart', defaultVisible: true },
  { id: 'contentModerationQueueSummary', titleKey: 'adminDashboard.widgets.contentModerationQueueSummary', defaultVisible: true },
  { id: 'systemAlerts', titleKey: 'adminDashboard.widgets.systemAlerts', defaultVisible: true }, 
  { id: 'adminQuickActions', titleKey: 'adminDashboard.widgets.adminQuickActions', defaultVisible: true },
];

export default function AdminDashboard() {
  const { t } = useI18n();
  const [showAdminTour, setShowAdminTour] = useState(false);
  const [usagePeriod, setUsagePeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [visibleWidgetIds, setVisibleWidgetIds] = useState<Set<AdminDashboardWidgetId>>(
    new Set(AVAILABLE_WIDGETS.filter(w => w.defaultVisible).map(w => w.id))
  );
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [tempVisibleWidgetIds, setTempVisibleWidgetIds] = useState<Set<AdminDashboardWidgetId>>(visibleWidgetIds);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
      setAlerts(data.systemAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setIsLoading(false);
    }
    loadData();

    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('adminDashboardTourSeen');
      if (!tourSeen) {
        setShowAdminTour(true);
      }
    }
  }, []);

  const platformStats = useMemo(() => {
    if (!dashboardData) return { totalUsers: 0, newSignupsThisPeriod: 0, totalResumesAnalyzedThisPeriod: 0, totalCommunityPostsThisPeriod: 0, activeUsersThisPeriod: 0, totalJobApplicationsThisPeriod: 0, totalAlumniConnections: 0, totalMockInterviews: 0, flaggedPostsCount: 0 };
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const startDate = usagePeriod === 'weekly' ? oneWeekAgo : oneMonthAgo;

    return {
      totalUsers: dashboardData.users.length,
      activeUsersThisPeriod: dashboardData.users.filter((u: UserProfile) => u.lastLogin && new Date(u.lastLogin) >= startDate).length,
      newSignupsThisPeriod: dashboardData.users.filter((u: UserProfile) => u.createdAt && new Date(u.createdAt) >= startDate).length,
      totalResumesAnalyzedThisPeriod: dashboardData.resumeScans.filter((s: any) => new Date(s.scanDate) >= startDate).length,
      totalJobApplicationsThisPeriod: dashboardData.jobApplications.filter((j: any) => new Date(j.dateApplied) >= startDate).length,
      totalCommunityPostsThisPeriod: dashboardData.communityPosts.filter((p: any) => new Date(p.timestamp) >= startDate).length,
      totalAlumniConnections: dashboardData.alumni.length * 5, 
      totalMockInterviews: dashboardData.mockInterviews.length,
      flaggedPostsCount: dashboardData.communityPosts.filter((p: any) => p.moderationStatus === 'flagged').length,
    };
  }, [dashboardData, usagePeriod]);

  const currentTenantActivityData = useMemo(() => {
    if (!dashboardData) return [];

    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const startDate = usagePeriod === 'weekly' ? oneWeekAgo : oneMonthAgo;

    return dashboardData.tenants.map((tenant: Tenant) => {
      const usersInTenant = dashboardData.users.filter((u: UserProfile) => u.tenantId === tenant.id);
      return {
        ...tenant,
        userCount: usersInTenant.length,
        newUsersThisPeriod: usersInTenant.filter((u: UserProfile) => u.createdAt && new Date(u.createdAt) >= startDate).length,
        resumesAnalyzedThisPeriod: dashboardData.resumeScans.filter((s: any) => s.tenantId === tenant.id && new Date(s.scanDate) >= startDate).length,
        communityPostsCountThisPeriod: dashboardData.communityPosts.filter((p: any) => p.tenantId === tenant.id && new Date(p.timestamp) >= startDate).length,
        jobApplicationsCount: dashboardData.jobApplications.filter((j: any) => j.tenantId === tenant.id).length,
      };
    });
  }, [dashboardData, usagePeriod]);

  const registrationTrendsData = useMemo(() => {
      if (!dashboardData) return [];
      return Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const signups = dashboardData.users.filter((u: UserProfile) => u.createdAt && new Date(u.createdAt).toDateString() === date.toDateString()).length;
          return { date: dateString, signups };
      });
  }, [dashboardData]);

  const chartData = currentTenantActivityData.map(tenant => ({
      name: tenant.name.substring(0,15) + (tenant.name.length > 15 ? "..." : ""),
      Users: tenant.userCount,
      NewUsers: tenant.newUsersThisPeriod,
      ResumesAnalyzed: tenant.resumesAnalyzedThisPeriod,
      CommunityPosts: tenant.communityPostsCountThisPeriod,
  }));

  const handleCustomizeToggle = (widgetId: AdminDashboardWidgetId, checked: boolean) => {
    setTempVisibleWidgetIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(widgetId);
      } else {
        newSet.delete(widgetId);
      }
      return newSet;
    });
  };

  const handleSaveCustomization = () => {
    setVisibleWidgetIds(tempVisibleWidgetIds);
    setIsCustomizeDialogOpen(false);
    toast({ 
      title: t("adminDashboard.toast.dashboardUpdated.title"), 
      description: t("adminDashboard.toast.dashboardUpdated.description") 
    });
  };

  const openCustomizeDialog = () => {
    setTempVisibleWidgetIds(new Set(visibleWidgetIds));
    setIsCustomizeDialogOpen(true);
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    const alertToMark = alerts.find(a => a.id === alertId);
    if(alertToMark) {
        // In a real app, you would also update this on the backend.
        // For demo, we just update the local state that came from dashboardData.
    }
    toast({
        title: t("adminDashboard.charts.systemAlerts.alertReadToastTitle"), 
        description: t("adminDashboard.charts.systemAlerts.alertReadToastDescription", { title: alertToMark?.title || "Alert"})
    });
  };

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadAlertsCount = useMemo(() => alerts.filter(a => !a.isRead).length, [alerts]);
  const recentUnreadAlerts = useMemo(() => alerts.filter(a => !a.isRead).slice(0, 3), [alerts]);

  const translatedUsagePeriod = usagePeriod === 'weekly' ? t("adminDashboard.charts.timeSpent.weekly") : t("adminDashboard.charts.timeSpent.monthly");
  
  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-1/2" />
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

  return (
    <>
      <WelcomeTourDialog
        isOpen={showAdminTour}
        onClose={() => setShowAdminTour(false)}
        tourKey="adminDashboardTourSeen"
        steps={adminDashboardTourSteps}
        title="Welcome Admin!"
      />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("adminDashboard.title")}</h1>
                <p className="text-muted-foreground">{t("adminDashboard.description")}</p>
            </div>
            <Button variant="outline" onClick={openCustomizeDialog}>
                <CustomizeIcon className="mr-2 h-4 w-4" /> {t("adminDashboard.customizeButton")}
            </Button>
        </div>


        {visibleWidgetIds.has('promotionalSpotlight') && (
          <Card className="shadow-lg md:col-span-2 lg:col-span-4 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary"/>{t("adminDashboard.promotionalSpotlight.title")}</CardTitle>
              <CardDescription>{t("adminDashboard.promotionalSpotlight.description")}</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">{t("adminDashboard.promotionalSpotlight.content")}</p>
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">{t("adminDashboard.promotionalSpotlight.learnMoreButton")}</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleWidgetIds.has('totalUsersStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.totalUsers.title")}</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.totalUsers.description", { count: platformStats.newSignupsThisPeriod, period: translatedUsagePeriod })}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('totalTenantsStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.totalTenants.title")}</CardTitle>
                <Building2 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.tenants.length}</div>
                <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.totalTenants.description")}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('resumesAnalyzedStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.resumesAnalyzed.title")}</CardTitle>
                <FileText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalResumesAnalyzedThisPeriod}</div>
                <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.resumesAnalyzed.description", { period: translatedUsagePeriod })}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('communityPostsStat') && (
             <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.communityPosts.title")}</CardTitle>
                <MessageSquare className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalCommunityPostsThisPeriod}</div>
                <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.communityPosts.description", { period: translatedUsagePeriod })}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleWidgetIds.has('platformActivityStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.platformActivity.title")}</CardTitle>
                <Activity className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.activeUsersThisPeriod} Active</div>
                <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.platformActivity.description", { period: translatedUsagePeriod })}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('jobApplicationsStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.jobApplications.title")}</CardTitle>
                <Briefcase className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalJobApplicationsThisPeriod}</div>
                <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.jobApplications.description", { period: translatedUsagePeriod })}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('alumniConnectionsStat') && (
             <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.alumniConnections.title")}</CardTitle>
                <Handshake className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalAlumniConnections}</div>
                <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.alumniConnections.description")}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('mockInterviewsStat') && (
             <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.mockInterviews.title")}</CardTitle>
                <Mic className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalMockInterviews}</div>
                <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.mockInterviews.description")}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {visibleWidgetIds.has('registrationTrendsChart') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>{t("adminDashboard.charts.registrationTrends.title")}</CardTitle>
              <CardDescription>{t("adminDashboard.charts.registrationTrends.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrendsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                  <XAxis dataKey="date" tick={{fontSize: 10}}/>
                  <YAxis allowDecimals={false} tick={{fontSize: 10}}/>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px', padding: '4px 8px' }}/>
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Line type="monotone" dataKey="signups" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r:3}} name="New Signups"/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {visibleWidgetIds.has('aiUsageBreakdownChart') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary"/>{t("adminDashboard.charts.aiUsage.title")}</CardTitle>
              <CardDescription>{t("adminDashboard.charts.aiUsage.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={aiFeatureUsageData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {aiFeatureUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/>
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        
        {visibleWidgetIds.has('contentModerationQueueSummary') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive"/>{t("adminDashboard.charts.contentModeration.title")}</CardTitle>
              <CardDescription>{t("adminDashboard.charts.contentModeration.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center py-8">
               <div className="text-4xl font-bold text-destructive">{platformStats.flaggedPostsCount}</div>
               <p className="text-muted-foreground mt-1 mb-4">{t("adminDashboard.charts.contentModeration.flaggedPosts")}</p>
               <Button asChild>
                   <Link href="/admin/content-moderation">{t("adminDashboard.charts.contentModeration.reviewButton")}</Link>
               </Button>
            </CardContent>
          </Card>
        )}

        {visibleWidgetIds.has('systemAlerts') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServerIcon className="h-5 w-5 text-primary"/>{t("adminDashboard.charts.systemAlerts.title")}
                {unreadAlertsCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {t("adminDashboard.charts.systemAlerts.unreadAlertsCount", { count: unreadAlertsCount })}
                    </span>
                )}
              </CardTitle>
              <CardDescription>{t("adminDashboard.charts.systemAlerts.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t("adminDashboard.charts.systemAlerts.noAlerts")}</p>
              ) : (
                <ScrollArea className="h-[300px] pr-3">
                  <ul className="space-y-3">
                    {recentUnreadAlerts.map(alert => (
                      <li key={alert.id} className={cn("p-3 border rounded-md flex items-start gap-3", alert.isRead && "opacity-60 bg-secondary/30", alert.type === 'error' ? "border-destructive/50" : alert.type === 'warning' ? "border-yellow-500/50" : "border-border")}>
                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1">
                          <p className={cn("font-medium text-sm", alert.type === 'error' ? "text-destructive" : alert.type === 'warning' ? "text-yellow-600" : "text-foreground")}>{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true })}</p>
                           {alert.linkTo && <Button variant="link" size="xs" asChild className="p-0 h-auto mt-1"><Link href={alert.linkTo}>{alert.linkText || 'View Details'}</Link></Button>}
                        </div>
                        {!alert.isRead && (
                          <Button variant="outline" size="xs" onClick={() => handleMarkAlertAsRead(alert.id)} className="text-xs h-6">{t("adminDashboard.charts.systemAlerts.markReadButton")}</Button>
                        )}
                      </li>
                    ))}
                    {alerts.filter(a => a.isRead).slice(0, Math.max(0, 3 - recentUnreadAlerts.length)).map(alert => (
                       <li key={alert.id} className={cn("p-3 border rounded-md flex items-start gap-3 opacity-60 bg-secondary/30", alert.type === 'error' ? "border-destructive/50" : alert.type === 'warning' ? "border-yellow-500/50" : "border-border")}>
                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1">
                          <p className={cn("font-medium text-sm", alert.type === 'error' ? "text-destructive" : alert.type === 'warning' ? "text-yellow-600" : "text-foreground")}>{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true })}</p>
                           {alert.linkTo && <Button variant="link" size="xs" asChild className="p-0 h-auto mt-1"><Link href={alert.linkTo}>{alert.linkText || 'View Details'}</Link></Button>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
             {alerts.length > 3 && (
                 <CardFooter>
                    <Button variant="link" size="sm" className="mx-auto">{t("adminDashboard.charts.systemAlerts.viewAllButton")}</Button>
                 </CardFooter>
            )}
          </Card>
        )}

        {visibleWidgetIds.has('timeSpentStats') && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary"/>{t("adminDashboard.charts.timeSpent.title")}</CardTitle>
                <CardDescription>{t("adminDashboard.charts.timeSpent.description")}</CardDescription>
              </div>
              <Tabs value={usagePeriod} onValueChange={(value) => setUsagePeriod(value as 'weekly' | 'monthly')} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-2 h-9 sm:w-auto">
                      <TabsTrigger value="weekly" className="text-xs py-1 px-2">{t("adminDashboard.charts.timeSpent.weekly")}</TabsTrigger>
                      <TabsTrigger value="monthly" className="text-xs py-1 px-2">{t("adminDashboard.charts.timeSpent.monthly")}</TabsTrigger>
                  </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-secondary/30">
                      <CardHeader className="pb-2"><CardTitle className="text-base">{t("adminDashboard.charts.timeSpent.avgSessionDuration")}</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold text-primary">{mockTimeSpentData.averageSessionDuration} min</p></CardContent>
                  </Card>
                   <Card className="bg-secondary/30">
                      <CardHeader className="pb-2">
                           <CardTitle className="text-base">{t("adminDashboard.charts.timeSpent.totalPlatformUsage", { period: translatedUsagePeriod})}</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[100px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={mockTimeSpentData.platformUsageData[usagePeriod]} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                                  <XAxis dataKey="periodLabel" tick={{fontSize: 10}}/>
                                  <YAxis tick={{fontSize: 10}}/>
                                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px', padding: '4px 8px' }}/>
                                  <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r:3}}/>
                              </LineChart>
                          </ResponsiveContainer>
                      </CardContent>
                  </Card>
                  <Card className="bg-secondary/30 md:col-span-2 lg:col-span-1">
                      <CardHeader className="pb-2"><CardTitle className="text-base">{t("adminDashboard.charts.timeSpent.topUsers", { period: translatedUsagePeriod})}</CardTitle></CardHeader>
                      <CardContent>
                          <ul className="space-y-1 text-xs">
                              {mockTimeSpentData.topUsersByTime(usagePeriod, dashboardData.users).map((user:any) => (
                                  <li key={user.name} className="flex justify-between">
                                      <span>{user.name}</span>
                                      <span className="font-semibold">{user.time} hrs</span>
                                  </li>
                              ))}
                          </ul>
                      </CardContent>
                  </Card>
              </div>
              <div>
                  <h4 className="font-semibold text-md mb-2">{t("adminDashboard.charts.timeSpent.mostUsedFeatures")}</h4>
                  <div className="space-y-2">
                      {mockTimeSpentData.topFeaturesByTime.map(feature => (
                          <div key={feature.name} className="text-sm">
                              <div className="flex justify-between mb-0.5">
                                  <span>{feature.name}</span>
                                  <span className="text-muted-foreground">{Math.round(feature.time / 60)} hrs ({feature.time} min)</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                  <div className="bg-primary h-1.5 rounded-full" style={{width: `${(feature.time / mockTimeSpentData.topFeaturesByTime[0].time) * 100}%`}}></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
            </CardContent>
          </Card>
        )}

        {visibleWidgetIds.has('tenantActivityOverview') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("adminDashboard.charts.tenantActivity.title", {period: translatedUsagePeriod})}</CardTitle>
              <CardDescription>{t("adminDashboard.charts.tenantActivity.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 10}}/>
                    <YAxis allowDecimals={false}/>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <RechartsBar dataKey="NewUsers" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name={t("adminDashboard.charts.tenantActivity.legendNewUsers")} />
                    <RechartsBar dataKey="ResumesAnalyzed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name={t("adminDashboard.charts.tenantActivity.legendResumesAnalyzed")}/>
                    <RechartsBar dataKey="CommunityPosts" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name={t("adminDashboard.charts.tenantActivity.legendCommunityPosts")}/>
                  </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {visibleWidgetIds.has('adminQuickActions') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("adminDashboard.quickActions.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/user-management"><Users className="mr-2 h-4 w-4 shrink-0"/>{t("adminDashboard.quickActions.manageUsers")}</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/platform-settings"><Settings className="mr-2 h-4 w-4 shrink-0"/>{t("adminDashboard.quickActions.platformSettings")}</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/tenants"><Building2 className="mr-2 h-4 w-4 shrink-0"/>{t("adminDashboard.quickActions.manageTenants")}</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/content-moderation"><MessageSquare className="mr-2 h-4 w-4 shrink-0"/>{t("adminDashboard.quickActions.contentModeration")}</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/announcements"><Megaphone className="mr-2 h-4 w-4 shrink-0"/>{t("adminDashboard.quickActions.announcements")}</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/gamification-rules"><ListChecks className="mr-2 h-4 w-4 shrink-0"/>{t("adminDashboard.quickActions.gamificationRules")}</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/blog-settings"><FileText className="mr-2 h-4 w-4 shrink-0"/>{t("adminDashboard.quickActions.blogSettings")}</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/analytics/user-activity"><TrendingUp className="mr-2 h-4 w-4 shrink-0"/>{t("adminDashboard.quickActions.userActivityAnalytics")}</Link></Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("adminDashboard.customizeDialog.title")}</DialogTitle>
            <DialogUIDescription>
              {t("adminDashboard.customizeDialog.description")}
            </DialogUIDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1 -mx-1">
            <div className="space-y-3 p-4">
              {AVAILABLE_WIDGETS.map((widget) => (
                <div key={widget.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/30">
                  <Checkbox
                    id={`widget-toggle-${widget.id}`}
                    checked={tempVisibleWidgetIds.has(widget.id)}
                    onCheckedChange={(checked) => handleCustomizeToggle(widget.id, Boolean(checked))}
                  />
                  <Label htmlFor={`widget-toggle-${widget.id}`} className="font-normal text-sm flex-1 cursor-pointer">
                    {t(widget.titleKey)}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomizeDialogOpen(false)}>{t("adminDashboard.customizeDialog.cancelButton")}</Button>
            <Button onClick={handleSaveCustomization} className="bg-primary hover:bg-primary/90">{t("adminDashboard.customizeDialog.saveButton")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
