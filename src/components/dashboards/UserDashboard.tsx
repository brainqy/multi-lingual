
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PieChart, Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector, LineChart as RechartsLineChart } from 'recharts';
import { Activity, Briefcase, Users, Zap, FileText, CheckCircle, Clock, Target, CalendarClock, CalendarCheck2, History as HistoryIcon, Gift, ExternalLink, Settings, Loader2, PlusCircle, Trash2, Puzzle, ArrowRight, Award, Flame } from "lucide-react";
import sampleChallenges from "@/lib/sample-challenges";
import { sampleJobApplications, sampleActivities, sampleAlumni, sampleUserProfile, sampleAppointments, userDashboardTourSteps, samplePracticeSessions } from "@/lib/sample-data";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useState, useCallback, useEffect, useMemo } from "react";
import { format, parseISO, isFuture, differenceInDays, isToday, compareAsc, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import type { TourStep, Appointment, PracticeSession, Activity as ActivityType, InterviewQuestionCategory, DailyChallenge } from '@/types';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/hooks/use-i18n";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";


const jobApplicationStatusData = sampleJobApplications.reduce((acc, curr) => {
  const status = curr.status;
  const existing = acc.find(item => item.name === status);
  if (existing) {
    existing.value += 1;
  } else {
    acc.push({ name: status, value: 1 });
  }
  return acc;
}, [] as { name: string, value: number }[]);

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

type UserDashboardWidgetId =
  | 'promotionCard'
  | 'jobApplicationStatusChart'
  | 'matchScoreOverTimeChart'
  | 'jobAppReminders'
  | 'upcomingAppointments'
  | 'recentActivities';

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
];

