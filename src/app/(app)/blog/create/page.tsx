
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
import { useRouter } from "next/navigation"; // For redirecting after post creation

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

const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function CreateBlogPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;
  const router = useRouter();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
  });

  const onSubmit = (data: BlogPostFormData) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newPost: BlogPost = {
        id: `blog-${Date.now()}`,
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.profilePictureUrl,
        title: data.title,
        slug: generateSlug(data.title),
        author: currentUser.name, // User is the author
        date: new Date().toISOString(),
        imageUrl: data.imageUrl || undefined,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        comments: [],
      };
      
      sampleBlogPosts.unshift(newPost); // Add to the beginning of the array for demo

      toast({ title: "Blog Post Created!", description: "Your post has been successfully submitted." });
      reset();
      setIsLoading(false);
      router.push(`/blog/${newPost.slug}`); // Redirect to the new blog post
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <BookOpen className="h-8 w-8" /> Create New Blog Post
      </h1>
      <CardDescription>Share your insights, experiences, and knowledge with the community.</CardDescription>

      <Card className="shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>New Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="blog-title">Title *</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="blog-title" {...field} placeholder="Enter a catchy title" />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="blog-excerpt">Excerpt / Short Summary *</Label>
              <Controller name="excerpt" control={control} render={({ field }) => <Textarea id="blog-excerpt" {...field} rows={2} placeholder="A brief summary for previews (max 200 characters)" />} />
              {errors.excerpt && <p className="text-sm text-destructive mt-1">{errors.excerpt.message}</p>}
            </div>
            <div>
              <Label htmlFor="blog-content">Content *</Label>
              <Controller name="content" control={control} render={({ field }) => (
                <Textarea id="blog-content" {...field} rows={10} placeholder="Write your full blog post here... (Supports basic line breaks)" />
              )} />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>
            <div>
              <Label htmlFor="blog-imageUrl" className="flex items-center gap-1"><ImageIcon className="h-4 w-4 text-muted-foreground"/>Featured Image URL (Optional)</Label>
              <Controller name="imageUrl" control={control} render={({ field }) => <Input id="blog-imageUrl" type="url" {...field} placeholder="https://example.com/image.jpg" />} />
              {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
            </div>
            <div>
              <Label htmlFor="blog-tags">Tags (comma-separated, Optional)</Label>
              <Controller name="tags" control={control} render={({ field }) => <Input id="blog-tags" {...field} placeholder="e.g., career, tech, advice" />} />
              {errors.tags && <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Submit Post</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
