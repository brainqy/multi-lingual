
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PieChart, Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector, LineChart as RechartsLineChart } from 'recharts';
import { Activity, Briefcase, Users, Zap, FileText, CheckCircle, Clock, Target, CalendarClock, CalendarCheck2, History as HistoryIcon, Gift, ExternalLink, Settings, Loader2, PlusCircle, Trash2, Puzzle, ArrowRight, Award, Flame, Trophy, User as UserIcon, Star } from "lucide-react";
import { userDashboardTourSteps } from "@/lib/sample-data";
import { getDashboardData } from "@/lib/actions/dashboard";
import { getActivePromotionalContent } from "@/lib/actions/promotional-content";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { format, parseISO, isFuture, differenceInDays, isToday, compareAsc, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import type { TourStep, Appointment, PracticeSession, Activity as ActivityType, InterviewQuestionCategory, DailyChallenge, UserDashboardWidgetId, JobApplication, PromotionalContent } from '@/types';
import type { Badge as BadgeType } from '@/types';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/hooks/use-i18n";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import SpreadTheWordCard from "@/components/features/SpreadTheWordCard";
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as LucideIcons from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import type { UserProfile } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { updateUser } from "@/lib/data-services/users";
import AiMentorSuggestions from "@/components/dashboards/AiMentorSuggestions";

interface UserDashboardProps {
  user: UserProfile;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const renderActiveShape = (props: PieSectorDataItem) => {
  const RADIAN = Math.PI / 180;
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, startAngle, endAngle, fill, payload, percent = 0, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-semibold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))">{`${value} Applications`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

interface WidgetConfig {
  id: UserDashboardWidgetId;
  title: string;
  defaultVisible: boolean;
}

const AVAILABLE_WIDGETS: WidgetConfig[] = [
  { id: 'promotionCard', title: 'Promotional Spotlight', defaultVisible: true },
  { id: 'jobApplicationStatusChart', title: 'Job Application Status Chart', defaultVisible: true },
  { id: 'matchScoreOverTimeChart', title: 'Match Score Over Time Chart', defaultVisible: true },
  { id: 'jobAppReminders', title: 'Job App Reminders', defaultVisible: true },
  { id: 'upcomingAppointments', title: 'Upcoming Appointments & Interviews', defaultVisible: true },
  { id: 'recentActivities', title: 'Recent Activities', defaultVisible: true },
  { id: 'userBadges', title: 'My Badges', defaultVisible: true },
  { id: 'leaderboard', title: 'Leaderboard Summary', defaultVisible: true },
  { id: 'aiMentorSuggestions', title: 'AI Mentor Suggestions', defaultVisible: true },
];

type IconName = keyof typeof LucideIcons;

function DynamicIcon({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) {
  const IconComponent = LucideIcons[name] as React.ElementType;
  if (!IconComponent) {
    return <LucideIcons.HelpCircle {...props} />;
  }
  return <IconComponent {...props} />;
}

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Star className="h-5 w-5 text-orange-400" />;
    return <span className="text-sm font-medium w-5 text-center">{rank}</span>;
};

export default function UserDashboard({ user }: UserDashboardProps) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const { toast } = useToast();
  const [showUserTour, setShowUserTour] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePromotions, setActivePromotions] = useState<PromotionalContent[]>([]);
  const { login } = useAuth();

  const [visibleWidgetIds, setVisibleWidgetIds] = useState<Set<UserDashboardWidgetId>>(
    new Set(user.dashboardWidgets?.user || AVAILABLE_WIDGETS.filter(w => w.defaultVisible).map(w => w.id))
  );
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [tempVisibleWidgetIds, setTempVisibleWidgetIds] = useState<Set<UserDashboardWidgetId>>(visibleWidgetIds);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        const [data, promotions] = await Promise.all([
            getDashboardData(user.tenantId, user.id),
            getActivePromotionalContent()
        ]);
        setDashboardData(data);
        setActivePromotions(promotions);
        setIsLoading(false);
    }
    if (user) {
      loadData();
      
      // Load widget preferences from user profile
      const savedWidgetIds = user.dashboardWidgets?.user;
      if (savedWidgetIds) {
        setVisibleWidgetIds(new Set(savedWidgetIds as UserDashboardWidgetId[]));
      }

      if (typeof window !== 'undefined') {
        const tourSeen = localStorage.getItem('userDashboardTourSeen');
        if (!tourSeen) {
          setShowUserTour(true);
        }
      }
    }
  }, [user]);
  
  const {
    jobApplicationStatusData,
    recentUserActivities,
    earnedBadges,
    leaderboardUsers,
    upcomingReminders,
    upcomingAppointmentsAndSessions,
  } = useMemo(() => {
    if (!dashboardData || !user) return { jobApplicationStatusData: [], recentUserActivities: [], earnedBadges: [], leaderboardUsers: [], upcomingReminders: [], upcomingAppointmentsAndSessions: [] };

    const userJobApps = dashboardData.jobApplications.filter((app: JobApplication) => app.userId === user.id);
    const statusData = userJobApps.reduce((acc: any, curr: JobApplication) => {
        const status = curr.status;
        const existing = acc.find((item: any) => item.name === status);
        if (existing) existing.value += 1;
        else acc.push({ name: status, value: 1 });
        return acc;
    }, []);

    const activities = dashboardData.activities
      .filter((act: ActivityType) => act.userId === user.id)
      .sort((a: ActivityType, b: ActivityType) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const badges = dashboardData.badges.filter((badge: BadgeType) => user.earnedBadges?.includes(badge.id));

    const leaders = [...dashboardData.users]
      .filter((u: UserProfile) => typeof u.xpPoints === 'number' && u.xpPoints > 0)
      .sort((a: UserProfile, b: UserProfile) => (b.xpPoints || 0) - (a.xpPoints || 0))
      .slice(0, 5);

    const reminders = userJobApps
      .filter((app: JobApplication) => app.reminderDate && isFuture(parseISO(app.reminderDate)))
      .sort((a: JobApplication, b: JobApplication) => new Date(a.reminderDate!).getTime() - new Date(b.reminderDate!).getTime())
      .slice(0, 5);
      
    const appointments = dashboardData.appointments
      .filter((appt: Appointment) => (appt.requesterUserId === user.id || appt.alumniUserId === user.id) && appt.status === 'Confirmed' && isFuture(parseISO(appt.dateTime)))
      .map((appt: Appointment) => ({
        id: appt.id, date: parseISO(appt.dateTime), title: appt.title, type: 'Appointment',
        with: appt.withUser, link: '/appointments', isPractice: false,
      }));
    
    const practiceSessions = dashboardData.mockInterviews
        .filter((ps: PracticeSession) => ps.userId === user.id && ps.status === 'in-progress' && isFuture(parseISO(ps.createdAt))) // Assuming 'in-progress' means scheduled for future
        .map((ps: PracticeSession) => ({
            id: ps.id, date: parseISO(ps.createdAt), title: ps.topic, type: 'AI Mock Interview',
            with: 'AI Coach', link: '/interview-prep', isPractice: true,
        }));
    
    const jobInterviews = userJobApps
        .filter((app: JobApplication) => app.interviews)
        .flatMap((app: JobApplication) => 
            app.interviews!
            .filter(interview => isFuture(parseISO(interview.date)))
            .map(interview => ({
                id: `${app.id}-${interview.id}`, date: parseISO(interview.date), title: app.jobTitle,
                type: interview.type, with: app.companyName, link: '/job-tracker', isPractice: false,
            }))
        );

    const allSessions = [...appointments, ...practiceSessions, ...jobInterviews]
      .sort((a, b) => compareAsc(a.date, b.date))
      .slice(0, 5);

    return { jobApplicationStatusData: statusData, recentUserActivities: activities, earnedBadges: badges, leaderboardUsers: leaders, upcomingReminders: reminders, upcomingAppointmentsAndSessions: allSessions };
  }, [dashboardData, user]);

  useEffect(() => {
    if (!dashboardData || !user) return;
    const today = new Date();
    dashboardData.appointments.forEach((appt: Appointment) => {
        if (appt.requesterUserId === user.id || appt.alumniUserId === user.id) {
            if (appt.reminderDate && isToday(parseISO(appt.reminderDate))) {
                toast({
                    title: t("userDashboard.toast.appointmentReminder.title"),
                    description: t("userDashboard.toast.appointmentReminder.description", { title: appt.title, user: appt.withUser, time: format(parseISO(appt.dateTime), 'p')}),
                    duration: 10000,
                });
            }
        }
    });

    const userPreferredChallenges = dashboardData.challenges
      .filter((c: DailyChallenge) => c.type === 'standard' && user.challengeTopics?.includes(c.category as InterviewQuestionCategory));
    
    if (userPreferredChallenges.length > 0) {
      setDailyChallenge(userPreferredChallenges[Math.floor(Math.random() * userPreferredChallenges.length)]);
    } else {
      const standardChallenges = dashboardData.challenges.filter((c: DailyChallenge) => c.type === 'standard');
      if (standardChallenges.length > 0) {
        setDailyChallenge(standardChallenges[Math.floor(Math.random() * standardChallenges.length)]);
      }
    }
  }, [user, toast, t, dashboardData]);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const matchScoreData = [
    { date: 'Jan', score: 70 }, { date: 'Feb', score: 75 }, { date: 'Mar', score: 80 },
    { date: 'Apr', score: 72 }, { date: 'May', score: 85 }, { date: 'Jun', score: 78 },
  ];

  const handleCustomizeToggle = (widgetId: UserDashboardWidgetId, checked: boolean) => {
    setTempVisibleWidgetIds(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(widgetId);
      else newSet.delete(widgetId);
      return newSet;
    });
  };

  const handleSaveCustomization = async () => {
    setVisibleWidgetIds(tempVisibleWidgetIds);
    setIsCustomizeDialogOpen(false);
    
    // Save to DB
    const updatedUser = await updateUser(user.id, {
      dashboardWidgets: {
        ...user.dashboardWidgets,
        user: Array.from(tempVisibleWidgetIds)
      }
    });
    
    if (updatedUser) {
      await login(updatedUser.email); // Refresh user in auth context
      toast({ title: t("userDashboard.toast.dashboardUpdated.title"), description: t("userDashboard.toast.dashboardUpdated.description") });
    } else {
      // Revert on failure
      setVisibleWidgetIds(new Set(user.dashboardWidgets?.user || []));
      toast({ title: "Error", description: "Could not save widget preferences.", variant: "destructive" });
    }
  };

  const openCustomizeDialog = () => {
    setTempVisibleWidgetIds(new Set(visibleWidgetIds)); 
    setIsCustomizeDialogOpen(true);
  };
  
  const xpPerLevel = 1000;
  const xpLevel = Math.floor((user.xpPoints || 0) / xpPerLevel) + 1;
  const xpForCurrentLevelStart = (xpLevel - 1) * xpPerLevel;
  const xpForNextLevel = xpLevel * xpPerLevel;
  const xpProgressInLevel = (user.xpPoints || 0) - xpForCurrentLevelStart;
  const progressPercentage = (xpProgressInLevel / xpPerLevel) * 100;
  
  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full lg:col-span-2" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }

  return (
    <>
      <WelcomeTourDialog
        isOpen={showUserTour}
        onClose={() => setShowUserTour(false)}
        tourKey="userDashboardTourSeen"
        steps={userDashboardTourSteps}
        title={t("userDashboard.welcomeTour.title")}
      />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("userDashboard.title")}</h1>
          <Button variant="outline" onClick={openCustomizeDialog}>
            <Settings className="mr-2 h-4 w-4" /> {t("userDashboard.customizeButton")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle>{t("userDashboard.progress.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="bg-background shadow-inner flex flex-col justify-center p-4 rounded-lg border h-full">
                  <h3 className="text-base font-semibold flex items-center justify-between">
                    <span>{t("userDashboard.progress.level", { level: xpLevel })}</span>
                    <span className="text-sm font-medium text-muted-foreground">{t("userDashboard.progress.totalXp", { xp: user.xpPoints || 0 })}</span>
                  </h3>
                  <Progress value={progressPercentage} className="w-full h-2 my-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{xpProgressInLevel} / {xpPerLevel} XP</span>
                    <span>{xpForNextLevel - (user.xpPoints || 0)} XP to Level {xpLevel + 1}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background shadow-inner text-center p-3 flex flex-col items-center justify-center h-full rounded-lg border">
                    <Flame className="h-7 w-7 text-orange-500 mb-1" />
                    <p className="text-xl font-bold">{user.dailyStreak || 0}</p>
                    <p className="text-xs text-muted-foreground">{t("userDashboard.progress.dayStreak")}</p>
                  </div>
                  <div className="bg-background shadow-inner text-center p-3 flex flex-col items-center justify-center h-full rounded-lg border">
                    <Award className="h-7 w-7 text-yellow-500 mb-1" />
                    <p className="text-xl font-bold">{user.earnedBadges?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">{t("userDashboard.progress.badgesEarned")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-1 space-y-6">
            {dailyChallenge && (
              <Card className="shadow-lg flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Puzzle className="h-4 w-4 text-primary" />
                    {t("userDashboard.dailyChallenge.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{dailyChallenge.title}</p>
                  <Badge variant="outline" className="mt-2">{dailyChallenge.category}</Badge>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    <Link href="/daily-interview-challenge">{t("userDashboard.dailyChallenge.viewButton")}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
            <SpreadTheWordCard user={user} />
          </div>
        </div>
        
        {visibleWidgetIds.has('aiMentorSuggestions') && dashboardData?.alumni && (
          <AiMentorSuggestions currentUser={user} allAlumni={dashboardData.alumni} />
        )}

        {visibleWidgetIds.has('promotionCard') && activePromotions.length > 0 && (
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

        <div className="grid gap-6 md:grid-cols-2">
          {visibleWidgetIds.has('jobApplicationStatusChart') && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("userDashboard.charts.jobApplicationStatus.title")}</CardTitle>
                <CardDescription>{t("userDashboard.charts.jobApplicationStatus.description")}</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={jobApplicationStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="hsl(var(--primary))" dataKey="value" onMouseEnter={onPieEnter} stroke="hsl(var(--background))" className="focus:outline-none">
                      {jobApplicationStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {visibleWidgetIds.has('matchScoreOverTimeChart') && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("userDashboard.charts.matchScoreOverTime.title")}</CardTitle>
                <CardDescription>{t("userDashboard.charts.matchScoreOverTime.description")}</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={matchScoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8, style: { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' } }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          
          {visibleWidgetIds.has('userBadges') && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary"/>My Badges</CardTitle>
                    <CardDescription>A collection of your achievements.</CardDescription>
                </CardHeader>
                <CardContent>
                    {earnedBadges.length > 0 ? (
                        <TooltipProvider>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {earnedBadges.slice(0, 12).map((badge: BadgeType) => (
                                    <UITooltip key={badge.id}>
                                        <TooltipTrigger asChild>
                                            <div className="flex flex-col items-center p-2 border rounded-lg bg-primary/10 text-center transition-transform hover:scale-105">
                                                <DynamicIcon name={badge.icon as IconName} className="h-8 w-8 text-primary mb-1" />
                                                <p className="text-[10px] font-medium text-foreground truncate w-full">{badge.name}</p>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent><p className="font-semibold">{badge.name}</p><p className="text-xs text-muted-foreground">{badge.description}</p></TooltipContent>
                                    </UITooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No badges earned yet. Keep exploring!</p>
                    )}
                </CardContent>
                <CardFooter><Button variant="link" asChild className="text-xs p-0"><Link href="/gamification">View All Badges & Progress</Link></Button></CardFooter>
            </Card>
          )}

          {visibleWidgetIds.has('leaderboard') && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary"/>Community Leaderboard</CardTitle>
                    <CardDescription>Top 5 users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                      <Table>
                          <TableBody>
                              {leaderboardUsers.map((lbUser: UserProfile, index: number) => (
                                  <TableRow key={lbUser.id} className={cn(lbUser.id === user.id && "bg-primary/10")}>
                                      <TableCell className="text-center font-bold w-10">{getRankIcon(index + 1)}</TableCell>
                                      <TableCell>
                                          <div className="flex items-center gap-2">
                                              <Avatar className="h-8 w-8"><AvatarImage src={lbUser.profilePictureUrl} alt={lbUser.name} data-ai-hint="person face"/><AvatarFallback>{lbUser.name ? lbUser.name.substring(0, 1).toUpperCase() : <UserIcon />}</AvatarFallback></Avatar>
                                              <span className="font-medium text-sm">{lbUser.name}</span>
                                          </div>
                                      </TableCell>
                                      <TableCell className="text-right font-semibold">{lbUser.xpPoints?.toLocaleString() || 0} XP</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                </CardContent>
                <CardFooter><Button variant="link" asChild className="text-xs p-0"><Link href="/gamification">View Full Leaderboard</Link></Button></CardFooter>
            </Card>
          )}

          {visibleWidgetIds.has('jobAppReminders') && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary"/>{t("userDashboard.reminders.jobApp.title")}</CardTitle>
                <CardDescription>{t("userDashboard.reminders.jobApp.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingReminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("userDashboard.reminders.jobApp.noReminders")}</p>
                ) : (
                  <ul className="space-y-3">
                    {upcomingReminders.map((app: JobApplication) => (
                      <li key={app.id} className="p-3 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                        <Link href="/job-tracker" className="block">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-foreground">{app.jobTitle} at {app.companyName}</p>
                              <p className="text-xs text-amber-700 dark:text-amber-500">
                                Reminder: {format(parseISO(app.reminderDate!), 'MMM dd, yyyy')}
                                {differenceInDays(parseISO(app.reminderDate!), new Date()) === 0 && ` ${t("userDashboard.upcomingSessions.todayLabel")}`}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs text-primary">{t("userDashboard.reminders.jobApp.viewButton")}</Button>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {visibleWidgetIds.has('upcomingAppointments') && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarCheck2 className="h-5 w-5 text-primary"/>{t("userDashboard.upcomingSessions.title")}</CardTitle>
                <CardDescription>{t("userDashboard.upcomingSessions.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointmentsAndSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("userDashboard.upcomingSessions.noSessions")}</p>
                ) : (
                  <ul className="space-y-3">
                    {upcomingAppointmentsAndSessions.map(item => (
                      <li key={item.id} className="p-3 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-foreground flex items-center gap-2">{item.title}{item.isPractice && <Badge variant="outline">Practice</Badge>}</p>
                              <p className="text-xs text-muted-foreground">{t("userDashboard.upcomingSessions.typeLabel")}: {item.type}</p>
                              <p className="text-xs text-muted-foreground">{t("userDashboard.upcomingSessions.withLabel")}: {item.with}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {t("userDashboard.upcomingSessions.dateLabel")}: {format(item.date, 'MMM dd, yyyy, p')}
                                {differenceInDays(item.date, new Date()) === 0 && ` ${t("userDashboard.upcomingSessions.todayLabel")}`}
                              </p>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-xs text-primary"><Link href={item.link}>{t("userDashboard.reminders.jobApp.viewButton")}</Link></Button>
                          </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {visibleWidgetIds.has('recentActivities') && (
          <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><HistoryIcon className="h-5 w-5 text-primary" />{t("userDashboard.recentActivities.title")}</CardTitle>
                <CardDescription>{t("userDashboard.recentActivities.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {recentUserActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("userDashboard.recentActivities.noActivities")}</p>
                ) : (
                  <ScrollArea className="h-[250px] pr-3">
                    <ul className="space-y-3">
                      {recentUserActivities.map((activity: ActivityType) => (
                        <li key={activity.id} className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-md">
                          <Activity className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter><Button variant="link" asChild><Link href="/activity-log">{t("userDashboard.recentActivities.viewAllButton")}</Link></Button></CardFooter>
            </Card>
        )}
      </div>

      <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("userDashboard.customizeDialog.title")}</DialogTitle>
            <DialogUIDescription>{t("userDashboard.customizeDialog.description")}</DialogUIDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1 -mx-1">
            <div className="space-y-3 p-4">
              {AVAILABLE_WIDGETS.map((widget) => (
                <div key={widget.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/30">
                  <Checkbox id={`widget-toggle-${widget.id}`} checked={tempVisibleWidgetIds.has(widget.id)} onCheckedChange={(checked) => handleCustomizeToggle(widget.id, Boolean(checked))}/>
                  <Label htmlFor={`widget-toggle-${widget.id}`} className="font-normal text-sm flex-1 cursor-pointer">{t(`userDashboard.widgets.${widget.id}`, {defaultValue: widget.title})}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomizeDialogOpen(false)}>{t("userDashboard.customizeDialog.cancelButton")}</Button>
            <Button onClick={handleSaveCustomization} className="bg-primary hover:bg-primary/90">{t("userDashboard.customizeDialog.saveButton")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
