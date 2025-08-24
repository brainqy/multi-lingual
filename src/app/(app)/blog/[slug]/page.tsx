
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, User, Tag, MessageSquare, Share2, Copy, Send, ArrowLeft, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { CommunityComment, BlogPost } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/actions/blog';
import { addCommentToPost } from '@/lib/actions/community';

export default function BlogPostClientView() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    async function loadPostAndAllPosts() {
      const slug = params.slug as string;
      if (!slug) {
        setIsLoading(false);
        router.push('/blog');
        return;
      }
      setIsLoading(true);
      const [postData, allPostsData] = await Promise.all([
        getBlogPostBySlug(slug),
        getBlogPosts() 
      ]);

      if (postData) {
        setPost(postData);
        setAllPosts(allPostsData);
      } else {
        toast({
          title: "Post Not Found",
          description: "The requested blog post could not be found.",
          variant: "destructive"
        });
        router.push('/blog');
      }
      setIsLoading(false);
    }
    loadPostAndAllPosts();
  }, [params.slug, router, toast]);
  
  const relatedPosts = useMemo(() => {
    if (!post || !post.tags || post.tags.length === 0) return [];

    return allPosts.filter(otherPost => {
      return otherPost.id !== post.id && otherPost.tags?.some(tag => post.tags!.includes(tag));
    }).slice(0, 3);
  }, [post, allPosts]);


  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({ title: "Link Copied", description: "Blog post link copied to clipboard!" });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
    });
  };
  
  const handleGenericShare = () => {
    if (navigator.share && post) {
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post || !currentUser) {
      toast({ title: "Error", description: "Cannot submit empty comment or user not logged in.", variant: "destructive"});
      return;
    }

    const newCommentData: Omit<CommunityComment, 'id' | 'timestamp'> = {
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePictureUrl,
      comment: commentText.trim(),
      blogPostId: post.id, // Correctly assign blogPostId
    };

    const newComment = await addCommentToPost(newCommentData);

    if (newComment) {
      setPost(prevPost => prevPost ? { ...prevPost, comments: [...(prevPost.comments || []), newComment] } : null);
      setCommentText('');
      toast({ title: "Comment Added", description: "Your comment has been posted." });
    } else {
      toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return null; // Render nothing while redirecting
  }

  return (
     <div className="max-w-4xl mx-auto space-y-8 py-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Blog</Link>
        </Button>

      {post.imageUrl && (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            style={{ objectFit: "cover" }}
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
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/> {format(new Date(post.date), 'PPP')}</span>
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
          
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Share2 className="h-5 w-5 text-primary"/>Share this post:</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyToClipboard}><Copy className="mr-2 h-4 w-4"/>Copy Link</Button>
              <Button variant="outline" size="sm" onClick={handleGenericShare}><Share2 className="mr-2 h-4 w-4"/>Share</Button>
            </div>
          </div>

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
                      <p className="text-sm mt-0.5 text-foreground/90">{comment.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>

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
      
      {relatedPosts.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map(relatedPost => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} passHref>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden h-full cursor-pointer">
                  {relatedPost.imageUrl && (
                    <div className="relative w-full h-40">
                      <Image
                        src={relatedPost.imageUrl}
                        alt={relatedPost.title}
                        fill
                        style={{ objectFit: "cover" }}
                        data-ai-hint="blog post image"
                      />
                    </div>
                  )}
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg leading-tight line-clamp-2">{relatedPost.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{relatedPost.excerpt}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto">
                    <span className="text-primary text-sm font-semibold flex items-center gap-1">
                      Read More <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
