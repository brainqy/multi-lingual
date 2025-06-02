
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart, Users, Settings, Activity, Building2, FileText, MessageSquare, Zap as ZapIcon, ShieldQuestion, UserPlus, Briefcase, Handshake, Mic, ListChecks, Clock, TrendingUp, Megaphone, CalendarDays, Edit3 as CustomizeIcon, PieChartIcon, ShieldAlert, ServerIcon, Info, AlertTriangle, CheckCircle as CheckCircleIcon } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import {
  adminDashboardTourSteps,
  sampleTenants,
  sampleCommunityPosts,
  sampleJobApplications,
  sampleAlumni,
  sampleMockInterviewSessions,
  sampleUserProfile,
  sampleResumeScanHistory,
  samplePlatformUsers,
  sampleSystemAlerts, // Import sampleSystemAlerts
} from "@/lib/sample-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Tenant, UserProfile, SystemAlert, SystemAlertType } from "@/types"; // Import SystemAlert types
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns"; // For alert timestamps

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
  topUsersByTime: (period: 'weekly' | 'monthly') => samplePlatformUsers.slice(0,5).map((user) => ({
    name: user.name,
    time: Math.floor(Math.random() * (period === 'weekly' ? 20 : 80)) + (period === 'weekly' ? 5 : 20),
  })).sort((a,b) => b.time - a.time),
};

const mockRegistrationData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    signups: Math.floor(Math.random() * 50) + 10, 
  };
});

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
  | 'systemAlerts' // New widget ID
  | 'adminQuickActions';

interface WidgetConfig {
  id: AdminDashboardWidgetId;
  title: string;
  defaultVisible: boolean;
}

const AVAILABLE_WIDGETS: WidgetConfig[] = [
  { id: 'promotionalSpotlight', title: 'Promotional Spotlight', defaultVisible: true },
  { id: 'totalUsersStat', title: 'Total Users Stat', defaultVisible: true },
  { id: 'totalTenantsStat', title: 'Total Tenants Stat', defaultVisible: true },
  { id: 'resumesAnalyzedStat', title: 'Resumes Analyzed Stat', defaultVisible: true },
  { id: 'communityPostsStat', title: 'Community Posts Stat', defaultVisible: true },
  { id: 'platformActivityStat', title: 'Platform Activity Stat', defaultVisible: true },
  { id: 'jobApplicationsStat', title: 'Job Applications Stat', defaultVisible: true },
  { id: 'alumniConnectionsStat', title: 'Alumni Connections Stat', defaultVisible: true },
  { id: 'mockInterviewsStat', title: 'Mock Interviews Stat', defaultVisible: true },
  { id: 'timeSpentStats', title: 'Time Spent Statistics', defaultVisible: true },
  { id: 'tenantActivityOverview', title: 'Tenant Activity Overview', defaultVisible: true },
  { id: 'registrationTrendsChart', title: 'User Registration Trends', defaultVisible: true },
  { id: 'aiUsageBreakdownChart', title: 'AI Feature Usage', defaultVisible: true },
  { id: 'contentModerationQueueSummary', title: 'Content Moderation Queue', defaultVisible: true },
  { id: 'systemAlerts', title: 'System Alerts', defaultVisible: true }, // Added new widget config
  { id: 'adminQuickActions', title: 'Admin Quick Actions', defaultVisible: true },
];


