
"use client";

import { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { sampleCommunityPosts, sampleBlogPosts, sampleInterviewQuestions, sampleResumeScanHistory, sampleUserProfile } from "@/lib/sample-data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { MessageSquare, BookOpen, HelpCircle, FileText, Bookmark, Star, Trash2, Users, Settings2, Code, Brain, Puzzle, Lightbulb, CheckCircle as CheckCircleIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { InterviewQuestion, InterviewQuestionCategory } from "@/types";

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function BookmarksPage() {
  const { t } = useI18n();
  const userId = sampleUserProfile.id;
  const { toast } = useToast();
  
  const [filter, setFilter] = useState<"all" | "posts" | "blogs" | "questions" | "resumeScans">("all");

  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => sampleCommunityPosts.filter(post => post.bookmarkedBy?.includes(userId)));
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState(() => sampleBlogPosts.filter(blog => blog.bookmarkedBy?.includes(userId)));
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(() => sampleInterviewQuestions.filter(q => q.bookmarkedBy?.includes(userId)));
  const [bookmarkedResumeScans, setBookmarkedResumeScans] = useState(() => sampleResumeScanHistory.filter(scan => scan.bookmarked));

  const handleUnbookmarkQuestion = (questionId: string) => {
    setBookmarkedQuestions(prev => prev.filter(q => q.id !== questionId));
    // In a real app, this would be an API call. For demo, we update global sample data.
    const questionIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      const userIndex = sampleInterviewQuestions[questionIndex].bookmarkedBy?.indexOf(userId);
      if (userIndex !== undefined && userIndex > -1) {
        sampleInterviewQuestions[questionIndex].bookmarkedBy?.splice(userIndex, 1);
      }
    }
    toast({ title: "Bookmark Removed", description: "Question has been removed from your bookmarks." });
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


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("bookmarks.title", "My Bookmarks")}</h1>
        <div className="w-full sm:w-56">
          <Select value={filter} onValueChange={v => setFilter(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder={t("bookmarks.filter", "Filter by type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("bookmarks.all", "All Types")}</SelectItem>
              <SelectItem value="posts">{t("bookmarks.posts", "Community Posts")}</SelectItem>
              <SelectItem value="blogs">{t("bookmarks.blogs", "Blog Posts")}</SelectItem>
              <SelectItem value="questions">{t("bookmarks.questions", "Interview Questions")}</SelectItem>
              <SelectItem value="resumeScans">{t("bookmarks.resumeScans", "Resume Scans")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(filter === "all" || filter === "posts") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />{t("bookmarks.posts", "Bookmarked Community Posts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedPosts.length === 0 ? (
              <CardDescription>{t("bookmarks.noPosts", "No bookmarked posts yet.")}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedPosts.map(post => (
                  <li key={post.id}>
                    <Link href={`/community-feed#post-${post.id}`} className="text-sm text-primary hover:underline">
                      {post.content ? post.content.slice(0, 80) : "Post"}...
                    </Link>
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
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />{t("bookmarks.blogs", "Bookmarked Blog Posts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedBlogs.length === 0 ? (
              <CardDescription>{t("bookmarks.noBlogs", "No bookmarked blogs yet.")}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedBlogs.map(blog => (
                  <li key={blog.id}>
                    <Link href={`/blog/${blog.slug}`} className="text-sm text-primary hover:underline">
                      {blog.title}
                    </Link>
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
            <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" />{t("bookmarks.questions", "Bookmarked Interview Questions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedQuestions.length === 0 ? (
              <CardDescription>{t("bookmarks.noQuestions", "No bookmarked questions yet.")}</CardDescription>
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
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{t("bookmarks.resumeScans", "Bookmarked Resume Scans")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedResumeScans.length === 0 ? (
              <CardDescription>{t("bookmarks.noResumeScans", "No bookmarked resume scans yet.")}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedResumeScans.map(scan => (
                  <li key={scan.id}>
                    <Link href={`/resume-analyzer?scanId=${scan.id}`} className="text-sm text-primary hover:underline">
                      Scan: {scan.resumeName} vs {scan.jobTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
