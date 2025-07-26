
"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, CheckCircle, Trash2, Eye, Loader2 } from "lucide-react";
import type { CommunityPost } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";
import { getCommunityPosts, updateCommunityPost } from "@/lib/actions/community";

export default function ContentModerationPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const allPosts = await getCommunityPosts(currentUser.role === 'admin' ? null : currentUser.tenantId, currentUser.id);
    setPosts(allPosts);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const flaggedPosts = useMemo(() => {
    return posts.filter(post => post.moderationStatus === 'flagged');
  }, [posts]);

  const handleApprove = async (postId: string) => {
    const updatedPost = await updateCommunityPost(postId, { moderationStatus: 'visible', flagCount: 0 });
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

      <Card className="shadow-lg">
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
                  <TableHead>{t("contentModeration.table.dateFlagged", { default: "Date Flagged" })}</TableHead>
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
                    <TableCell>{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</TableCell>
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
    </div>
  );
}
