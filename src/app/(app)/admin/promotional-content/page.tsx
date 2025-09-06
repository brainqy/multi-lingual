
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, Megaphone, PlusCircle, Edit3, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PromotionalContent, Tenant, UserRole } from '@/types';
import AccessDeniedMessage from '@/components/ui/AccessDeniedMessage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from '@/hooks/use-i18n';
import { getPromotionalContent, createPromotionalContent, updatePromotionalContent, deletePromotionalContent } from '@/lib/actions/promotional-content';
import { useAuth } from '@/hooks/use-auth';
import { getTenants } from '@/lib/actions/tenants';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
  tenantId: z.string().optional(),
  targetRole: z.string().optional(),
});
type PromoFormData = z.infer<typeof promoSchema>;

export default function PromotionalContentPage() {
  const [contentItems, setContentItems] = useState<PromotionalContent[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<PromotionalContent | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { t } = useI18n();

  const { control, handleSubmit, reset } = useForm<PromoFormData>({
    resolver: zodResolver(promoSchema),
  });
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [items, tenantData] = await Promise.all([
        getPromotionalContent(),
        getTenants(),
      ]);
      setContentItems(items);
      setTenants(tenantData);
      setIsLoading(false);
    }
    loadData();
  }, []);
  
  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const openEditDialog = (content: PromotionalContent) => {
    setEditingContent(content);
    reset({
        ...content,
        tenantId: content.tenantId || 'all',
        targetRole: content.targetRole || 'all',
    });
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
      gradientTo: 'to-accent/80',
      tenantId: 'all',
      targetRole: 'all',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: PromoFormData) => {
    if (editingContent) {
      const updated = await updatePromotionalContent(editingContent.id, data);
      if (updated) {
        setContentItems(prev => prev.map(item => item.id === editingContent.id ? updated : item));
        toast({ title: t("promotionalContent.toast.updated.title"), description: t("promotionalContent.toast.updated.description", { title: data.title }) });
      }
    } else {
      const created = await createPromotionalContent(data as Omit<PromotionalContent, 'id'>);
      if (created) {
        setContentItems(prev => [created, ...prev]);
        toast({ title: t("promotionalContent.toast.created.title"), description: t("promotionalContent.toast.created.description", { title: data.title }) });
      }
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deletePromotionalContent(id);
    if (success) {
      setContentItems(items => items.filter(item => item.id !== id));
      toast({ title: t("promotionalContent.toast.deleted.title"), description: t("promotionalContent.toast.deleted.description"), variant: "destructive" });
    } else {
      toast({ title: "Error", description: "Failed to delete promotional content.", variant: "destructive" });
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-primary" />
          {t("promotionalContent.title")}
        </h1>
        <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            {t("promotionalContent.createNewButton")}
        </Button>
      </div>
      <CardDescription>
        {t("promotionalContent.description")}
      </CardDescription>

      <Card>
          <CardHeader>
              <CardTitle>{t("promotionalContent.currentCardsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
              ) : (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>{t("promotionalContent.table.title")}</TableHead>
                          <TableHead>Target Tenant</TableHead>
                          <TableHead>Target Role</TableHead>
                          <TableHead>{t("promotionalContent.table.status")}</TableHead>
                          <TableHead className="text-right">{t("promotionalContent.table.actions")}</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {contentItems.map(item => (
                          <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>{item.tenantId ? tenants.find(t => t.id === item.tenantId)?.name || item.tenantId : 'All Tenants'}</TableCell>
                              <TableCell className="capitalize">{item.targetRole || 'All Roles'}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {item.isActive ? t("promotionalContent.status.active") : t("promotionalContent.status.inactive")}
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
              )}
          </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>{editingContent ? t("promotionalContent.dialog.editTitle") : t("promotionalContent.dialog.createTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div>
                      <Label htmlFor="title">{t("promotionalContent.form.titleLabel")}</Label>
                      <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
                  </div>
                  <div>
                      <Label htmlFor="description">{t("promotionalContent.form.descriptionLabel")}</Label>
                      <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} rows={3} />} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="imageUrl">{t("promotionalContent.form.imageUrlLabel")}</Label>
                          <Controller name="imageUrl" control={control} render={({ field }) => <Input id="imageUrl" {...field} />} />
                      </div>
                      <div>
                          <Label htmlFor="imageAlt">{t("promotionalContent.form.imageAltLabel")}</Label>
                          <Controller name="imageAlt" control={control} render={({ field }) => <Input id="imageAlt" {...field} />} />
                      </div>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="buttonText">{t("promotionalContent.form.buttonTextLabel")}</Label>
                          <Controller name="buttonText" control={control} render={({ field }) => <Input id="buttonText" {...field} />} />
                      </div>
                      <div>
                          <Label htmlFor="buttonLink">{t("promotionalContent.form.buttonLinkLabel")}</Label>
                          <Controller name="buttonLink" control={control} render={({ field }) => <Input id="buttonLink" {...field} />} />
                      </div>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tenantId">Target Tenant</Label>
                        <Controller name="tenantId" control={control} render={({ field }) => (
                           <Select onValueChange={field.onChange} value={field.value || 'all'}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All Tenants</SelectItem>
                                  {tenants.map(tenant => (
                                      <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                                  ))}
                              </SelectContent>
                           </Select>
                        )} />
                      </div>
                      <div>
                        <Label htmlFor="targetRole">Target Role</Label>
                        <Controller name="targetRole" control={control} render={({ field }) => (
                           <Select onValueChange={field.onChange} value={field.value || 'all'}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All Roles</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                           </Select>
                        )} />
                      </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Controller name="isActive" control={control} render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />} />
                    <Label htmlFor="isActive">{t("promotionalContent.form.showOnDashboardLabel")}</Label>
                  </div>

                  <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel")}</Button></DialogClose>
                      <Button type="submit"><Save className="mr-2 h-4 w-4" /> {t("promotionalContent.dialog.saveButton")}</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
