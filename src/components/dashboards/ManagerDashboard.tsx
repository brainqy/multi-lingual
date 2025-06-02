
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, Briefcase, CheckSquare, MessageSquare, Zap, Activity, Settings as SettingsIcon, CalendarCheck2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import {
    managerDashboardTourSteps,
    sampleUserProfile,
    samplePlatformUsers,
    sampleResumeScanHistory,
    sampleCommunityPosts,
    sampleAppointments,
    sampleEvents,
} from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ManagerDashboardWidgetId =
  | 'activeUsersStat'
  | 'resumesAnalyzedStat'
  | 'communityPostsStat'
  | 'pendingApprovalsStat'
  | 'tenantEngagementOverview'
  | 'tenantManagementActions';

interface WidgetConfig {
  id: ManagerDashboardWidgetId;
  title: string;
  defaultVisible: boolean;
}

const AVAILABLE_WIDGETS: WidgetConfig[] = [
  { id: 'activeUsersStat', title: 'Active Users (Tenant) Stat', defaultVisible: true },
  { id: 'resumesAnalyzedStat', title: 'Resumes Analyzed (Tenant) Stat', defaultVisible: true },
  { id: 'communityPostsStat', title: 'Community Posts (Tenant) Stat', defaultVisible: true },
  { id: 'pendingApprovalsStat', title: 'Pending Approvals Stat', defaultVisible: true },
  { id: 'tenantEngagementOverview', title: 'Tenant Engagement Overview Chart', defaultVisible: true },
  { id: 'tenantManagementActions', title: 'Tenant Management Actions', defaultVisible: true },
];


export default function ManagerDashboard() {
  const [showManagerTour, setShowManagerTour] = useState(false);
  const currentUser = sampleUserProfile;
  const tenantId = currentUser.tenantId;
  const { toast } = useToast();

  const [visibleWidgetIds, setVisibleWidgetIds] = useState<Set<ManagerDashboardWidgetId>>(
    new Set(AVAILABLE_WIDGETS.filter(w => w.defaultVisible).map(w => w.id))
  );
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [tempVisibleWidgetIds, setTempVisibleWidgetIds] = useState<Set<ManagerDashboardWidgetId>>(visibleWidgetIds);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('managerDashboardTourSeen');
      if (!tourSeen) {
        setShowManagerTour(true);
      }
    }
  }, []);

  const tenantStats = useMemo(() => {
    const usersInTenant = samplePlatformUsers.filter(u => u.tenantId === tenantId);
    const resumesAnalyzedInTenant = sampleResumeScanHistory.filter(s => s.tenantId === tenantId);
    const communityPostsInTenant = sampleCommunityPosts.filter(p => p.tenantId === tenantId);
    const activeAppointments = sampleAppointments.filter(a => a.tenantId === tenantId && a.status === 'Confirmed');
    const pendingEventApprovals = sampleEvents.filter(e => e.tenantId === tenantId && !(e as any).approved).length;

    return {
      activeUsers: usersInTenant.filter(u => u.lastLogin && new Date(u.lastLogin) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      totalUsers: usersInTenant.length,
      resumesAnalyzed: resumesAnalyzedInTenant.length,
      communityPosts: communityPostsInTenant.length,
      activeAppointments: activeAppointments.length,
      pendingEventApprovals,
    };
  }, [tenantId]);

  const engagementChartData = [
    { name: 'Posts', count: tenantStats.communityPosts },
    { name: 'Resumes Analyzed', count: tenantStats.resumesAnalyzed },
    { name: 'Appointments', count: tenantStats.activeAppointments },
  ];

  const handleCustomizeToggle = (widgetId: ManagerDashboardWidgetId, checked: boolean) => {
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

  return (
    <>
      <WelcomeTourDialog
        isOpen={showManagerTour}
        onClose={() => setShowManagerTour(false)}
        tourKey="managerDashboardTourSeen"
        steps={managerDashboardTourSteps}
        title="Welcome Manager!"
      />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manager Dashboard ({currentUser.currentOrganization || `Tenant ${tenantId}`})</h1>
            <p className="text-muted-foreground">Oversee your tenant's engagement, manage specific features, and track key metrics.</p>
          </div>
          <Button variant="outline" onClick={openCustomizeDialog}>
            <SettingsIcon className="mr-2 h-4 w-4" /> Customize Dashboard
          </Button>
        </div>


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleWidgetIds.has('activeUsersStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users (Tenant)</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Out of {tenantStats.totalUsers} total</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('resumesAnalyzedStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resumes Analyzed (Tenant)</CardTitle>
                <Zap className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.resumesAnalyzed}</div>
                <p className="text-xs text-muted-foreground">Total within tenant</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('communityPostsStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Posts (Tenant)</CardTitle>
                <MessageSquare className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.communityPosts}</div>
                <p className="text-xs text-muted-foreground">Engagement in feed</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('pendingApprovalsStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <CheckSquare className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.pendingEventApprovals}</div>
                <p className="text-xs text-muted-foreground">Event requests</p>
              </CardContent>
            </Card>
          )}
        </div>

        {visibleWidgetIds.has('tenantEngagementOverview') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tenant Engagement Overview</CardTitle>
              <CardDescription>Activity within your tenant.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={engagementChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12}}/>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/>
                      <RechartsBar dataKey="count" fill="hsl(var(--primary))" name="Activity Count" radius={[0, 4, 4, 0]} barSize={30}/>
                  </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {visibleWidgetIds.has('tenantManagementActions') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tenant Management Actions</CardTitle>
              <CardDescription>Access tools to manage your tenant's specific settings and content.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button asChild variant="outline">
                  <Link href="/admin/user-management">
                      <Users className="mr-2 h-4 w-4"/> Manage Tenant Users
                  </Link>
              </Button>
              <Button asChild variant="outline">
                  <Link href="/admin/content-moderation">
                      <MessageSquare className="mr-2 h-4 w-4"/>Moderate Tenant Feed
                  </Link>
              </Button>
               <Button asChild variant="outline">
                  <Link href="/admin/gallery-management">
                      <Activity/*Using Activity as placeholder, consider Edit3 or GalleryVerticalEnd*/ className="mr-2 h-4 w-4"/>Manage Event Gallery
                  </Link>
              </Button>
               <Button asChild variant="outline">
                  <Link href="/events">
                      <CalendarCheck2 className="mr-2 h-4 w-4"/>Review Event Submissions
                  </Link>
              </Button>
              <Button asChild variant="outline">
                  <Link href="/admin/announcements">
                      <MessageSquare/*Using MessageSquare as placeholder, consider Megaphone*/ className="mr-2 h-4 w-4"/>Manage Announcements
                  </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Manager Dashboard</DialogTitle>
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
