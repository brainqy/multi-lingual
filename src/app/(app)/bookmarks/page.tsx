
"use client";

import { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { MessageSquare, BookOpen, HelpCircle, FileText, Bookmark, Star, Trash2, Users, Settings2, Code, Brain, Puzzle, Lightbulb, CheckCircle as CheckCircleIcon, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { InterviewQuestion, InterviewQuestionCategory } from "@/types";
import { format, parseISO } from "date-fns";
import ScoreCircle from '@/components/ui/score-circle';
import { useAuth } from "@/hooks/use-auth";
import { getCommunityPosts } from "@/lib/actions/community";
import { getBlogPosts } from "@/lib/actions/blog";
import { getInterviewQuestions } from "@/lib/actions/questions";
import { getScanHistory } from "@/lib/actions/resumes";

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function BookmarksPage() {
  const { t } = useI18n();
  const { user, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState<"all" | "posts" | "blogs" | "questions" | "resumeScans">("all");

  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<any[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<InterviewQuestion[]>([]);
  const [bookmarkedResumeScans, setBookmarkedResumeScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      if (!user) return;
      setIsLoading(true);
      const [posts, blogs, questions, scans] = await Promise.all([
        getCommunityPosts(user.tenantId, user.id),
        getBlogPosts(),
        getInterviewQuestions(),
        getScanHistory(user.id)
      ]);

      setBookmarkedPosts(posts.filter(p => p.bookmarkedBy?.includes(user.id)));
      setBookmarkedBlogs(blogs.filter(b => b.bookmarkedBy?.includes(user.id)));
      setBookmarkedQuestions(questions.filter(q => q.bookmarkedBy?.includes(user.id)));
      setBookmarkedResumeScans(scans.filter(s => s.bookmarked));
      setIsLoading(false);
    }
    loadBookmarks();
  }, [user]);
  

  const handleUnbookmarkPost = (postId: string) => {
    // This would be an API call in a real app
    setBookmarkedPosts(prev => prev.filter(p => p.id !== postId));
    toast({ title: "Bookmark Removed", description: "Post has been removed from your bookmarks." });
  };
  
  const handleUnbookmarkBlog = (blogId: string) => {
    setBookmarkedBlogs(prev => prev.filter(b => b.id !== blogId));
    toast({ title: "Bookmark Removed", description: "Blog post has been removed from your bookmarks." });
  };

  const handleUnbookmarkQuestion = (questionId: string) => {
    // This would be an API call
    setBookmarkedQuestions(prev => prev.filter(q => q.id !== questionId));
    toast({ title: "Bookmark Removed", description: "Question has been removed from your bookmarks." });
  };
  
  const handleUnbookmarkScan = (scanId: string) => {
    // This would be an API call
    setBookmarkedResumeScans(prev => prev.filter(s => s.id !== scanId));
    toast({ title: "Bookmark Removed", description: "Resume scan has been removed from your bookmarks." });
  };

  const getCategoryIcon = (category: InterviewQuestionCategory) => {
    switch(category) {
      case 'Behavioral': return <Users className="h-4 w-4 text-purple-500 flex-shrink-0"/>;
      case 'Technical': return <Settings2 className="h-4 w-4 text-orange-500 flex-shrink-0"/>;
      case 'Coding': return <Code className="h-4 w-4 text-sky-500 flex-shrink-0"/>;
      case 'Role-Specific': return <Brain className="h-4 w-4 text-indigo-500 flex-shrink-0"/>;
      case 'Analytical': return <Puzzle className="h-4 w-4 text-teal-500 flex-shrink-0"/>;
      case 'HR': return <Lightbulb className="h-4 w-4 text-pink-500 flex-shrink-0"/>;
      case 'Common': return <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0"/>;
      default: return <Puzzle className="h-4 w-4 text-gray-400 flex-shrink-0"/>; 
    }
  };

  if (isUserLoading || isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("bookmarks.title", { default: "My Bookmarks" })}</h1>
        <div className="w-full sm:w-56">
          <Select value={filter} onValueChange={v => setFilter(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder={t("bookmarks.filter", { default: "Filter bookmarks" })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bookmarks.all", { default: "All Bookmarks" })}</SelectItem>
              <SelectItem value="posts">{t("bookmarks.posts", { default: "Community Posts" })}</SelectItem>
              <SelectItem value="blogs">{t("bookmarks.blogs", { default: "Blog Posts" })}</SelectItem>
              <SelectItem value="questions">{t("bookmarks.questions", { default: "Interview Questions" })}</SelectItem>
              <SelectItem value="resumeScans">{t("bookmarks.resumeScans", { default: "Resume Scans" })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(filter === "all" || filter === "posts") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />{t("bookmarks.posts", { default: "Community Posts" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedPosts.length === 0 ? (
              <CardDescription>{t("bookmarks.noPosts", { default: "You haven't bookmarked any community posts yet." })}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedPosts.map(post => (
                  <li key={post.id} className="flex justify-between items-center p-2 hover:bg-secondary/30 rounded-md">
                    <Link href={`/community-feed#post-${post.id}`} className="text-sm text-primary hover:underline flex-1 truncate pr-2">
                      {post.content ? post.content.slice(0, 80) : "Post"}...
                    </Link>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleUnbookmarkPost(post.id)} title="Remove bookmark">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {(filter === "all" || filter === "blogs") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />{t("bookmarks.blogs", { default: "Blog Posts" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedBlogs.length === 0 ? (
              <CardDescription>{t("bookmarks.noBlogs", { default: "You haven't bookmarked any blog articles yet." })}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedBlogs.map(blog => (
                  <li key={blog.id} className="flex justify-between items-center p-2 hover:bg-secondary/30 rounded-md">
                    <Link href={`/blog/${blog.slug}`} className="text-sm text-primary hover:underline flex-1 truncate pr-2">
                      {blog.title}
                    </Link>
                     <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleUnbookmarkBlog(blog.id)} title="Remove bookmark">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {(filter === "all" || filter === "questions") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" />{t("bookmarks.questions", { default: "Interview Questions" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedQuestions.length === 0 ? (
              <CardDescription>{t("bookmarks.noQuestions", { default: "You haven't bookmarked any interview questions yet." })}</CardDescription>
            ) : (
              <Accordion type="multiple" className="w-full space-y-2">
                {bookmarkedQuestions.map(q => (
                  <AccordionItem key={q.id} value={`item-${q.id}`} className="border rounded-md bg-card shadow-sm hover:shadow-md transition-shadow">
                    <AccordionTrigger className="px-4 py-3 text-left text-sm font-medium group hover:no-underline data-[state=open]:border-b">
                       <div className="flex items-start flex-1 gap-3 w-full">
                         <div className="flex-1 text-left">
                           <div className="flex items-center gap-2 mb-0.5">
                             {getCategoryIcon(q.category)}
                             <span className="font-medium text-foreground">{q.questionText}</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                             {q.difficulty && <Badge variant="outline" className="text-[10px] px-1 py-0">{q.difficulty}</Badge>}
                             {q.tags && q.tags.length > 0 && (<span className="mx-1 hidden sm:inline">|</span>)}
                             {q.tags?.slice(0,2).map(tag => <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 hidden sm:inline-flex">{tag}</Badge>)}
                           </div>
                         </div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1 space-y-3">
                      <div className="bg-primary/5 p-3 rounded-md">
                          <p className="text-xs font-semibold text-primary mb-1">Suggested Answer/Tip:</p>
                          <p className="text-xs text-foreground whitespace-pre-line">{q.answerOrTip}</p>
                      </div>
                      {q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && (
                          <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground">MCQ Options:</p>
                          {q.mcqOptions.filter(opt => opt && opt.trim() !== "").map((opt, i) => (
                              <p key={i} className={cn("text-xs pl-2", q.correctAnswer === opt && "font-bold text-green-600 flex items-center gap-1")}>
                              {q.correctAnswer === opt && <CheckCircleIcon className="h-3 w-3"/>} {optionLetters[i]}. {opt}
                              </p>
                          ))}
                          </div>
                      )}
                      <div className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleUnbookmarkQuestion(q.id)}>
                          <Bookmark className="mr-2 h-4 w-4" /> Remove Bookmark
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {(filter === "all" || filter === "resumeScans") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{t("bookmarks.resumeScans", { default: "Resume Scans" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedResumeScans.length === 0 ? (
              <CardDescription>{t("bookmarks.noResumeScans", { default: "You haven't bookmarked any resume scan reports yet." })}</CardDescription>
            ) : (
              <div className="space-y-3">
                {bookmarkedResumeScans.map(scan => (
                   <Card key={scan.id} className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                        <ScoreCircle score={scan.matchScore || 0} size="sm" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{scan.jobTitle} at {scan.companyName}</h4>
                            <p className="text-sm text-muted-foreground">Scanned with: {scan.resumeName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {format(parseISO(scan.scanDate), 'MMM dd, yyyy - p')}
                            </p>
                        </div>
                        <div className="flex gap-2 self-start sm:self-center">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/resume-analyzer?scanId=${scan.id}`}>View Report</Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-9 w-9" onClick={() => handleUnbookmarkScan(scan.id)} title="Remove Bookmark">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
