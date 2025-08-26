
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, PlusCircle, ThumbsUp, MessageCircle as MessageIcon, Share2, Send, Filter, Edit3, Calendar, MapPin, Flag, ShieldCheck, Trash2, User as UserIcon, TrendingUp, Star, Ticket, Users as UsersIcon, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Brain as BrainIcon, ListChecks, Mic, Video, Settings2, Puzzle, Lightbulb, Code as CodeIcon, Eye, ImageIcon as ImageIconLucide, Sparkles as SparklesIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { CommunityPost, CommunityComment, UserProfile, AppointmentStatus, Appointment } from "@/types";
import { formatDistanceToNow, parseISO, isFuture as dateIsFuture } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription as DialogUIDescription } from "@/components/ui/dialog";
import { useI18n } from "@/hooks/use-i18n";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { createCommunityPost, getCommunityPosts, addCommentToPost, updateCommunityPost, toggleLikePost, togglePollVote, toggleEventRegistration, toggleFlagPost } from '@/lib/actions/community';
import { getUsers } from "@/lib/data-services/users";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


const postSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty for most post types."),
  tags: z.string().optional(),
  type: z.enum(['text', 'poll', 'event', 'request']),
  imageUrl: z.string().url("Invalid URL format").optional().or(z.literal('')),
  pollOptions: z.array(z.object({ option: z.string(), votes: z.number().default(0) })).optional(),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  eventTitle: z.string().optional(),
  attendees: z.coerce.number().min(0).optional().default(0),
  capacity: z.coerce.number().min(0).optional().default(0),
  assignedTo: z.string().optional(),
  status: z.enum(['open', 'in progress', 'completed']).optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'poll') {
        if (!data.pollOptions || data.pollOptions.filter(opt => opt.option.trim()).length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Polls must have at least two valid options.",
                path: ["pollOptions"],
            });
        }
    }
    if (data.type === 'event') {
        if (!data.eventTitle?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Event title is required.", path: ["eventTitle"] });
        }
        if (!data.eventDate) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Event date is required.", path: ["eventDate"] });
        }
        if (!data.eventLocation?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Event location is required.", path: ["eventLocation"] });
        }
    }
});


type PostFormData = z.infer<typeof postSchema>;

const renderWithMentions = (text: string | null | undefined) => {
  if (!text) return null;
  const parts = text.split(/(@[\w\s]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return <strong key={i} className="text-primary font-semibold">{part}</strong>;
    }
    return part;
  });
};

const CommentThread = ({ comment, allComments, onReply, onCommentSubmit, level, replyingToCommentId, replyText, onReplyTextChange, currentUser }: {
  comment: CommunityComment;
  allComments: CommunityComment[];
  onReply: (commentId: string, userName: string) => void;
  onCommentSubmit: (postId: string, text: string, parentId: string) => void;
  level: number;
  replyingToCommentId: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  currentUser: UserProfile;
}) => {
  const replies = allComments.filter(c => c.parentId === comment.id);

  return (
    <div className={cn("flex items-start space-x-2", level > 0 && "ml-6 mt-2")}>
      <Avatar className="h-7 w-7">
        <AvatarImage src={comment.userAvatar} alt={comment.userName} data-ai-hint="person face" />
        <AvatarFallback><UserIcon className="h-3.5 w-3.5" /></AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-secondary/40 p-2 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">{comment.userName}</p>
            <p className="text-[10px] text-muted-foreground/80">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</p>
          </div>
          <p className="text-sm mt-0.5">{renderWithMentions(comment.comment)}</p>
        </div>
        <Button variant="link" size="xs" className="text-xs text-muted-foreground p-0 h-auto mt-0.5" onClick={() => onReply(comment.id, comment.userName)}>Reply</Button>
        {replyingToCommentId === comment.id && (
           <div className="flex items-center gap-2 pt-2">
              <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.name} data-ai-hint="person face" />
                  <AvatarFallback>{currentUser.name.substring(0, 1)}</AvatarFallback>
              </Avatar>
              <Textarea
                  placeholder={`Replying to ${comment.userName}...`}
                  value={replyText}
                  onChange={(e) => onReplyTextChange(e.target.value)}
                  rows={1}
                  className="flex-1 min-h-[40px] text-sm"
                  autoFocus
              />
              <Button size="sm" onClick={() => onCommentSubmit(comment.postId!, replyText, comment.id)} disabled={!replyText.trim()}>
                  <Send className="h-4 w-4" />
              </Button>
          </div>
        )}
        {replies.map(reply => (
            <CommentThread 
                key={reply.id} 
                comment={reply} 
                allComments={allComments} 
                onReply={onReply} 
                onCommentSubmit={onCommentSubmit} 
                level={level + 1} 
                replyingToCommentId={replyingToCommentId}
                replyText={replyText}
                onReplyTextChange={onReplyTextChange}
                currentUser={currentUser}
            />
        ))}
      </div>
    </div>
  );
};


