
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart, Users, Settings, Activity, Building2, FileText, MessageSquare, Zap as ZapIcon, ShieldQuestion, UserPlus, Briefcase, Handshake, Mic, ListChecks, Clock, TrendingUp, Megaphone, CalendarDays, Edit3 as CustomizeIcon, PieChartIcon, ShieldAlert, ServerIcon, Info, AlertTriangle, CheckCircle as CheckCircleIcon, Loader2, Coins, ThumbsUp, ThumbsDown, Target } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import {
  adminDashboardTourSteps,
} from "@/lib/sample-data";
import { getDashboardData } from "@/lib/actions/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Tenant, UserProfile, SystemAlert, CommunityPost, Affiliate } from "@/types"; 
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
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

interface AdminDashboardProps {
  user: UserProfile; 
}

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
  | 'tenantActivityOverview'
  | 'registrationTrendsChart'
  | 'aiUsageBreakdownChart'
  | 'contentModerationQueueSummary'
  | 'systemAlerts' 
  | 'adminQuickActions'
  | 'coinEconomyStats'
  | 'affiliateProgramStat'
  | 'featureUsage';

interface WidgetConfig {
  id: AdminDashboardWidgetId;
  titleKey: string;
  defaultVisible: boolean;
}

const AVAILABLE_WIDGETS: WidgetConfig[] = [
  { id: 'promotionalSpotlight', titleKey: 'adminDashboard.widgets.promotionalSpotlight', defaultVisible: true },
  { id: 'totalUsersStat', titleKey: 'adminDashboard.widgets.totalUsersStat', defaultVisible: true },
  { id: 'totalTenantsStat', titleKey: 'adminDashboard.widgets.totalTenantsStat', defaultVisible: true },
  { id: 'platformActivityStat', titleKey: 'adminDashboard.widgets.platformActivityStat', defaultVisible: true },
  { id: 'affiliateProgramStat', titleKey: 'adminDashboard.widgets.affiliateProgramStat', defaultVisible: true },
  { id: 'resumesAnalyzedStat', titleKey: 'adminDashboard.widgets.resumesAnalyzedStat', defaultVisible: true },
  { id: 'jobApplicationsStat', titleKey: 'adminDashboard.widgets.jobApplicationsStat', defaultVisible: true },
  { id: 'communityPostsStat', titleKey: 'adminDashboard.widgets.communityPostsStat', defaultVisible: true },
  { id: 'alumniConnectionsStat', titleKey: 'adminDashboard.widgets.alumniConnectionsStat', defaultVisible: true },
  { id: 'mockInterviewsStat', titleKey: 'adminDashboard.widgets.mockInterviewsStat', defaultVisible: true },
  { id: 'coinEconomyStats', titleKey: 'adminDashboard.widgets.coinEconomyStats', defaultVisible: true },
  { id: 'featureUsage', titleKey: 'adminDashboard.widgets.featureUsage', defaultVisible: true },
  { id: 'tenantActivityOverview', titleKey: 'adminDashboard.widgets.tenantActivityOverview', defaultVisible: true },
  { id: 'registrationTrendsChart', titleKey: 'adminDashboard.widgets.registrationTrendsChart', defaultVisible: false },
  { id: 'aiUsageBreakdownChart', titleKey: 'adminDashboard.widgets.aiUsageBreakdownChart', defaultVisible: false },
  { id: 'contentModerationQueueSummary', titleKey: 'adminDashboard.widgets.contentModerationQueueSummary', defaultVisible: true },
  { id: 'systemAlerts', titleKey: 'adminDashboard.widgets.systemAlerts', defaultVisible: true }, 
  { id: 'adminQuickActions', titleKey: 'adminDashboard.widgets.adminQuickActions', defaultVisible: true },
];

