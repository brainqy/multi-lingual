
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, Zap, MessageSquare, CheckSquare, Settings as SettingsIcon, Activity, CalendarCheck2, Gift, Loader2, Megaphone, ExternalLink } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import { managerDashboardTourSteps } from "@/lib/tour-steps";
import { getDashboardData } from "@/lib/actions/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Tenant, UserProfile, CommunityPost, Appointment, ResumeScanHistoryItem, GalleryEvent, PromotionalContent } from "@/types"; 
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { Skeleton } from "../ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { getActivePromotionalContent } from "@/lib/actions/promotional-content";

interface ManagerDashboardProps {
  user: UserProfile; 
}

type ManagerDashboardWidgetId =
  | 'activeUsersStat'
  | 'resumesAnalyzedStat'
  | 'communityPostsStat'
  | 'pendingApprovalsStat'
  | 'tenantEngagementOverview'
  | 'tenantManagementActions'
  | 'promotionalSpotlight';

interface WidgetConfig {
  id: ManagerDashboardWidgetId;
  titleKey: string;
  defaultVisible: boolean;
}

const AVAILABLE_WIDGETS: WidgetConfig[] = [
  { id: 'promotionalSpotlight', titleKey: 'managerDashboard.widgets.promotionalSpotlight', defaultVisible: true },
  { id: 'activeUsersStat', titleKey: 'managerDashboard.widgets.activeUsersStat', defaultVisible: true },
  { id: 'resumesAnalyzedStat', titleKey: 'managerDashboard.widgets.resumesAnalyzedStat', defaultVisible: true },
  { id: 'communityPostsStat', titleKey: 'managerDashboard.widgets.communityPostsStat', defaultVisible: true },
  { id: 'pendingApprovalsStat', titleKey: 'managerDashboard.widgets.pendingApprovalsStat', defaultVisible: true },
  { id: 'tenantEngagementOverview', titleKey: 'managerDashboard.widgets.tenantEngagementOverview', defaultVisible: true },
  { id: 'tenantManagementActions', titleKey: 'managerDashboard.widgets.tenantManagementActions', defaultVisible: true },
];