export default function UserDashboard() {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const user = sampleUserProfile;
  const { toast } = useToast();
  const [showUserTour, setShowUserTour] = useState(false);

  const [visibleWidgetIds, setVisibleWidgetIds] = useState<Set<UserDashboardWidgetId>>(
    new Set(AVAILABLE_WIDGETS.filter(w => w.defaultVisible).map(w => w.id))
  );
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [tempVisibleWidgetIds, setTempVisibleWidgetIds] = useState<Set<UserDashboardWidgetId>>(visibleWidgetIds);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);


  const recentUserActivities = useMemo(() => {
    return sampleActivities
      .filter(act => act.userId === user.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [user.id]);

  useEffect(() => {
    const today = new Date();
    sampleAppointments.forEach(appt => {
        if (appt.requesterUserId === user.id || appt.alumniUserId === user.id) {
            if (appt.reminderDate && isToday(parseISO(appt.reminderDate))) {
                toast({
                    title: t("userDashboard.toast.appointmentReminder.title"),
                    description: t("userDashboard.toast.appointmentReminder.description", {title: appt.title, user: appt.withUser, time: format(parseISO(appt.dateTime), 'p')}),
                    duration: 10000,
                });
            }
        }
    });

    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('userDashboardTourSeen');
      if (!tourSeen) {
        setShowUserTour(true);
      }
    }
  }, [user.id, toast, t]);

  useEffect(() => {
    const userPreferredChallenges = sampleChallenges
      .filter(c => c.type === 'standard' && user.challengeTopics?.includes(c.category as InterviewQuestionCategory));
    
    if (userPreferredChallenges.length > 0) {
      setDailyChallenge(userPreferredChallenges[Math.floor(Math.random() * userPreferredChallenges.length)]);
    } else {
      const standardChallenges = sampleChallenges.filter(c => c.type === 'standard');
      if (standardChallenges.length > 0) {
        setDailyChallenge(standardChallenges[Math.floor(Math.random() * standardChallenges.length)]);
      }
    }
  }, [user.challengeTopics]);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const matchScoreData = [
    { date: 'Jan', score: 70 },
    { date: 'Feb', score: 75 },
    { date: 'Mar', score: 80 },
    { date: 'Apr', score: 72 },
    { date: 'May', score: 85 },
    { date: 'Jun', score: 78 },
  ];

  const upcomingReminders = useMemo(() => {
    return sampleJobApplications
      .filter(app => app.userId === user.id && app.reminderDate && isFuture(parseISO(app.reminderDate)))
      .sort((a, b) => new Date(a.reminderDate!).getTime() - new Date(b.reminderDate!).getTime())
      .slice(0, 5);
  }, [user.id]);

  const upcomingAppointmentsAndSessions = useMemo(() => {
    const upcomingAppts = sampleAppointments
      .filter(appt => (appt.requesterUserId === user.id || appt.alumniUserId === user.id) && appt.status === 'Confirmed' && isFuture(parseISO(appt.dateTime)))
      .map(appt => ({
        id: appt.id,
        date: parseISO(appt.dateTime),
        title: appt.title,
        type: 'Appointment',
        with: appt.withUser,
        link: '/appointments'
      }));

    const upcomingPractice = samplePracticeSessions
      .filter(ps => ps.userId === user.id && ps.status === 'SCHEDULED' && isFuture(parseISO(ps.date)))
      .map(ps => ({
        id: ps.id,
        date: parseISO(ps.date),
        title: ps.category,
        type: ps.type,
        with: ps.category.includes('AI') ? 'AI Coach' : ps.category.includes('Expert') ? 'Expert Mentor' : 'Friend',
        link: '/interview-prep'
      }));

    return [...upcomingAppts, ...upcomingPractice]
      .sort((a, b) => compareAsc(a.date, b.date))
      .slice(0, 5);
  }, [user.id]);

  const handleCustomizeToggle = (widgetId: UserDashboardWidgetId, checked: boolean) => {
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
    toast({ title: t("userDashboard.toast.dashboardUpdated.title"), description: t("userDashboard.toast.dashboardUpdated.description") });
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

          {dailyChallenge && (
            <Card className="lg:col-span-1 shadow-lg flex flex-col">
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
        </div>
        
        {visibleWidgetIds.has('promotionCard') && (
          <Card className="shadow-lg bg-gradient-to-r from-primary/80 via-primary to-accent/80 text-primary-foreground overflow-hidden">
            <div className="flex flex-col md:flex-row items-center p-6 gap-6">
              <div className="md:w-1/3 flex justify-center">
                <Image
                  src="https://picsum.photos/seed/promotion/300/200"
                  alt="Promotional Offer"
                  width={250}
                  height={160}
                  className="rounded-lg shadow-md object-cover"
                  data-ai-hint="promotion offer"
                />
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{t("userDashboard.promotionalSpotlight.title")}</h2>
                <p className="text-sm opacity-90 mb-4">
                  {t("userDashboard.promotionalSpotlight.description")}
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={() => toast({ title: t("userDashboard.toast.upgradeMock.title"), description: t("userDashboard.toast.upgradeMock.description")})}
                >
                  {t("userDashboard.promotionalSpotlight.learnMoreButton")} <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
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
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={jobApplicationStatusData.filter(j => sampleJobApplications.find(sja => sja.userId === user.id && sja.status === j.name))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      stroke="hsl(var(--background))"
                      className="focus:outline-none"
                    >
                      {jobApplicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
                    {upcomingReminders.map(app => (
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
                        <Link href={item.link} className="block">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{t("userDashboard.upcomingSessions.typeLabel")}: {item.type}</p>
                              <p className="text-xs text-muted-foreground">{t("userDashboard.upcomingSessions.withLabel")}: {item.with}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {t("userDashboard.upcomingSessions.dateLabel")}: {format(item.date, 'MMM dd, yyyy, p')}
                                {differenceInDays(item.date, new Date()) === 0 && ` ${t("userDashboard.upcomingSessions.todayLabel")}`}
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
              <CardFooter>
                  <Button variant="link" asChild>
                      <Link href="/activity-log">{t("userDashboard.recentActivities.viewAllButton")}</Link>
                  </Button>
              </CardFooter>
            </Card>
        )}
      </div>

      <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("userDashboard.customizeDialog.title")}</DialogTitle>
            <DialogUIDescription>
              {t("userDashboard.customizeDialog.description")}
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
                    {t(`userDashboard.widgets.${widget.id}` as any, {defaultValue: widget.title})} 
                  </Label>
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