export default function AdminDashboard({ user }: AdminDashboardProps) {
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
      setAlerts(data.systemAlerts.sort((a: SystemAlert, b: SystemAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
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
    if (!dashboardData) return { totalUsers: 0, newSignupsThisPeriod: 0, totalResumesAnalyzedThisPeriod: 0, totalCommunityPostsThisPeriod: 0, activeUsersThisPeriod: 0, totalJobApplicationsThisPeriod: 0, totalAlumniConnections: 0, totalMockInterviews: 0, flaggedPostsCount: 0, totalAffiliates: 0, pendingAffiliates: 0 };
    
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
      totalAlumniConnections: dashboardData.appointments.length, 
      totalMockInterviews: dashboardData.mockInterviews.length,
      flaggedPostsCount: dashboardData.communityPosts.filter((p: any) => p.moderationStatus === 'flagged').length,
      totalAffiliates: dashboardData.affiliates.filter((a: Affiliate) => a.status === 'approved').length,
      pendingAffiliates: dashboardData.affiliates.filter((a: Affiliate) => a.status === 'pending').length,
    };
  }, [dashboardData, usagePeriod]);
  
  const featureUsageStats = useMemo(() => {
    if (!dashboardData) return { mostUsed: [], leastUsed: [] };

    const features = [
      { name: 'Resume Scans', count: dashboardData.resumeScans.length },
      { name: 'Job Applications', count: dashboardData.jobApplications.length },
      { name: 'Community Posts', count: dashboardData.communityPosts.length },
      { name: 'Appointments', count: dashboardData.appointments.length },
      { name: 'Mock Interviews', count: dashboardData.mockInterviews.length },
      { name: 'Feature Requests', count: dashboardData.featureRequests?.length || 0 },
      { name: 'Blog Posts', count: dashboardData.blogPosts?.length || 0 },
    ].sort((a, b) => b.count - a.count);

    return {
      mostUsed: features.slice(0, 5),
      leastUsed: features.slice(-5).reverse(),
    };
  }, [dashboardData]);

  const moderationReasonStats = useMemo(() => {
    if (!dashboardData) return [];
    const stats = new Map<string, number>();
    const flaggedPosts = dashboardData.communityPosts.filter((p: CommunityPost) => p.moderationStatus === 'flagged');
    flaggedPosts.forEach((post: CommunityPost) => {
        (post.flagReasons || []).forEach(reason => {
            stats.set(reason, (stats.get(reason) || 0) + 1);
        });
    });
    return Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  }, [dashboardData]);

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
        activityScore: (dashboardData.resumeScans.filter((s: any) => s.tenantId === tenant.id && new Date(s.scanDate) >= startDate).length * 2) + 
                       (dashboardData.communityPosts.filter((p: any) => p.tenantId === tenant.id && new Date(p.timestamp) >= startDate).length)
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
      ActivityScore: tenant.activityScore,
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
              <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"><Link href="/admin/promotional-content">{t("adminDashboard.promotionalSpotlight.learnMoreButton")}</Link></Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
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
           {visibleWidgetIds.has('platformActivityStat') && (
             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.platformActivity.title")}</CardTitle>
                    <Activity className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{platformStats.activeUsersThisPeriod}</div>
                    <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.platformActivity.description", { period: translatedUsagePeriod })}</p>
                </CardContent>
             </Card>
           )}
          {visibleWidgetIds.has('affiliateProgramStat') && (
             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Affiliate Program</CardTitle>
                    <Target className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{platformStats.totalAffiliates}</div>
                    <p className="text-xs text-muted-foreground">{platformStats.pendingAffiliates > 0 ? `${platformStats.pendingAffiliates} pending approval` : 'All affiliates approved'}</p>
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
           {visibleWidgetIds.has('communityPostsStat') && (
             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("adminDashboard.stats.communityPosts.title")}</CardTitle>
                    <MessageSquare className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{platformStats.totalCommunityPostsThisPeriod}</div>
                    <p className="text-xs text-muted-foreground">{t("adminDashboard.stats.communityPosts.description", {period: translatedUsagePeriod})}</p>
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
        
        {visibleWidgetIds.has('featureUsage') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
              <CardDescription>Most and least used features across the platform based on total interaction counts.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><ThumbsUp className="h-5 w-5 text-green-500" /> Most Used</h3>
                <div className="space-y-2">
                  {featureUsageStats.mostUsed.map(feature => (
                    <div key={feature.name} className="flex justify-between items-center text-sm p-2 bg-secondary/50 rounded-md">
                      <span className="text-muted-foreground">{feature.name}</span>
                      <span className="font-bold text-foreground">{feature.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><ThumbsDown className="h-5 w-5 text-red-500" /> Least Used</h3>
                <div className="space-y-2">
                  {featureUsageStats.leastUsed.map(feature => (
                    <div key={feature.name} className="flex justify-between items-center text-sm p-2 bg-secondary/50 rounded-md">
                      <span className="text-muted-foreground">{feature.name}</span>
                      <span className="font-bold text-foreground">{feature.count.toLocaleString()}</span>
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
              <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5 text-primary"/>{t("adminDashboard.charts.tenantActivity.title", { period: translatedUsagePeriod })}</CardTitle>
              <CardDescription>{t("adminDashboard.charts.tenantActivity.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                        <XAxis dataKey="name" tick={{fontSize: 10}}/>
                        <YAxis allowDecimals={false} tick={{fontSize: 10}}/>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px', padding: '4px 8px' }}/>
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <RechartsBar dataKey="Users" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Total Users"/>
                        <RechartsBar dataKey="ActivityScore" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Activity Score"/>
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        
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

        <div className="grid gap-6 lg:grid-cols-3">
            {visibleWidgetIds.has('contentModerationQueueSummary') && (
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary"/>{t("adminDashboard.charts.contentModeration.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <p className="text-4xl font-bold">{platformStats.flaggedPostsCount}</p>
                            <p className="text-sm text-muted-foreground">{t("adminDashboard.charts.contentModeration.flaggedPosts")}</p>
                        </div>
                        <div className="mt-4 space-y-1 text-xs">
                            <h4 className="font-semibold">Top Reasons:</h4>
                            {moderationReasonStats.length > 0 ? (
                                moderationReasonStats.slice(0, 3).map(([reason, count]) => (
                                    <div key={reason} className="flex justify-between">
                                        <span>{reason}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))
                            ) : (<p className="text-muted-foreground">No reasons to show.</p>)}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/content-moderation">{t("adminDashboard.charts.contentModeration.reviewButton")}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {visibleWidgetIds.has('systemAlerts') && (
                <Card className="shadow-lg lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2"><ServerIcon className="h-5 w-5 text-primary"/>{t("adminDashboard.charts.systemAlerts.title")}</span>
                            {unreadAlertsCount > 0 && <Badge variant="destructive">{t("adminDashboard.charts.systemAlerts.unreadAlertsCount", { count: unreadAlertsCount })}</Badge>}
                        </CardTitle>
                        <CardDescription>{t("adminDashboard.charts.systemAlerts.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentUnreadAlerts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">{t("adminDashboard.charts.systemAlerts.noAlerts")}</p>
                        ) : (
                            <ul className="space-y-3">
                                {recentUnreadAlerts.map(alert => (
                                    <li key={alert.id} className="flex items-start gap-3 p-2 border rounded-md">
                                        {getAlertIcon(alert.type)}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{alert.title}</p>
                                            <p className="text-xs text-muted-foreground">{alert.message}</p>
                                        </div>
                                        <Button size="xs" variant="ghost" className="text-xs h-auto p-1" onClick={() => handleMarkAlertAsRead(alert.id)}>{t("adminDashboard.charts.systemAlerts.markReadButton")}</Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="link" className="text-xs p-0">
                            <Link href="#">{t("adminDashboard.charts.systemAlerts.viewAllButton")}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
        
        {visibleWidgetIds.has('adminQuickActions') && (
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle>{t("adminDashboard.quickActions.title")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <Button asChild variant="outline"><Link href="/admin/user-management"><Users className="mr-2 h-4 w-4"/> {t("adminDashboard.quickActions.manageUsers")}</Link></Button>
                    <Button asChild variant="outline"><Link href="/admin/platform-settings"><ServerIcon className="mr-2 h-4 w-4"/>{t("adminDashboard.quickActions.platformSettings")}</Link></Button>
                    <Button asChild variant="outline"><Link href="/admin/tenants"><Building2 className="mr-2 h-4 w-4"/>{t("adminDashboard.quickActions.manageTenants")}</Link></Button>
                    <Button asChild variant="outline"><Link href="/admin/content-moderation"><ShieldAlert className="mr-2 h-4 w-4"/>{t("adminDashboard.quickActions.contentModeration")}</Link></Button>
                    <Button asChild variant="outline"><Link href="/admin/announcements"><Megaphone className="mr-2 h-4 w-4"/>{t("adminDashboard.quickActions.announcements")}</Link></Button>
                    <Button asChild variant="outline"><Link href="/admin/gamification-rules"><ListChecks className="mr-2 h-4 w-4"/>{t("adminDashboard.quickActions.gamificationRules")}</Link></Button>
                    <Button asChild variant="outline"><Link href="/admin/blog-settings"><Settings className="mr-2 h-4 w-4"/>{t("adminDashboard.quickActions.blogSettings")}</Link></Button>
                    <Button asChild variant="outline"><Link href="/admin/analytics"><BarChart className="mr-2 h-4 w-4"/>{t("adminDashboard.quickActions.userActivityAnalytics")}</Link></Button>
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
                    {t(widget.titleKey as any)}
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
