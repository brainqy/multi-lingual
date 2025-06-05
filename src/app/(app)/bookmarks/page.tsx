"use client";

import { useState } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { sampleCommunityPosts, sampleBlogPosts, sampleInterviewQuestions, sampleResumeScanHistory, sampleUserProfile } from "@/lib/sample-data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { MessageSquare, BookOpen, HelpCircle, FileText } from "lucide-react";

export default function BookmarksPage() {
  const { t } = useI18n();
  const userId = sampleUserProfile.id;
  const [filter, setFilter] = useState<"all" | "posts" | "blogs" | "questions" | "resumeScans">("all");

  // Filter bookmarked items for the current user
  const bookmarkedPosts = sampleCommunityPosts.filter(post => post.bookmarkedBy?.includes(userId));
  const bookmarkedBlogs = sampleBlogPosts.filter(blog => blog.bookmarkedBy?.includes(userId));
  const bookmarkedQuestions = sampleInterviewQuestions.filter(q => q.bookmarkedBy?.includes(userId));
  const bookmarkedResumeScans = sampleResumeScanHistory.filter(scan => scan.bookmarked);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
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
            <CardTitle><MessageSquare className="inline mr-2" />{t("bookmarks.posts", "Bookmarked Community Posts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedPosts.length === 0 ? (
              <CardDescription>{t("bookmarks.noPosts", "No bookmarked posts yet.")}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedPosts.map(post => (
                  <li key={post.id}>
                    <Link href={`/community-feed#post-${post.id}`} className="text-primary hover:underline">
                      {post.content.slice(0, 60)}...
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
            <CardTitle><BookOpen className="inline mr-2" />{t("bookmarks.blogs", "Bookmarked Blog Posts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedBlogs.length === 0 ? (
              <CardDescription>{t("bookmarks.noBlogs", "No bookmarked blogs yet.")}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedBlogs.map(blog => (
                  <li key={blog.id}>
                    <Link href={`/blog/${blog.slug}`} className="text-primary hover:underline">
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
            <CardTitle><HelpCircle className="inline mr-2" />{t("bookmarks.questions", "Bookmarked Interview Questions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedQuestions.length === 0 ? (
              <CardDescription>{t("bookmarks.noQuestions", "No bookmarked questions yet.")}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedQuestions.map(q => (
                  <li key={q.id}>
                    <span className="font-medium">{q.questionText.slice(0, 60)}...</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {(filter === "all" || filter === "resumeScans") && (
        <Card>
          <CardHeader>
            <CardTitle><FileText className="inline mr-2" />{t("bookmarks.resumeScans", "Bookmarked Resume Scans")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedResumeScans.length === 0 ? (
              <CardDescription>{t("bookmarks.noResumeScans", "No bookmarked resume scans yet.")}</CardDescription>
            ) : (
              <ul className="space-y-2">
                {bookmarkedResumeScans.map(scan => (
                  <li key={scan.id}>
                    <span className="font-medium">{scan.resumeName} - {scan.jobTitle} @ {scan.companyName}</span>
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