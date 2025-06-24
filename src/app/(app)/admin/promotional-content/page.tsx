
"use client";

import { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, Megaphone, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PromotionalContent } from '@/types';
import { samplePromotionalContent } from '@/lib/sample-data';
import AccessDeniedMessage from '@/components/ui/AccessDeniedMessage';
import { sampleUserProfile } from '@/lib/sample-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from '@/hooks/use-i18n';

const promoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  imageUrl: z.string().url("Must be a valid URL"),
  imageAlt: z.string().min(5, "Alt text is required for accessibility"),
  imageHint: z.string().optional(),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().url("Must be a valid URL (use '#' for no action)"),
  isActive: z.boolean(),
  gradientFrom: z.string().optional(),
  gradientVia: z.string().optional(),
  gradientTo: z.string().optional(),
});
type PromoFormData = z.infer<typeof promoSchema>;

export default function PromotionalContentPage() {
  const [contentItems, setContentItems] = useState<PromotionalContent[]>(samplePromotionalContent);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<PromotionalContent | null>(null);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;
  const { t } = useI18n();

  const { control, handleSubmit, reset } = useForm<PromoFormData>({
    resolver: zodResolver(promoSchema),
  });
  
  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const openEditDialog = (content: PromotionalContent) => {
    setEditingContent(content);
    reset(content);
    setIsDialogOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingContent(null);
    reset({
      title: '',
      description: '',
      imageUrl: 'https://placehold.co/300x200.png',
      imageAlt: '',
      buttonText: 'Learn More',
      buttonLink: '#',
      isActive: false,
      gradientFrom: 'from-primary/80',
      gradientVia: 'via-primary',
      gradientTo: 'to-accent/80'
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: PromoFormData) => {
    if (editingContent) {
      const updatedItems = contentItems.map(item => item.id === editingContent.id ? { ...item, ...data } : item);
      setContentItems(updatedItems);
      // In a real app, this would be an API call. For this demo, we mutate the sample data object.
      const globalIndex = samplePromotionalContent.findIndex(p => p.id === editingContent.id);
      if (globalIndex !== -1) {
        samplePromotionalContent[globalIndex] = { ...samplePromotionalContent[globalIndex], ...data };
      }
      toast({ title: "Content Updated", description: `"${data.title}" has been saved.` });
    } else {
      const newItem: PromotionalContent = { ...data, id: `promo-${Date.now()}` };
      const updatedItems = [newItem, ...contentItems];
      setContentItems(updatedItems);
      samplePromotionalContent.unshift(newItem);
      toast({ title: "Content Created", description: `"${data.title}" has been added.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setContentItems(items => items.filter(item => item.id !== id));
    const globalIndex = samplePromotionalContent.findIndex(p => p.id === id);
    if (globalIndex !== -1) {
      samplePromotionalContent.splice(globalIndex, 1);
    }
    toast({ title: "Content Deleted", description: "The promotional card has been deleted.", variant: "destructive" });
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-primary" />
          Promotional Content Management
        </h1>
        <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Create New Card
        </Button>
      </div>
      <CardDescription>
        Manage the promotional spotlight cards shown on the user dashboard. Active cards will auto-slide.
      </CardDescription>

      <Card>
          <CardHeader>
              <CardTitle>Current Promotional Cards</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {contentItems.map(item => (
                          <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {item.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}><Edit3 className="h-4 w-4"/></Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4"/></Button>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>{editingContent ? 'Edit' : 'Create'} Promotional Card</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div>
                      <Label htmlFor="title">Title</Label>
                      <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
                  </div>
                  <div>
                      <Label htmlFor="description">Description</Label>
                      <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} rows={3} />} />
                  </div>
                  <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Controller name="imageUrl" control={control} render={({ field }) => <Input id="imageUrl" {...field} />} />
                  </div>
                  <div>
                      <Label htmlFor="imageAlt">Image Alt Text</Label>
                      <Controller name="imageAlt" control={control} render={({ field }) => <Input id="imageAlt" {...field} />} />
                  </div>
                  <div>
                      <Label htmlFor="buttonText">Button Text</Label>
                      <Controller name="buttonText" control={control} render={({ field }) => <Input id="buttonText" {...field} />} />
                  </div>
                  <div>
                      <Label htmlFor="buttonLink">Button Link URL</Label>
                      <Controller name="buttonLink" control={control} render={({ field }) => <Input id="buttonLink" {...field} />} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller name="isActive" control={control} render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />} />
                    <Label htmlFor="isActive">Show on Dashboard</Label>
                  </div>

                  <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                      <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
