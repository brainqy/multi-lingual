
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Send, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleBlogPosts, sampleUserProfile } from "@/lib/sample-data";
import type { BlogPost } from "@/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/use-i18n";

const blogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  tags: z.string().optional().refine(val => !val || val.split(',').every(tag => tag.trim().length > 0), {
    message: "Tags should be comma-separated words."
  }),
  imageUrl: z.string().url("Invalid URL format").optional().or(z.literal('')),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(200, "Excerpt too long (max 200 chars)"),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

export default function CreateBlogPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;
  const router = useRouter();
  const { t } = useI18n();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
  });

  const onSubmit = (data: BlogPostFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      const newPost: BlogPost = {
        id: `blog-${Date.now()}`,
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.profilePictureUrl ?? "",
        title: data.title,
        slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        author: currentUser.name,
        date: new Date().toISOString(),
        imageUrl: data.imageUrl || "",
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        comments: [],
        bookmarkedBy: []
      };
      sampleBlogPosts.unshift(newPost);
      toast({ title: t("blog.toastCreatedTitle", { default: "Post Created!" }), description: t("blog.toastCreatedDesc", { default: "Your blog post has been published." }) });
      reset();
      setIsLoading(false);
      router.push(`/blog/${newPost.slug}`);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <BookOpen className="h-8 w-8" /> {t("blog.createNewPost", { default: "Create New Post" })}
      </h1>
      <CardDescription>{t("blog.createPageDescription", { default: "Share your knowledge and insights with the community. Write a blog post on a topic relevant to career development, networking, or your industry." })}</CardDescription>

      <Card className="shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{t("blog.newPostDetails", { default: "New Post Details" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="blog-title">{t("blog.titleLabel", { default: "Title" })} *</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="blog-title" {...field} placeholder={t("blog.titlePlaceholder", { default: "e.g., 5 Tips for a Killer Resume" })} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="blog-excerpt">{t("blog.excerptLabel", { default: "Excerpt / Short Summary" })} *</Label>
              <Controller name="excerpt" control={control} render={({ field }) => <Textarea id="blog-excerpt" {...field} rows={2} placeholder={t("blog.excerptPlaceholder", { default: "A brief, catchy summary of your post (150-200 characters)." })} />} />
              {errors.excerpt && <p className="text-sm text-destructive mt-1">{errors.excerpt.message}</p>}
            </div>
            <div>
              <Label htmlFor="blog-content">{t("blog.contentLabel", { default: "Content (Markdown Supported)" })} *</Label>
              <Controller name="content" control={control} render={({ field }) => (
                <Textarea id="blog-content" {...field} rows={10} placeholder={t("blog.contentPlaceholder", { default: "Write your full blog post here. Use Markdown for formatting like ## Headings and **bold** text." })} />
              )} />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>
            <div>
              <Label htmlFor="blog-imageUrl" className="flex items-center gap-1"><ImageIcon className="h-4 w-4 text-muted-foreground"/>{t("blog.imageUrlLabel", { default: "Feature Image URL (Optional)" })}</Label>
              <Controller name="imageUrl" control={control} render={({ field }) => <Input id="blog-imageUrl" type="url" {...field} placeholder="https://example.com/image.jpg" />} />
              {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
            </div>
            <div>
              <Label htmlFor="blog-tags">{t("blog.tagsLabel", { default: "Tags (comma-separated)" })}</Label>
              <Controller name="tags" control={control} render={({ field }) => <Input id="blog-tags" {...field} placeholder={t("blog.tagsPlaceholder", { default: "e.g., career, resume, advice" })} />} />
              {errors.tags && <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("blog.submitting", { default: "Submitting..." })}</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> {t("blog.submitPost", { default: "Submit Post" })}</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
