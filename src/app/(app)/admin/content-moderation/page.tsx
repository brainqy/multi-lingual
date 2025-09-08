
"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, CheckCircle, Trash2, Eye, Loader2, Info } from "lucide-react";
import type { CommunityPost } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";
import { getCommunityPosts, updateCommunityPost } from "@/lib/actions/community";
import { Badge } from "@/components/ui/badge";

export default function ContentModerationPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const allPosts = await getCommunityPosts(currentUser.id);
    setPosts(allPosts);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const flaggedPosts = useMemo(() => {
    return posts
      .filter(post => post.moderationStatus === 'flagged')
      .sort((a, b) => {
        const flagCountDiff = (b.flagCount || 0) - (a.flagCount || 0);
        if (flagCountDiff !== 0) {
          return flagCountDiff;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [posts]);

  const reasonStats = useMemo(() => {
    const stats = new Map<string, number>();
    flaggedPosts.forEach(post => {
        post.flagReasons?.forEach(reason => {
            stats.set(reason, (stats.get(reason) || 0) + 1);
        });
    });
    return Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  }, [flaggedPosts]);


  const handleApprove = async (postId: string) => {
    const updatedPost = await updateCommunityPost(postId, { moderationStatus: 'visible', flagCount: 0, flagReasons: [] });
    if (updatedPost) {
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        toast({ title: t("contentModeration.toast.postApproved.title", { default: "Post Approved" }), description: t("contentModeration.toast.postApproved.description", { default: "The post is now visible on the community feed." }) });
    } else {
        toast({ title: "Error", description: "Failed to approve post.", variant: "destructive" });
    }
  };

  const handleRemove = async (postId: string) => {
    const updatedPost = await updateCommunityPost(postId, { moderationStatus: 'removed' });
     if (updatedPost) {
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        toast({ title: t("contentModeration.toast.postRemoved.title", { default: "Post Removed" }), description: t("contentModeration.toast.postRemoved.description", { default: "The flagged post has been removed from the feed." }), variant: "destructive" });
    } else {
        toast({ title: "Error", description: "Failed to remove post.", variant: "destructive" });
    }
  };


  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
    return <AccessDeniedMessage />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <ShieldAlert className="h-8 w-8" /> 
        {t("contentModeration.title", { default: "Content Moderation" })}
        {currentUser.role === 'manager' && ` (${t("contentModeration.descriptionTenant", { default: "Manage content for {tenantId}", tenantId: currentUser.tenantId || "Your Tenant" }).substring(t("contentModeration.descriptionTenant", { default: "Manage content for {tenantId}" }).indexOf(':') + 1).trim()})`}
      </h1>
      <CardDescription>
        {currentUser.role === 'manager' ? t("contentModeration.descriptionTenant", { default: "Review and manage flagged content within your tenant: {tenantId}.", tenantId: currentUser.tenantId || "your tenant"}) : t("contentModeration.descriptionPlatform", { default: "Review and manage flagged content from across the platform." })}
      </CardDescription>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("contentModeration.flaggedPostsTitle", { default: "Flagged Posts for Review" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : flaggedPosts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {currentUser.role === 'manager' ? t("contentModeration.noFlaggedPostsTenant", { default: "No posts have been flagged for review in your tenant." }) : t("contentModeration.noFlaggedPostsPlatform", { default: "No posts have been flagged for review on the platform." })}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("contentModeration.table.author", { default: "Author" })}</TableHead>
                    <TableHead>{t("contentModeration.table.contentSnippet", { default: "Content Snippet" })}</TableHead>
                    <TableHead>{t("contentModeration.table.flagCount", { default: "Flag Count" })}</TableHead>
                    <TableHead>{t("contentModeration.table.reasons", { default: "Reasons" })}</TableHead>
                    <TableHead className="text-right">{t("contentModeration.table.actions", { default: "Actions" })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.userAvatar} alt={post.userName} data-ai-hint="person face"/>
                            <AvatarFallback>{post.userName.substring(0,1)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{post.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{post.content?.substring(0,100) || "N/A"}...</TableCell>
                      <TableCell className="text-center">{post.flagCount}</TableCell>
                      <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                              {post.flagReasons?.map((reason, index) => (
                                  <Badge key={index} variant="secondary">{reason}</Badge>
                              ))}
                          </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/community-feed#post-${post.id}`} title={t("contentModeration.viewOnFeedTitle", { default: "View Post on Feed" })}>
                             <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleApprove(post.id)} className="text-green-600 border-green-600 hover:bg-green-50">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRemove(post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Flagging Stats</CardTitle>
            <CardDescription>Breakdown of reasons for flagged posts.</CardDescription>
          </CardHeader>
          <CardContent>
            {reasonStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No data to display.</p>
            ) : (
                <ul className="space-y-3">
                    {reasonStats.map(([reason, count]) => (
                        <li key={reason} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-foreground">{reason}</span>
                            <Badge variant="secondary">{count}</Badge>
                        </li>
                    ))}
                </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    