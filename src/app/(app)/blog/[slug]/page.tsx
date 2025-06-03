
"use client";

import { useParams } from 'next/navigation';
import { sampleBlogPosts, sampleUserProfile } from '@/lib/sample-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, User, Tag, MessageSquare, Share2, Copy, Send } from 'lucide-react';
import Image from 'next/image';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Added import for Label
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { CommunityComment, BlogPost } from '@/types'; // Assuming CommunityComment is defined

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const postIndex = sampleBlogPosts.findIndex(p => p.slug === slug);
  const post = postIndex !== -1 ? sampleBlogPosts[postIndex] : null;

  const [commentText, setCommentText] = useState('');

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Post Not Found</h1>
        <p className="text-muted-foreground">The blog post you are looking for does not exist.</p>
        <Button asChild variant="link" className="mt-4">
            <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Blog</Link>
        </Button>
      </div>
    );
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({ title: "Link Copied", description: "Blog post link copied to clipboard!" });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
    });
  };
  
  const handleGenericShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      handleCopyToClipboard();
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast({ title: "Empty Comment", description: "Cannot submit an empty comment.", variant: "destructive"});
      return;
    }

    const newComment: CommunityComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePictureUrl,
      timestamp: new Date().toISOString(),
      text: commentText.trim(),
    };

    // Update the sampleBlogPosts array (in a real app, this would be an API call)
    const updatedPost = { ...post, comments: [...(post.comments || []), newComment] };
    sampleBlogPosts[postIndex] = updatedPost; // This directly mutates the imported array for demo purposes.

    setCommentText('');
    toast({ title: "Comment Added", description: "Your comment has been posted." });
    // Force re-render (simple way for demo, better state management for real app)
    // This is a hack for demo, in real app, state update would trigger re-render.
    // Consider using a state variable for the post itself if mutations are frequent.
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Blog</Link>
        </Button>

      {post.imageUrl && (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.imageUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="blog post image"
            priority 
          />
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">{post.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
            <span className="flex items-center gap-1"><User className="h-4 w-4"/> {post.author}</span>
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/> {format(parseISO(post.date), 'PPP')}</span>
             {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                    <Tag className="h-4 w-4"/>
                    {post.tags.map(tag => (
                         <span key={tag} className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">{tag}</span>
                    ))}
                </div>
             )}
          </div>
        </CardHeader>
        <Separator className="my-4" />
        <CardContent>
          <article className="prose prose-lg dark:prose-invert max-w-none text-foreground">
             <p className="whitespace-pre-line">{post.content}</p>
          </article>
          
          {/* Sharing Section */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Share2 className="h-5 w-5 text-primary"/>Share this post:</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyToClipboard}><Copy className="mr-2 h-4 w-4"/>Copy Link</Button>
              <Button variant="outline" size="sm" onClick={handleGenericShare}><Share2 className="mr-2 h-4 w-4"/>Share</Button>
              {/* Add more specific social media share buttons if needed */}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary"/> Comments ({post.comments?.length || 0})
            </h3>
            <div className="space-y-4 mb-6">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-md">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={comment.userAvatar || `https://avatar.vercel.sh/${comment.userId}.png`} alt={comment.userName} data-ai-hint="person face"/>
                      <AvatarFallback>{comment.userName.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{comment.userName}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</p>
                      </div>
                      <p className="text-sm mt-0.5 text-foreground/90">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Label htmlFor="comment-text" className="font-medium">Leave a Comment</Label>
              <Textarea
                id="comment-text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                rows={3}
                required
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4"/> Post Comment
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