export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'text' | 'poll' | 'event' | 'request' | 'my_posts' | 'flagged'>('all');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);

  const [topLevelCommentTexts, setTopLevelCommentTexts] = useState<Record<string, string>>({});
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [isFlaggingDialogOpen, setIsFlaggingDialogOpen] = useState(false);
  const [postToFlag, setPostToFlag] = useState<CommunityPost | null>(null);
  const [flagReason, setFlagReason] = useState<string | null>(null);
  const flagReasons = ["Spam", "Inappropriate Content", "Harassment", "Misinformation", "Other"];

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      tags: '',
      type: 'text',
      imageUrl: '',
      pollOptions: [{ option: '', votes: 0 }, { option: '', votes: 0 }],
      attendees: 0,
      capacity: 0,
    }
  });

  const postType = watch("type");

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const [fetchedPosts, fetchedUsers] = await Promise.all([
      getCommunityPosts(currentUser.tenantId, currentUser.id),
      getUsers()
    ]);
    setPosts(fetchedPosts);
    setAllUsers(fetchedUsers);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mostActiveUsers = useMemo(() => {
    if (!allUsers.length || !currentUser) return [];
    return [...allUsers]
      .filter(user => user.xpPoints && user.xpPoints > 0 && user.status === 'active' && (currentUser.role === 'admin' || user.tenantId === currentUser.tenantId || user.tenantId === 'platform'))
      .sort((a, b) => (b.xpPoints || 0) - (a.xpPoints || 0))
      .slice(0, 5);
  }, [allUsers, currentUser]);

  const handleFormSubmit = async (data: PostFormData) => {
    if (!currentUser) {
      return;
    }

    let pollOptionsFinal = undefined;
    if (data.type === 'poll' && data.pollOptions) {
        pollOptionsFinal = data.pollOptions.filter(opt => opt.option.trim() !== '').map(opt => ({ option: opt.option.trim(), votes: 0 }));
        if (pollOptionsFinal.length < 2) {
            toast({ title: "Poll Error", description: "Polls must have at least two valid options.", variant: "destructive" });
            return;
        }
    }

    if (editingPost) {
      const updatedPostData: Partial<CommunityPost> = {
        content: data.content,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        type: data.type,
        imageUrl: data.type === 'text' ? (data.imageUrl || undefined) : undefined,
        pollOptions: data.type === 'poll' ? pollOptionsFinal : undefined,
        eventDate: data.type === 'event' ? data.eventDate : undefined,
        eventLocation: data.type === 'event' ? data.eventLocation : undefined,
        eventTitle: data.type === 'event' ? data.eventTitle : undefined,
        attendees: data.type === 'event' ? (data.attendees || 0) : undefined,
        capacity: data.type === 'event' ? (data.capacity || 0) : undefined,
      };

      const updatedPost = await updateCommunityPost(editingPost.id, updatedPostData);

      if (updatedPost) {
        setPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p));
        toast({ title: "Post Updated", description: "Your post has been updated." });
      } else {
        toast({ title: "Error", description: "Failed to update post.", variant: "destructive" });
      }
    } else {
      const newPostData: Omit<CommunityPost, 'id' | 'timestamp' | 'comments' | 'bookmarkedBy' | 'votedBy' | 'registeredBy' | 'flaggedBy' | 'likes' | 'likedBy'> = {
        tenantId: currentUser.tenantId || 'platform',
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.profilePictureUrl,
        content: data.content,
        type: data.type,
        imageUrl: data.type === 'text' ? (data.imageUrl || undefined) : undefined,
        pollOptions: data.type === 'poll' ? pollOptionsFinal : undefined,
        eventDate: data.type === 'event' ? data.eventDate : undefined,
        eventLocation: data.type === 'event' ? data.eventLocation : undefined,
        eventTitle: data.type === 'event' ? data.eventTitle : undefined,
        attendees: data.type === 'event' ? (data.attendees || 0) : undefined,
        capacity: data.type === 'event' ? (data.capacity || 0) : undefined,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        moderationStatus: 'visible' as const,
        flagCount: 0,
        status: data.type === 'request' ? 'open' as const : undefined,
      };

      const newPost = await createCommunityPost(newPostData);
      
      if (newPost) {
        setPosts(prev => [newPost, ...prev]);
        toast({ title: "Post Created", description: "Your post has been added to the feed." });
      } else {
        toast({ title: "Error", description: "Failed to create post.", variant: "destructive" });
      }
    }
    setIsPostDialogOpen(false);
    reset({ content: '', tags: '', type: 'text', imageUrl: '', pollOptions: [{ option: '', votes: 0 }, { option: '', votes: 0 }], attendees: 0, capacity: 0 });
    setEditingPost(null);
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingToCommentId(commentId);
    setReplyText(`@${userName} `);
  };

  const handleCommentSubmit = async (postId: string, text: string, parentId?: string) => {
    if (!text.trim() || !currentUser) {
      toast({ title: "Empty Comment", description: "Cannot submit an empty comment.", variant: "destructive" });
      return;
    }
    const newCommentData = {
      postId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePictureUrl,
      comment: text.trim(),
      parentId: parentId,
    };

    const newComment = await addCommentToPost(newCommentData);
    if (newComment) {
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      ));
      toast({ title: "Comment Added", description: "Your comment has been posted." });
      if (parentId) {
        setReplyText('');
        setReplyingToCommentId(null);
      } else {
        setTopLevelCommentTexts(prev => ({...prev, [postId]: ''}));
      }
    } else {
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" });
    }
  };
  
  const handleVote = async (postId: string, optionIndex: number) => {
    if (!currentUser) return;
    const updatedPost = await togglePollVote(postId, optionIndex, currentUser.id);
    if (updatedPost) {
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      toast({ title: updatedPost.message });
    } else {
      toast({ title: "Error", description: "Could not process vote.", variant: "destructive" });
    }
  };

  const handleAssign = async (postId: string, userName: string) => {
    if (!currentUser) return;
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate?.type !== 'request' || postToUpdate.assignedTo) {
      toast({ title: "Already Assigned", description: "This request is already assigned to someone." });
      return;
    }

    const updatedPost = await updateCommunityPost(postId, { assignedTo: userName, status: 'in progress' });
    if (updatedPost) {
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      
      const newAppointmentData = {
          tenantId: postToUpdate.tenantId,
          requesterUserId: postToUpdate.userId,
          alumniUserId: currentUser.id,
          title: `Assigned Request: ${postToUpdate.content?.substring(0, 30)}...`,
          dateTime: new Date().toISOString(),
          withUser: postToUpdate.userName,
          status: 'Confirmed' as AppointmentStatus,
          notes: `Taken from community request: "${postToUpdate.content}"`,
          costInCoins: 0,
      };
      
      toast({ title: "Request Assigned & Appointment Created", description: "You've been assigned, and an appointment placeholder has been added to your 'Appointments' page." });
    }
  };
  
  const handleRegisterForEvent = async (postId: string) => {
    if (!currentUser) return;
    const updatedPost = await toggleEventRegistration(postId, currentUser.id);
    if (updatedPost) {
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      toast({ title: updatedPost.message });
    } else {
      toast({ title: "Error", description: "Could not process registration.", variant: "destructive" });
    }
  };


  const openNewPostDialog = () => {
    setEditingPost(null);
    reset({ content: '', tags: '', type: 'text', imageUrl: '', pollOptions: [{ option: '', votes: 0 }, { option: '', votes: 0 }], attendees: 0, capacity: 0 });
    setIsPostDialogOpen(true);
  };

  const openEditPostDialog = (post: CommunityPost) => {
    setEditingPost(post);
    setValue('content', post.content || '');
    setValue('tags', post.tags?.join(', ') || '');
    setValue('type', post.type);
    if (post.type === 'text') setValue('imageUrl', post.imageUrl || '');
    if (post.type === 'poll') setValue('pollOptions', post.pollOptions || [{ option: '', votes: 0 }, { option: '', votes: 0 }]);
    if (post.type === 'event') {
      setValue('eventDate', post.eventDate);
      setValue('eventLocation', post.eventLocation);
      setValue('eventTitle', post.eventTitle);
      setValue('attendees', post.attendees || 0);
      setValue('capacity', post.capacity || 0);
    }
    setIsPostDialogOpen(true);
  };
  
  const openFlagDialog = (post: CommunityPost) => {
    setPostToFlag(post);
    setFlagReason(null);
    setIsFlaggingDialogOpen(true);
  };

  const handleConfirmFlagPost = async () => {
    if (!postToFlag || !currentUser || !flagReason) {
      toast({ title: "Error", description: "Please select a reason for flagging.", variant: "destructive"});
      return;
    }

    const updatedPost = await toggleFlagPost(postToFlag.id, currentUser.id, flagReason);
    if (updatedPost) {
        setPosts(prev => prev.map(p => p.id === postToFlag.id ? updatedPost : p));
        toast({ title: updatedPost.message });
    } else {
        toast({ title: "Error", description: "Failed to update flag status.", variant: "destructive" });
    }
    setIsFlaggingDialogOpen(false);
    setPostToFlag(null);
  };

  const handleApprovePost = async (postId: string) => {
    const updatedPost = await updateCommunityPost(postId, { moderationStatus: 'visible', flagCount: 0, flagReasons: [] });
    if(updatedPost) {
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        toast({ title: "Post Approved", description: "The post is now visible." });
    }
  };

  const handleRemovePost = async (postId: string) => {
    const updatedPost = await updateCommunityPost(postId, { moderationStatus: 'removed' });
    if(updatedPost) {
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        toast({ title: "Post Removed", description: "The post has been removed.", variant: "destructive" });
    }
  };
  
  const handleLikeClick = async (postId: string) => {
    if (!currentUser) return;
    const updatedPost = await toggleLikePost(postId, currentUser.id);
    if (updatedPost) {
      setPosts(prevPosts => prevPosts.map(p => p.id === postId ? updatedPost : p));
    } else {
      toast({ title: "Error", description: "Could not update like.", variant: "destructive" });
    }
  };

  const filteredPosts = useMemo(() => {
    if (!currentUser) return [];
    const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';
    
    return posts.filter(post => {
      const isVisibleForTenant = currentUser.role === 'admin' || post.tenantId === 'platform' || post.tenantId === currentUser.tenantId;
      if (!isVisibleForTenant) return false;

      const isRemoved = post.moderationStatus === 'removed';
      const isFlagged = post.moderationStatus === 'flagged' && (post.flagCount || 0) >= 5;

      if (isRemoved && !isAdminOrManager) return false;
      if (isFlagged && !isAdminOrManager) return false;

      if (filter === 'all') return true;
      if (filter === 'my_posts') return post.userId === currentUser.id;
      if (filter === 'flagged') {
          if(isAdminOrManager) return post.moderationStatus === 'flagged';
          return false;
      }
      return post.type === filter;
    });
  }, [posts, filter, currentUser]);
  
   if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Feed</h1>
         <Button onClick={openNewPostDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Post
        </Button>
      </div>

      <Dialog open={isPostDialogOpen} onOpenChange={(isOpen) => {
        setIsPostDialogOpen(isOpen);
        if (!isOpen) {
          reset({ content: '', tags: '', type: 'text', imageUrl: '', pollOptions: [{ option: '', votes: 0 }, { option: '', votes: 0 }], attendees: 0, capacity: 0 });
          setEditingPost(null);
        }
      }}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-primary"/>{editingPost ? "Edit Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="post-content">What's on your mind?</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="post-content"
                    {...field}
                    placeholder="Share updates, ask questions, or start a discussion..."
                    rows={4}
                  />
                )}
              />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="post-tags">Tags (comma-separated)</Label>
                 <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="post-tags"
                        {...field}
                        placeholder="e.g., jobsearch, frontend, advice"
                      />
                    )}
                  />
              </div>
              <div>
                <Label htmlFor="post-type">Post Type</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="post-type">
                        <SelectValue placeholder="Select post type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Post</SelectItem>
                        <SelectItem value="poll">Poll</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="request">Request</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
             {postType === 'text' && (
                <div>
                    <Label htmlFor="post-imageUrl" className="flex items-center gap-1"><ImageIconLucide className="h-4 w-4 text-muted-foreground"/>Image URL (Optional)</Label>
                    <Controller name="imageUrl" control={control} render={({ field }) => <Input id="post-imageUrl" {...field} placeholder="https://example.com/image.png" />} />
                    {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
                </div>
            )}
             {postType === 'poll' && (
                <div className="space-y-2">
                  <Label>Poll Options</Label>
                  {(watch("pollOptions") || []).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                       <Controller
                         name={`pollOptions.${index}.option` as any}
                         control={control}
                         render={({ field }) => <Input {...field} placeholder={`Option ${index + 1}`} />}
                       />
                       {index > 1 && (
                         <Button type="button" variant="ghost" size="icon" onClick={() => {
                             const currentOptions = watch("pollOptions") || [];
                             setValue("pollOptions", currentOptions.filter((_, i) => i !== index));
                         }}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                       )}
                    </div>
                  ))}
                  {errors.pollOptions && <p className="text-sm text-destructive mt-1">{errors.pollOptions.message}</p>}
                  {(watch("pollOptions") || []).length < 6 && (
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => {
                        const currentOptions = watch("pollOptions") || [];
                        setValue("pollOptions", [...currentOptions, { option: '', votes: 0 }]);
                    }}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Option
                    </Button>
                  )}
                </div>
              )}
              {postType === 'event' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title *</Label>
                    <Controller name="eventTitle" control={control} render={({ field }) => <Input id="event-title" {...field} placeholder="e.g., Alumni Networking Night" />} />
                     {errors.eventTitle && <p className="text-sm text-destructive mt-1">{errors.eventTitle.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="event-date">Event Date *</Label>
                        <Controller name="eventDate" control={control} render={({ field }) => <Input id="event-date" {...field} type="datetime-local" />} />
                         {errors.eventDate && <p className="text-sm text-destructive mt-1">{errors.eventDate.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="event-location">Event Location *</Label>
                        <Controller name="eventLocation" control={control} render={({ field }) => <Input id="event-location" {...field} placeholder="e.g., Zoom, Community Hall" />} />
                        {errors.eventLocation && <p className="text-sm text-destructive mt-1">{errors.eventLocation.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor="event-attendees">Initial Attendees (Optional)</Label>
                        <Controller name="attendees" control={control} render={({ field }) => <Input id="event-attendees" {...field} type="number" placeholder="e.g., 0" />} />
                    </div>
                    <div>
                        <Label htmlFor="event-capacity">Capacity (Optional, 0 for unlimited)</Label>
                        <Controller name="capacity" control={control} render={({ field }) => <Input id="event-capacity" {...field} type="number" placeholder="e.g., 100" />} />
                    </div>
                  </div>
                </div>
              )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4" /> {editingPost ? "Save Changes" : "Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isFlaggingDialogOpen} onOpenChange={setIsFlaggingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogUIDescription>
              Please select a reason for flagging this post. This helps our moderators review it quickly.
            </DialogUIDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={flagReason || ""} onValueChange={setFlagReason}>
              {flagReasons.map(reason => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={`reason-${reason}`} />
                  <Label htmlFor={`reason-${reason}`}>{reason}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleConfirmFlagPost} disabled={!flagReason} variant="destructive">Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Recent Posts</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: 'all' | 'text' | 'poll' | 'event' | 'request' | 'my_posts' | 'flagged') => setFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter posts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="text">Text Posts</SelectItem>
                  <SelectItem value="poll">Polls</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="request">Requests</SelectItem>
                  <SelectItem value="my_posts">My Posts</SelectItem>
                  {(currentUser.role === 'admin' || currentUser.role === 'manager') && <SelectItem value="flagged">Flagged Posts</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <Card className="text-center py-12 shadow-md lg:col-span-3">
              <CardHeader>
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-2xl">No Posts Yet</CardTitle>
                <CardDescription>
                  {filter === 'all' ? "Be the first to post!" : "No posts match your current filter."}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <Card key={post.id} id={`post-${post.id}`} className={`shadow-md ${post.moderationStatus === 'flagged' ? 'border-yellow-500 border-2' : post.moderationStatus === 'removed' ? 'opacity-50 bg-secondary' : ''}`}>
                  <CardHeader className="flex flex-row items-start space-x-3 pb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.userAvatar} alt={post.userName} data-ai-hint="person face"/>
                      <AvatarFallback>{post.userName.substring(0,1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{post.userName}</p>
                      <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-x-2">
                        <span>{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</span>
                        {post.type === 'poll' && (
                          <Badge variant="outline" className="border-blue-500 text-blue-500">Poll</Badge>
                        )}
                        {post.type === 'request' && (
                          <Badge variant="outline" className="border-orange-500 text-orange-500">Request</Badge>
                        )}
                        {post.type === 'event' && (
                          <Badge variant="outline" className="border-green-500 text-green-500">Event</Badge>
                        )}
                        {post.moderationStatus === 'flagged' && (
                          <Badge variant="destructive">Flagged ({post.flagCount})</Badge>
                        )}
                        {post.moderationStatus === 'removed' && (
                          <Badge variant="secondary">Removed</Badge>
                        )}
                      </div>
                    </div>
                    {(post.userId === currentUser.id || currentUser.role === 'admin' || (currentUser.role === 'manager' && post.tenantId === currentUser.tenantId)) && post.moderationStatus !== 'removed' && (
                      <Button variant="ghost" size="icon" onClick={() => openEditPostDialog(post)} title="Edit Post">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {post.moderationStatus === 'removed' && currentUser.role !== 'admin' && !(currentUser.role === 'manager' && post.tenantId === currentUser.tenantId) ? (
                        <p className="text-sm text-muted-foreground italic">This post has been removed by a moderator.</p>
                    ) : (
                      <>
                        {post.content && <p className="text-sm text-foreground whitespace-pre-line mb-3">{renderWithMentions(post.content)}</p>}
                        
                        {post.type === 'text' && post.imageUrl && (
                            <div className="mt-3 rounded-lg overflow-hidden border aspect-video relative max-h-[400px]">
                                <Image src={post.imageUrl} alt={"Community post image"} layout="fill" objectFit="cover" data-ai-hint={"community image"} />
                            </div>
                        )}

                        {post.type === 'poll' && post.pollOptions && (
                          <div className="mt-2 space-y-2">
                            {post.pollOptions.map((option, index) => (
                              <Button
                                key={index}
                                variant={post.votedBy?.includes(`${currentUser.id}-${index}`) ? 'default' : 'outline'}
                                className="w-full justify-start"
                                onClick={() => handleVote(post.id, index)}
                              >
                                {option.option} ({option.votes})
                              </Button>
                            ))}
                          </div>
                        )}
                        {post.type === 'event' && (
                          <div className="border rounded-md p-3 space-y-1 bg-secondary/30 mt-2">
                            <p className="text-md font-semibold text-primary">{post.eventTitle || 'Event Details'}</p>
                            {post.eventDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(post.eventDate).toLocaleString()}</p>}
                            {post.eventLocation && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/> {post.eventLocation}</p>}
                            {post.capacity !== undefined && post.capacity > 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <UsersIcon className="h-3 w-3" />
                                {Math.max(0, post.capacity - (post.attendees || 0))} seats available ({post.attendees || 0}/{post.capacity})
                              </p>
                            )}
                             {post.capacity !== undefined && post.capacity === 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><UsersIcon className="h-3 w-3" /> Unlimited spots</p>
                             )}
                            {post.eventDate && dateIsFuture(new Date(post.eventDate)) && ((post.attendees || 0) < (post.capacity || Infinity) || post.capacity === 0) && (
                               <Button variant="outline" size="sm" className={cn("mt-2", post.registeredBy?.includes(currentUser.id) ? "bg-primary/20" : "text-primary border-primary hover:bg-primary/10")} onClick={() => handleRegisterForEvent(post.id)}>
                                <Ticket className="mr-1 h-4 w-4"/> {post.registeredBy?.includes(currentUser.id) ? "Unregister" : "Register Now"}
                              </Button>
                            )}
                             {post.eventDate && dateIsFuture(new Date(post.eventDate)) && (post.attendees || 0) >= (post.capacity || 0) && post.capacity !== 0 && (
                              <Badge variant="destructive">Event Full</Badge>
                            )}
                          </div>
                        )}
                        {post.type === 'request' && (
                          <div className='mt-2'>
                              {!post.assignedTo && post.status !== 'completed' && (
                                <Button variant="outline" size="sm" className="mt-2 text-green-600 border-green-500 hover:bg-green-50" onClick={() => handleAssign(post.id, currentUser.name)}>
                                  <CheckCircleIcon className="mr-1 h-4 w-4"/> Assign to Me
                                </Button>
                              )}
                            {post.assignedTo && post.status === 'in progress' && <p className="text-xs text-muted-foreground mt-2">Assigned to: <strong>{post.assignedTo}</strong></p>}
                            {post.status && <Badge variant={post.status === 'completed' ? 'default' : post.status === 'in progress' ? 'secondary' : 'outline'} className={post.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' : post.status === 'in progress' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}>{post.status}</Badge>}
                          </div>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                              <Badge key={tag} variant="secondary">#{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                  {post.moderationStatus !== 'removed' && (
                    <CardFooter className="border-t pt-3 flex flex-col items-start">
                        <div className="flex items-center justify-start space-x-1 w-full">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs" onClick={() => handleLikeClick(post.id)}>
                                <ThumbsUp className={cn("mr-1 h-3.5 w-3.5", post.likedBy?.includes(currentUser.id) && "fill-current text-primary")} /> Like ({(post.likes || 0)})
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs" onClick={() => {
                              setTopLevelCommentTexts(prev => ({...prev, [post.id]: ''})); // Clear on focus
                              setReplyingToCommentId(`post-${post.id}`);
                            }}>
                            <MessageIcon className="mr-1 h-3.5 w-3.5" /> Comment ({post.comments?.length || 0})
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs">
                            <Share2 className="mr-1 h-3.5 w-3.5" /> Share
                            </Button>

                            {(currentUser.role === 'admin' || (currentUser.role === 'manager' && post.tenantId === currentUser.tenantId)) ? (
                            <>
                                {post.moderationStatus === 'flagged' && (
                                <Button variant="outline" size="xs" onClick={() => handleApprovePost(post.id)} className="text-green-600 border-green-500 hover:bg-green-50 ml-auto h-7 px-2 py-1">
                                    <ShieldCheck className="mr-1 h-3 w-3" /> Approve
                                </Button>
                                )}
                                <Button variant="destructive" size="xs" onClick={() => handleRemovePost(post.id)} className={`${post.moderationStatus === 'flagged' ? 'ml-1' : 'ml-auto'} h-7 px-2 py-1`}>
                                    <Trash2 className="mr-1 h-3 w-3" /> Remove
                                </Button>
                            </>
                            ) : (
                            post.userId !== currentUser.id && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => openFlagDialog(post)}
                                  className="text-yellow-600 hover:text-yellow-700 ml-auto h-7 px-2 py-1"
                                >
                                  <Flag className="mr-1 h-3 w-3" />
                                  Flag
                                </Button>
                            )
                            )}
                        </div>
                        <div className="w-full mt-3 pt-3 border-t space-y-3">
                          <ScrollArea className="max-h-48 pr-2">
                              <div className="space-y-2.5">
                              {post.comments?.filter(c => !c.parentId).map(comment => (
                                  <CommentThread 
                                    key={comment.id} 
                                    comment={comment} 
                                    allComments={post.comments!} 
                                    onReply={handleReply} 
                                    onCommentSubmit={handleCommentSubmit} 
                                    level={0}
                                    replyingToCommentId={replyingToCommentId}
                                    replyText={replyText}
                                    onReplyTextChange={setReplyText}
                                    currentUser={currentUser}
                                  />
                              ))}
                              </div>
                          </ScrollArea>
                          {(!post.comments || post.comments.length === 0) && <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>}

                          {replyingToCommentId === `post-${post.id}` && (
                            <div className="flex items-center gap-2 pt-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.name} data-ai-hint="person face"/>
                                <AvatarFallback>{currentUser.name.substring(0,1)}</AvatarFallback>
                              </Avatar>
                              <Textarea
                                placeholder="Write a comment..."
                                value={topLevelCommentTexts[post.id] || ''}
                                onChange={(e) => setTopLevelCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                rows={1}
                                className="flex-1 min-h-[40px] text-sm"
                              />
                              <Button size="sm" onClick={() => handleCommentSubmit(post.id, topLevelCommentTexts[post.id] || '')} disabled={!topLevelCommentTexts[post.id]?.trim()}>
                                <Send className="h-4 w-4"/>
                              </Button>
                            </div>
                          )}
                        </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
        <aside className="lg:col-span-1 space-y-6 hidden lg:block">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Most Active Users</CardTitle>
              <CardDescription>Top contributors in the community.</CardDescription>
            </CardHeader>
            <CardContent>
              {mostActiveUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No active users to display yet.</p>
              ) : (
                <ul className="space-y-3">
                  {mostActiveUsers.map(user => (
                    <li key={user.id} className="flex items-center gap-3 p-2 hover:bg-secondary/30 rounded-md">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profilePictureUrl} alt={user.name} data-ai-hint="person face"/>
                        <AvatarFallback>{user.name.substring(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <StarIcon className="h-3 w-3 text-yellow-500"/> {user.xpPoints || 0} XP
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter>
                <Button variant="link" size="sm" asChild className="text-xs p-0">
                    <Link href="/gamification">View Full Leaderboard</Link>
                </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </>
  );
}

```