export default function AdminDashboard() {
  const [showAdminTour, setShowAdminTour] = useState(false);
  const [usagePeriod, setUsagePeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [currentTenantActivityData, setCurrentTenantActivityData] = useState<TenantActivityStats[]>([]);
  const { toast } = useToast();

  const [visibleWidgetIds, setVisibleWidgetIds] = useState<Set<AdminDashboardWidgetId>>(
    new Set(AVAILABLE_WIDGETS.filter(w => w.defaultVisible).map(w => w.id))
  );
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [tempVisibleWidgetIds, setTempVisibleWidgetIds] = useState<Set<AdminDashboardWidgetId>>(visibleWidgetIds);

  const [alerts, setAlerts] = useState<SystemAlert[]>(sampleSystemAlerts.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('adminDashboardTourSeen');
      if (!tourSeen) {
        setShowAdminTour(true);
      }
    }
  }, []);

  const platformStats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const startDate = usagePeriod === 'weekly' ? oneWeekAgo : oneMonthAgo;

    const totalUsers = samplePlatformUsers.length;
    const activeUsersThisPeriod = samplePlatformUsers.filter(u => u.lastLogin && new Date(u.lastLogin) >= startDate).length;
    const newSignupsThisPeriod = samplePlatformUsers.filter(u => u.createdAt && new Date(u.createdAt) >= startDate).length;
    const totalResumesAnalyzedThisPeriod = sampleResumeScanHistory.filter(s => new Date(s.scanDate) >= startDate).length;
    const totalJobApplicationsThisPeriod = sampleJobApplications.filter(j => new Date(j.dateApplied) >= startDate).length;
    const totalCommunityPostsThisPeriod = sampleCommunityPosts.filter(p => new Date(p.timestamp) >= startDate).length;
    const totalAlumniConnections = sampleAlumni.length * 5; 
    const totalMockInterviews = sampleMockInterviewSessions.length;
    const flaggedPostsCount = sampleCommunityPosts.filter(p => p.moderationStatus === 'flagged').length;


    return {
      totalUsers,
      activeUsersThisPeriod,
      newSignupsThisPeriod,
      totalResumesAnalyzedThisPeriod,
      totalJobApplicationsThisPeriod,
      totalCommunityPostsThisPeriod,
      totalAlumniConnections,
      totalMockInterviews,
      flaggedPostsCount,
    };
  }, [usagePeriod]);

  useEffect(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const startDate = usagePeriod === 'weekly' ? oneWeekAgo : oneMonthAgo;

    const data = sampleTenants.map(tenant => {
      const usersInTenant = samplePlatformUsers.filter(u => u.tenantId === tenant.id);
      const newUsersInTenantThisPeriod = usersInTenant.filter(u => u.createdAt && new Date(u.createdAt) >= startDate).length;
      const resumesAnalyzedInTenantThisPeriod = sampleResumeScanHistory.filter(s => s.tenantId === tenant.id && new Date(s.scanDate) >= startDate).length;
      const communityPostsInTenantThisPeriod = sampleCommunityPosts.filter(p => p.tenantId === tenant.id && new Date(p.timestamp) >= startDate).length;
      const jobApplicationsInTenant = sampleJobApplications.filter(j => j.tenantId === tenant.id);
      return {
        ...tenant,
        userCount: usersInTenant.length,
        newUsersThisPeriod: newUsersInTenantThisPeriod,
        resumesAnalyzedThisPeriod: resumesAnalyzedInTenantThisPeriod,
        communityPostsCountThisPeriod: communityPostsInTenantThisPeriod,
        jobApplicationsCount: jobApplicationsInTenant.length,
      };
    });
    setCurrentTenantActivityData(data);
  }, [usagePeriod]);

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
    toast({ title: "Dashboard Updated", description: "Your dashboard widget preferences have been saved for this session." });
  };

  const openCustomizeDialog = () => {
    setTempVisibleWidgetIds(new Set(visibleWidgetIds));
    setIsCustomizeDialogOpen(true);
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    // In a real app, you'd also update the backend.
    const alertToMark = alerts.find(a => a.id === alertId);
    if(alertToMark) {
        const globalIndex = sampleSystemAlerts.findIndex(sa => sa.id === alertId);
        if (globalIndex !== -1) sampleSystemAlerts[globalIndex].isRead = true;
    }
    toast({title: "Alert Marked as Read", description: `Alert "${alertToMark?.title}" marked as read.`});
  };

  const getAlertIcon = (type: SystemAlertType) => {
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users, system settings, and view overall platform statistics.</p>
            </div>
            <Button variant="outline" onClick={openCustomizeDialog}>
                <CustomizeIcon className="mr-2 h-4 w-4" /> Customize Dashboard
            </Button>
        </div>


        {visibleWidgetIds.has('promotionalSpotlight') && (
          <Card className="shadow-lg md:col-span-2 lg:col-span-4 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary"/>Promotional Spotlight</CardTitle>
              <CardDescription>Feature new updates, offers, or important announcements here.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">Promotional content can be displayed here. This area can highlight new features, upcoming webinars, special offers for tenants, or platform achievements.</p>
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Learn More</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleWidgetIds.has('totalUsersStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">+{platformStats.newSignupsThisPeriod} new this {usagePeriod}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('totalTenantsStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Building2 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sampleTenants.length}</div>
                <p className="text-xs text-muted-foreground">Active Tenants</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('resumesAnalyzedStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resumes Analyzed</CardTitle>
                <FileText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalResumesAnalyzedThisPeriod}</div>
                <p className="text-xs text-muted-foreground">This {usagePeriod}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('communityPostsStat') && (
             <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
                <MessageSquare className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalCommunityPostsThisPeriod}</div>
                <p className="text-xs text-muted-foreground">New this {usagePeriod}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleWidgetIds.has('platformActivityStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
                <Activity className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.activeUsersThisPeriod} Active</div>
                <p className="text-xs text-muted-foreground">Users active this {usagePeriod}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('jobApplicationsStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
                <Briefcase className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalJobApplicationsThisPeriod}</div>
                <p className="text-xs text-muted-foreground">Tracked this {usagePeriod}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('alumniConnectionsStat') && (
             <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alumni Connections Made</CardTitle>
                <Handshake className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalAlumniConnections}</div>
                <p className="text-xs text-muted-foreground">Total platform connections</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('mockInterviewsStat') && (
             <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mock Interviews</CardTitle>
                <Mic className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats.totalMockInterviews}</div>
                <p className="text-xs text-muted-foreground">Completed AI sessions</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {visibleWidgetIds.has('registrationTrendsChart') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>User Registration Trends</CardTitle>
              <CardDescription>Daily new user sign-ups over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockRegistrationData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
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
              <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary"/>AI Feature Usage Breakdown</CardTitle>
              <CardDescription>Popularity of different AI-powered tools.</CardDescription>
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
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive"/>Content Moderation Queue</CardTitle>
              <CardDescription>Items requiring review.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center py-8">
               <div className="text-4xl font-bold text-destructive">{platformStats.flaggedPostsCount}</div>
               <p className="text-muted-foreground mt-1 mb-4">Flagged Community Posts</p>
               <Button asChild>
                   <Link href="/admin/content-moderation">Review Now</Link>
               </Button>
            </CardContent>
          </Card>
        )}

        {visibleWidgetIds.has('systemAlerts') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServerIcon className="h-5 w-5 text-primary"/>System Alerts
                {unreadAlertsCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {unreadAlertsCount} NEW
                    </span>
                )}
              </CardTitle>
              <CardDescription>Recent important system notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No system alerts at this time.</p>
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
                          <Button variant="outline" size="xs" onClick={() => handleMarkAlertAsRead(alert.id)} className="text-xs h-6">Mark Read</Button>
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
                    <Button variant="link" size="sm" className="mx-auto">View All System Alerts</Button>
                 </CardFooter>
            )}
          </Card>
        )}


        {visibleWidgetIds.has('timeSpentStats') && (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary"/>Time Spent Statistics</CardTitle>
                <CardDescription>Insights into user engagement time.</CardDescription>
              </div>
              <Tabs value={usagePeriod} onValueChange={(value) => setUsagePeriod(value as 'weekly' | 'monthly')} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-2 h-9 sm:w-auto">
                      <TabsTrigger value="weekly" className="text-xs py-1 px-2">Weekly</TabsTrigger>
                      <TabsTrigger value="monthly" className="text-xs py-1 px-2">Monthly</TabsTrigger>
                  </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-secondary/30">
                      <CardHeader className="pb-2"><CardTitle className="text-base">Avg. Session Duration</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold text-primary">{mockTimeSpentData.averageSessionDuration} min</p></CardContent>
                  </Card>
                   <Card className="bg-secondary/30">
                      <CardHeader className="pb-2">
                           <CardTitle className="text-base">Total Platform Usage ({usagePeriod.charAt(0).toUpperCase() + usagePeriod.slice(1)})</CardTitle>
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
                      <CardHeader className="pb-2"><CardTitle className="text-base">Top Users ({usagePeriod.charAt(0).toUpperCase() + usagePeriod.slice(1)})</CardTitle></CardHeader>
                      <CardContent>
                          <ul className="space-y-1 text-xs">
                              {mockTimeSpentData.topUsersByTime(usagePeriod).map(user => (
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
                  <h4 className="font-semibold text-md mb-2">Most Used Features (by time)</h4>
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
              <CardTitle>Tenant Activity Overview ({usagePeriod.charAt(0).toUpperCase() + usagePeriod.slice(1)})</CardTitle>
              <CardDescription>Key engagement metrics per tenant for the selected period.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 10}}/>
                    <YAxis allowDecimals={false}/>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <RechartsBar dataKey="NewUsers" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="New Users" />
                    <RechartsBar dataKey="ResumesAnalyzed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Resumes Analyzed"/>
                    <RechartsBar dataKey="CommunityPosts" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Community Posts"/>
                  </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {visibleWidgetIds.has('adminQuickActions') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Admin Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/user-management"><Users className="mr-2 h-4 w-4 shrink-0"/>Manage Users</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/platform-settings"><Settings className="mr-2 h-4 w-4 shrink-0"/>Platform Settings</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/tenants"><Building2 className="mr-2 h-4 w-4 shrink-0"/>Manage Tenants</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/content-moderation"><MessageSquare className="mr-2 h-4 w-4 shrink-0"/>Content Moderation</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/announcements"><Megaphone className="mr-2 h-4 w-4 shrink-0"/>Announcements</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/gamification-rules"><ListChecks className="mr-2 h-4 w-4 shrink-0"/>Gamification Rules</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/blog-settings"><FileText className="mr-2 h-4 w-4 shrink-0"/>Blog Settings</Link></Button>
              <Button asChild variant="outline" className="justify-start text-left"><Link href="/admin/analytics/user-activity"><TrendingUp className="mr-2 h-4 w-4 shrink-0"/>User Activity Analytics</Link></Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Admin Dashboard</DialogTitle>
            <DialogUIDescription>
              Select the widgets you want to see on your dashboard.
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
                    {widget.title}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomizeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCustomization} className="bg-primary hover:bg-primary/90">Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    