export default function ManagerDashboard({ user }: ManagerDashboardProps) {
  const { t } = useI18n();
  const [showManagerTour, setShowManagerTour] = useState(false);
  const tenantId = user.tenantId;
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activePromotions, setActivePromotions] = useState<PromotionalContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [visibleWidgetIds, setVisibleWidgetIds] = useState<Set<ManagerDashboardWidgetId>>(
    new Set(AVAILABLE_WIDGETS.filter(w => w.defaultVisible).map(w => w.id))
  );
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [tempVisibleWidgetIds, setTempVisibleWidgetIds] = useState<Set<ManagerDashboardWidgetId>>(visibleWidgetIds);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      const [data, promotions] = await Promise.all([
        getDashboardData(user.id, user.role),
        getActivePromotionalContent(user)
      ]);
      setDashboardData(data);
      setActivePromotions(promotions);
      setIsLoading(false);
    }
    loadData();

    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('managerDashboardTourSeen');
      if (!tourSeen) {
        setShowManagerTour(true);
      }
    }
  }, [tenantId, user]);

  const tenantStats = useMemo(() => {
    if (!dashboardData) return { activeUsers: 0, totalUsers: 0, resumesAnalyzed: 0, communityPosts: 0, activeAppointments: 0, pendingEventApprovals: 0 };
    
    const usersInTenant = dashboardData.users.filter((u: UserProfile) => u.tenantId === tenantId);
    const resumesAnalyzedInTenant = dashboardData.resumeScans.filter((s: ResumeScanHistoryItem) => s.tenantId === tenantId);
    const communityPostsInTenant = dashboardData.communityPosts.filter((p: CommunityPost) => p.tenantId === tenantId);
    const activeAppointments = dashboardData.appointments.filter((a: Appointment) => a.tenantId === tenantId && a.status === 'Confirmed');
    const pendingEventApprovals = dashboardData.events?.filter((e: GalleryEvent) => e.tenantId === tenantId && !(e as any).approved).length || 0;

    return {
      activeUsers: usersInTenant.filter((u: UserProfile) => u.lastLogin && new Date(u.lastLogin) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      totalUsers: usersInTenant.length,
      resumesAnalyzed: resumesAnalyzedInTenant.length,
      communityPosts: communityPostsInTenant.length,
      activeAppointments: activeAppointments.length,
      pendingEventApprovals,
    };
  }, [dashboardData, tenantId]);

  const engagementChartData = [
    { name: t("managerDashboard.charts.tenantEngagement.legendPosts"), count: tenantStats.communityPosts },
    { name: t("managerDashboard.charts.tenantEngagement.legendResumesAnalyzed"), count: tenantStats.resumesAnalyzed },
    { name: t("managerDashboard.charts.tenantEngagement.legendAppointments"), count: tenantStats.activeAppointments },
  ];

  const handleCustomizeToggle = (widgetId: ManagerDashboardWidgetId, checked: boolean) => {
    setTempVisibleWidgetIds(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(widgetId);
      else newSet.delete(widgetId);
      return newSet;
    });
  };

  const handleSaveCustomization = () => {
    setVisibleWidgetIds(tempVisibleWidgetIds);
    setIsCustomizeDialogOpen(false);
    toast({ title: t("managerDashboard.toast.dashboardUpdated.title"), description: t("managerDashboard.toast.dashboardUpdated.description") });
  };

  const openCustomizeDialog = () => {
    setTempVisibleWidgetIds(new Set(visibleWidgetIds));
    setIsCustomizeDialogOpen(true);
  };
  
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
        isOpen={showManagerTour}
        onClose={() => setShowManagerTour(false)}
        tourKey="managerDashboardTourSeen"
        steps={managerDashboardTourSteps}
        title="Welcome Manager!"
      />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("managerDashboard.title", { tenantName: user.currentOrganization || `Tenant ${tenantId}` })}</h1>
            <p className="text-muted-foreground">{t("managerDashboard.description")}</p>
          </div>
          <Button variant="outline" onClick={openCustomizeDialog}>
            <SettingsIcon className="mr-2 h-4 w-4" /> {t("managerDashboard.customizeButton")}
          </Button>
        </div>

        {visibleWidgetIds.has('promotionalSpotlight') && activePromotions.length > 0 && (
            <Card className="shadow-lg p-0 overflow-hidden">
                <Carousel plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]} className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                    {activePromotions.map((promotion: PromotionalContent) => (
                    <CarouselItem key={promotion.id}>
                        <div className={cn("text-primary-foreground bg-gradient-to-r", promotion.gradientFrom, promotion.gradientVia, promotion.gradientTo)}>
                        <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                            <div className="md:w-1/3 flex justify-center">
                              <Image src={promotion.imageUrl} alt={promotion.imageAlt} width={250} height={160} className="rounded-lg shadow-md object-cover" data-ai-hint={promotion.imageHint || "promotion"}/>
                            </div>
                            <div className="md:w-2/3 text-center md:text-left">
                              <h2 className="text-2xl font-bold mb-2">{promotion.title}</h2>
                              <p className="text-sm opacity-90 mb-4">{promotion.description}</p>
                              <Button variant="secondary" size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" asChild>
                                  <Link href={promotion.buttonLink} target={promotion.buttonLink === '#' ? '_self' : '_blank'} rel="noopener noreferrer">
                                  {promotion.buttonText} <ExternalLink className="ml-2 h-4 w-4" />
                                  </Link>
                              </Button>
                            </div>
                        </div>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                {activePromotions.length > 1 && (<><CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex" /><CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex" /></>)}
                </Carousel>
            </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleWidgetIds.has('activeUsersStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("managerDashboard.stats.activeUsers.title")}</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">{t("managerDashboard.stats.activeUsers.description", { count: tenantStats.totalUsers })}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('resumesAnalyzedStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("managerDashboard.stats.resumesAnalyzed.title")}</CardTitle>
                <Zap className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.resumesAnalyzed}</div>
                <p className="text-xs text-muted-foreground">{t("managerDashboard.stats.resumesAnalyzed.description")}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('communityPostsStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("managerDashboard.stats.communityPosts.title")}</CardTitle>
                <MessageSquare className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.communityPosts}</div>
                <p className="text-xs text-muted-foreground">{t("managerDashboard.stats.communityPosts.description")}</p>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('pendingApprovalsStat') && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("managerDashboard.stats.pendingApprovals.title")}</CardTitle>
                <CheckSquare className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenantStats.pendingEventApprovals}</div>
                <p className="text-xs text-muted-foreground">{t("managerDashboard.stats.pendingApprovals.description")}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {visibleWidgetIds.has('tenantEngagementOverview') && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("managerDashboard.charts.tenantEngagement.title")}</CardTitle>
              <CardDescription>{t("managerDashboard.charts.tenantEngagement.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={engagementChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12}}/>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/>
                      <RechartsBar dataKey="count" fill="hsl(var(--primary))" name={t("managerDashboard.charts.tenantEngagement.activityCount")} radius={[0, 4, 4, 0]} barSize={30}/>
                  </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        
        {visibleWidgetIds.has('tenantManagementActions') && (
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle>{t("managerDashboard.quickActions.title")}</CardTitle>
                <CardDescription>{t("managerDashboard.quickActions.description")}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Button asChild variant="outline">
                        <Link href="/admin/user-management">
                            <Users className="mr-2 h-4 w-4"/> {t("managerDashboard.quickActions.manageTenantUsers")}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/content-moderation">
                            <MessageSquare className="mr-2 h-4 w-4"/>{t("managerDashboard.quickActions.moderateTenantFeed")}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/gallery-management">
                            <Activity className="mr-2 h-4 w-4"/>{t("managerDashboard.quickActions.manageEventGallery")}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/events">
                            <CalendarCheck2 className="mr-2 h-4 w-4"/>{t("managerDashboard.quickActions.reviewEventSubmissions")}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/announcements">
                            <MessageSquare className="mr-2 h-4 w-4"/>{t("managerDashboard.quickActions.manageAnnouncements")}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/promo-codes">
                            <Gift className="mr-2 h-4 w-4" />{t("managerDashboard.quickActions.promoCodeMgt", { defaultValue: "Promo Codes" })}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )}
      </div>

      <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("managerDashboard.customizeDialog.title")}</DialogTitle>
            <DialogUIDescription>
              {t("managerDashboard.customizeDialog.description")}
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
                    {t(widget.titleKey as any, { defaultValue: widget.titleKey.substring(widget.titleKey.lastIndexOf('.') + 1)})}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomizeDialogOpen(false)}>{t("managerDashboard.customizeDialog.cancelButton")}</Button>
            <Button onClick={handleSaveCustomization} className="bg-primary hover:bg-primary/90">{t("managerDashboard.customizeDialog.saveButton")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
