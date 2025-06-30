
"use client";

import { useState } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, CalendarDays, User, Tag, ArrowRight, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { sampleBlogPosts } from "@/lib/sample-data";
import type { BlogPost } from "@/types";
import { format, parseISO } from 'date-fns';

export default function BlogPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const allPosts = sampleBlogPosts; 

  const allTags = Array.from(new Set(allPosts.flatMap(post => post.tags || [])));

  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> {t("blog.title")}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
           <div className="relative flex-1 sm:flex-grow-0 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("blog.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("blog.filterByTag")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("blog.allTags")}</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/blog/create">
              <PlusCircle className="mr-2 h-5 w-5" /> {t("blog.createNewPost")}
            </Link>
          </Button>
        </div>
      </div>
      <CardDescription>{t("blog.pageDescription")}</CardDescription>

      {filteredPosts.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">{t("blog.noArticlesFound")}</CardTitle>
            <CardDescription>
              {t("blog.noArticlesHint")}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} passHref>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden h-full cursor-pointer">
                {post.imageUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="blog post image"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl leading-tight">
                     {post.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-1">
                     <span className="flex items-center gap-1"><User className="h-3 w-3"/> {post.author}</span>
                     <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3"/> {format(parseISO(post.date), 'MMM d, yyyy')}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="border-t pt-4 mt-auto">
                   <div className="flex flex-wrap gap-1">
                     {post.tags?.slice(0, 2).map(tag => (
                       <span key={tag} className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full flex items-center gap-1">
                         <Tag className="h-3 w-3"/>{tag}
                       </span>
                     ))}
                   </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
