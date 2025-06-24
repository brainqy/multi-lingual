
"use client";

import { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PromotionalContent } from '@/types';
import { samplePromotionalContent } from '@/lib/sample-data';
import AccessDeniedMessage from '@/components/ui/AccessDeniedMessage';
import { sampleUserProfile } from '@/lib/sample-data';
import Image from 'next/image';

const promoSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  imageUrl: z.string().url("Must be a valid URL"),
  imageAlt: z.string().min(5, "Alt text is required for accessibility"),
  imageHint: z.string().optional(),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().url("Must be a valid URL (use '#' for no action)"),
  isActive: z.boolean(),
});
type PromoFormData = z.infer<typeof promoSchema>;

export default function PromotionalContentPage() {
  const [content, setContent] = useState<PromotionalContent>(samplePromotionalContent);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const { control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<PromoFormData>({
    resolver: zodResolver(promoSchema),
    defaultValues: content
  });

  const watchedImageUrl = watch("imageUrl");

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const onSubmit = (data: PromoFormData) => {
    // In a real app, this would be an API call. For this demo, we mutate the sample data object.
    Object.assign(samplePromotionalContent, data);
    setContent({...samplePromotionalContent}); // Update local state to re-render if needed
    reset(data); // Resets the dirty state of the form
    toast({
      title: "Content Updated",
      description: "The promotional content has been saved successfully.",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Megaphone className="h-8 w-8 text-primary" />
        Promotional Content Management
      </h1>
      <CardDescription>
        Edit the content of the promotional spotlight card shown on user dashboards.
      </CardDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} rows={4} />} />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                </div>
                <div>
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Controller name="buttonText" control={control} render={({ field }) => <Input id="buttonText" {...field} />} />
                  {errors.buttonText && <p className="text-sm text-destructive mt-1">{errors.buttonText.message}</p>}
                </div>
                <div>
                  <Label htmlFor="buttonLink">Button Link URL</Label>
                  <Controller name="buttonLink" control={control} render={({ field }) => <Input id="buttonLink" {...field} placeholder="e.g., https://example.com/premium"/>} />
                  {errors.buttonLink && <p className="text-sm text-destructive mt-1">{errors.buttonLink.message}</p>}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Image Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Controller name="imageUrl" control={control} render={({ field }) => <Input id="imageUrl" {...field} />} />
                  {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
                </div>
                <div>
                  <Label htmlFor="imageAlt">Image Alt Text (for accessibility)</Label>
                  <Controller name="imageAlt" control={control} render={({ field }) => <Input id="imageAlt" {...field} />} />
                  {errors.imageAlt && <p className="text-sm text-destructive mt-1">{errors.imageAlt.message}</p>}
                </div>
                <div>
                  <Label htmlFor="imageHint">AI Image Hint (Optional)</Label>
                  <Controller name="imageHint" control={control} render={({ field }) => <Input id="imageHint" {...field} placeholder="e.g., person working"/>} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader><CardTitle>Activation</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Controller name="isActive" control={control} render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />} />
                  <Label htmlFor="isActive">Show on Dashboard</Label>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
                <CardContent>
                    <div className="p-4 bg-gradient-to-r from-primary/80 via-primary to-accent/80 text-primary-foreground rounded-lg">
                        <h3 className="font-bold text-lg">{watch("title")}</h3>
                        <p className="text-xs opacity-90 mt-1">{watch("description")}</p>
                        <div className="mt-4">
                            {watchedImageUrl && !errors.imageUrl && (
                                <Image src={watchedImageUrl} alt={watch("imageAlt")} width={150} height={100} className="rounded shadow-md object-cover"/>
                            )}
                        </div>
                        <Button variant="secondary" size="sm" className="mt-4">{watch("buttonText")}</Button>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
         <div className="mt-8 flex justify-end">
            <Button type="submit" disabled={!isDirty} size="lg">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
      </form>
    </div>
  );
}
