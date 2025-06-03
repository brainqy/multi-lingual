
"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, CheckCircle, Trash2, Eye } from "lucide-react";
import { sampleCommunityPosts, sampleUserProfile } from "@/lib/sample-data";
import type { CommunityPost } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

export default function ContentModerationPage() {
  const currentUser = sampleUserProfile;
  const { toast } = useToast();
  
  // Initial posts state based on role
  const [posts, setPosts] = useState<CommunityPost[]>(
    currentUser.role === 'admin' 
      ? sampleCommunityPosts 
      : sampleCommunityPosts.filter(p => p.tenantId === currentUser.tenantId)
  );

  // Update posts if the global sample data changes (for demo purposes)
  useEffect(() => {
     setPosts(
      currentUser.role === 'admin' 
        ? sampleCommunityPosts 
        : sampleCommunityPosts.filter(p => p.tenantId === currentUser.tenantId)
    );
  }, []); // Rerun if sampleCommunityPosts identity changes (won't for this setup, but good for real data)


  const flaggedPosts = useMemo(() => {
    return posts.filter(post => post.moderationStatus === 'flagged');
  }, [posts]);

  const handleApprove = (postId: string) => {
    const updateGlobalAndLocal = (updater: (p: CommunityPost) => CommunityPost) => {
        const globalIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
        if (globalIndex !== -1) sampleCommunityPosts[globalIndex] = updater(sampleCommunityPosts[globalIndex]);
        setPosts(prev => prev.map(p => p.id === postId ? updater(p) : p));
    };
    updateGlobalAndLocal(p => ({...p, moderationStatus: 'visible', flagCount: 0}));
    toast({ title: "Post Approved", description: "Post marked as visible. Refresh Community Feed to see changes." });
  };

  const handleRemove = (postId: string) => {
     const updateGlobalAndLocal = (updater: (p: CommunityPost) => CommunityPost) => {
        const globalIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
        if (globalIndex !== -1) sampleCommunityPosts[globalIndex] = updater(sampleCommunityPosts[globalIndex]);
        setPosts(prev => prev.map(p => p.id === postId ? updater(p) : p));
    };
    updateGlobalAndLocal(p => ({...p, moderationStatus: 'removed'}));
    toast({ title: "Post Removed", description: "Post marked as removed. Refresh Community Feed to see changes.", variant: "destructive" });
  };


  if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    return <AccessDeniedMessage />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <ShieldAlert className="h-8 w-8" /> Content Moderation {currentUser.role === 'manager' && `(Tenant: ${currentUser.tenantId})`}
      </h1>
      <CardDescription>Review and manage posts flagged by users or AI{currentUser.role === 'manager' && ' within your tenant'}.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Flagged Posts for Review</CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts are currently flagged for review{currentUser.role === 'manager' && ' in your tenant'}.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Content Snippet</TableHead>
                  <TableHead>Flag Count</TableHead>
                  <TableHead>Date Flagged</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        <Link href={`/community-feed#post-${post.id}`} title="View on Feed (feature in development)">
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
