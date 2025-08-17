
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Flame, Star, CheckCircle, Trophy, UserCircle, Loader2 } from "lucide-react"; 
import { sampleBadges, samplePlatformUsers } from "@/lib/sample-data"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useMemo } from "react"; 
import type { UserProfile } from "@/types";
import { useAuth } from "@/hooks/use-auth";

type IconName = keyof typeof LucideIcons;

function DynamicIcon({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) {
  const IconComponent = LucideIcons[name] as React.ElementType;

  if (!IconComponent) {
    return <LucideIcons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
}


export default function GamificationPage() {
  const { t } = useI18n();
  const { user, isLoading: isUserLoading } = useAuth();
  const badges = sampleBadges;
  const [leaderboardUsers, setLeaderboardUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const sortedUsers = [...samplePlatformUsers]
      .filter(u => typeof u.xpPoints === 'number' && u.xpPoints > 0)
      .sort((a, b) => (b.xpPoints || 0) - (a.xpPoints || 0));
    setLeaderboardUsers(sortedUsers.slice(0, 10)); // Show top 10
  }, []);

  const earnedBadges = useMemo(() => {
    if (!user) return [];
    return badges.filter(badge => user.earnedBadges?.includes(badge.id));
  }, [user, badges]);

  const notEarnedBadges = useMemo(() => {
    if (!user) return [];
    return badges.filter(badge => !user.earnedBadges?.includes(badge.id));
  }, [user, badges]);

  if (isUserLoading || !user) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  
  const xpPerLevel = 1000;
  const xpLevel = Math.floor((user.xpPoints || 0) / xpPerLevel) + 1;
  const xpForCurrentLevelStart = (xpLevel - 1) * xpPerLevel;
  const xpForNextLevel = xpLevel * xpPerLevel;
  const xpProgressInLevel = (user.xpPoints || 0) - xpForCurrentLevelStart;
  const progressPercentage = (xpProgressInLevel / xpPerLevel) * 100;


  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Star className="h-5 w-5 text-orange-400" />;
    return <span className="text-sm font-medium w-5 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Award className="h-8 w-8" /> {t("gamification.title")}
      </h1>
      <CardDescription>{t("gamification.pageDescription")}</CardDescription>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary"/>XP & Level</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-5xl font-bold text-primary">{xpLevel}</p>
            <Progress value={progressPercentage} className="w-full h-3 my-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{xpProgressInLevel} XP</span>
              <span>{xpForNextLevel - (user.xpPoints || 0)} XP to Level {xpLevel + 1}</span>
            </div>
            <p className="text-sm font-semibold mt-4">{user.xpPoints || 0} Total XP</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-primary"/>Daily Streak</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-primary">{user.dailyStreak || 0}</p>
            <p className="text-lg text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary"/>Badges Earned</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-primary">{earnedBadges.length}</p>
            <p className="text-lg text-muted-foreground">Total Badges</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("gamification.yourBadges")}</CardTitle>
          <CardDescription>
            {t("gamification.badgesDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {earnedBadges.map((badge) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-3 border rounded-lg bg-primary/10 text-center transition-transform hover:scale-105">
                      <DynamicIcon name={badge.icon as IconName} className="h-10 w-10 text-primary mb-2" />
                      <p className="text-xs font-medium text-foreground">{badge.name}</p>
                      <CheckCircle className="h-4 w-4 text-green-500 absolute top-1 right-1" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.xpReward && <p className="text-xs text-yellow-500">+{badge.xpReward} XP</p>}
                  </TooltipContent>
                </Tooltip>
              ))}
              {notEarnedBadges.map((badge) => (
                 <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-3 border rounded-lg bg-secondary/50 text-center opacity-50 cursor-help">
                      <DynamicIcon name={badge.icon as IconName} className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-xs font-medium text-muted-foreground">{badge.name}</p>
                    </div>
                  </TooltipTrigger>
                   <TooltipContent>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.xpReward && <p className="text-xs text-yellow-500">+{badge.xpReward} XP</p>}
                     <p className="text-xs text-red-500 mt-1">(Not Yet Earned)</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-6 w-6 text-primary"/>{t("gamification.leaderboard")}</CardTitle>
          <CardDescription>{t("gamification.leaderboardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboardUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Leaderboard data is currently being calculated. Check back soon!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">XP Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardUsers.map((lbUser, index) => (
                  <TableRow key={lbUser.id} className={cn(index < 3 && "bg-secondary/50 font-semibold", lbUser.id === user.id && "bg-primary/10 border-l-2 border-primary")}>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center h-full">
                        {getRankIcon(index + 1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={lbUser.profilePictureUrl} alt={lbUser.name} data-ai-hint="person face"/>
                          <AvatarFallback>
                            {lbUser.name ? lbUser.name.substring(0, 1).toUpperCase() : <UserCircle />}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn("font-medium", index < 3 && "text-primary")}>{lbUser.name} {lbUser.id === user.id && "(You)"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {lbUser.xpPoints?.toLocaleString() || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
