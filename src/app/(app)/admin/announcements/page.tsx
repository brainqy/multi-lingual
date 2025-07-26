
"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription as DialogUIDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, Megaphone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Announcement, AnnouncementStatus, AnnouncementAudience, Tenant } from "@/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/actions/announcements";
import { getTenants } from "@/lib/actions/tenants";
import { useAuth } from "@/hooks/use-auth";

const announcementSchemaBase = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title cannot exceed 100 characters."),
  content: z.string().min(10, "Content must be at least 10 characters.").max(2000, "Content cannot exceed 2000 characters."),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  audience: z.enum(['All Users', 'Specific Tenant', 'Specific Role']),
  audienceTarget: z.string().optional(),
  status: z.enum(['Draft', 'Published', 'Archived']),
});

type AnnouncementFormData = z.infer<typeof announcementSchemaBase>;

export default function AnnouncementManagementPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const translatedAnnouncementSchema = announcementSchemaBase.extend({
    title: z.string().min(5, t("validation.titleMin", { default: "Title must be at least {count} characters.", count: 5 })).max(100, "Title cannot exceed 100 characters."),
    content: z.string().min(10, t("validation.contentMin", { default: "Content must be at least {count} characters.", count: 10 })).max(2000, "Content cannot exceed 2000 characters."),
    startDate: z.date({ required_error: t("validation.startDateRequired", { default: "Start date is required" }) })
  });
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const tenantIdToFetch = currentUser.role === 'admin' ? undefined : currentUser.tenantId;
    const [fetchedAnnouncements, fetchedTenants] = await Promise.all([
        getAllAnnouncements(tenantIdToFetch),
        currentUser.role === 'admin' ? getTenants() : Promise.resolve([])
    ]);
    setAnnouncements(fetchedAnnouncements);
    setTenants(fetchedTenants);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AnnouncementFormData>({
    resolver: zodResolver(translatedAnnouncementSchema),
    defaultValues: { status: 'Draft', audience: currentUser?.role === 'manager' ? 'Specific Tenant' : 'All Users' }
  });

  const watchedAudience = watch("audience");
  
  useEffect(() => {
    if (currentUser?.role === 'manager') {
      setValue('audience', 'Specific Tenant');
      setValue('audienceTarget', currentUser.tenantId || '');
    }
  }, [currentUser?.role, currentUser?.tenantId, setValue]);


  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
    return <AccessDeniedMessage />;
  }

  const onSubmitForm = async (data: AnnouncementFormData) => {
    let audienceTarget = data.audienceTarget;
    if (currentUser.role === 'manager' && data.audience === 'Specific Tenant') {
        audienceTarget = currentUser.tenantId; 
    }

    const announcementData = {
      title: data.title,
      content: data.content,
      startDate: data.startDate,
      endDate: data.endDate,
      audience: data.audience as AnnouncementAudience,
      audienceTarget: data.audience === 'Specific Tenant' ? audienceTarget : data.audience === 'Specific Role' ? data.audienceTarget : undefined,
      status: data.status as AnnouncementStatus,
      createdBy: currentUser.id,
      tenantId: data.audience === 'Specific Tenant' ? audienceTarget : (data.audience === 'All Users' ? 'platform' : currentUser.tenantId) 
    };

    if (editingAnnouncement) {
      if (currentUser.role === 'manager' && editingAnnouncement.createdBy !== currentUser.id && editingAnnouncement.tenantId !== currentUser.tenantId && editingAnnouncement.audience !== 'All Users') {
        toast({ title: t("announcementsAdmin.toast.permissionDeniedEdit.title"), description: t("announcementsAdmin.toast.permissionDeniedEdit.description"), variant: "destructive" });
        return;
      }
      const updated = await updateAnnouncement(editingAnnouncement.id, announcementData);
      if (updated) {
        setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? updated : a));
        toast({ title: t("announcementsAdmin.toast.announcementUpdated.title"), description: t("announcementsAdmin.toast.announcementUpdated.description", { title: data.title }) });
      }
    } else {
      const created = await createAnnouncement(announcementData as Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>);
      if (created) {
        setAnnouncements(prev => [created, ...prev]);
        toast({ title: t("announcementsAdmin.toast.announcementCreated.title"), description: t("announcementsAdmin.toast.announcementCreated.description", { title: data.title }) });
      }
    }
    setIsFormDialogOpen(false);
    reset({ title: '', content: '', audience: currentUser.role === 'manager' ? 'Specific Tenant' : 'All Users', audienceTarget: currentUser.role === 'manager' ? currentUser.tenantId : '', status: 'Draft' });
    setEditingAnnouncement(null);
  };

  const openNewAnnouncementDialog = () => {
    setEditingAnnouncement(null);
    reset({ title: '', content: '', startDate: new Date(), audience: currentUser.role === 'manager' ? 'Specific Tenant' : 'All Users', audienceTarget: currentUser.role === 'manager' ? currentUser.tenantId : '', status: 'Draft' });
    setIsFormDialogOpen(true);
  };

  const openEditAnnouncementDialog = (announcement: Announcement) => {
     if (currentUser.role === 'manager' && announcement.createdBy !== currentUser.id && announcement.tenantId !== currentUser.tenantId && announcement.audience !== 'All Users') {
      toast({ title: t("announcementsAdmin.toast.permissionDeniedEdit.title"), description: t("announcementsAdmin.toast.permissionDeniedEdit.description"), variant: "destructive" });
      return;
    }
    setEditingAnnouncement(announcement);
    setValue('title', announcement.title);
    setValue('content', announcement.content);
    setValue('startDate', parseISO(announcement.startDate));
    if (announcement.endDate) setValue('endDate', parseISO(announcement.endDate));
    setValue('audience', announcement.audience);
    setValue('audienceTarget', announcement.audienceTarget || (currentUser.role === 'manager' && announcement.audience === 'Specific Tenant' ? currentUser.tenantId : ''));
    setValue('status', announcement.status);
    setIsFormDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    const announcementToDelete = announcements.find(a => a.id === announcementId);
     if (currentUser.role === 'manager' && announcementToDelete && announcementToDelete.createdBy !== currentUser.id && announcementToDelete.tenantId !== currentUser.tenantId && announcementToDelete.audience !== 'All Users') {
      toast({ title: t("announcementsAdmin.toast.permissionDeniedDelete.title"), description: t("announcementsAdmin.toast.permissionDeniedDelete.description"), variant: "destructive" });
      return;
    }
    const success = await deleteAnnouncement(announcementId);
    if (success) {
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      toast({ title: t("announcementsAdmin.toast.announcementDeleted.title"), description: t("announcementsAdmin.toast.announcementDeleted.description"), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Megaphone className="h-8 w-8" /> 
          {t("announcementsAdmin.title", { default: "Announcements Management" })} 
          {currentUser.role === 'manager' && ` (${t("announcementsAdmin.manageTenant", { default: "Manage announcements for {tenantId}", tenantId: currentUser.tenantId || "Your Tenant" })})`}
        </h1>
        <Button onClick={openNewAnnouncementDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> {t("announcementsAdmin.createNewButton", { default: "Create New Announcement" })}
        </Button>
      </div>
      <CardDescription>{currentUser.role === 'manager' ? t("announcementsAdmin.manageTenant", { default: "Manage announcements for {tenantId}", tenantId: currentUser.tenantId || "your tenant"}) : t("announcementsAdmin.managePlatform", { default: "Manage announcements for the entire platform." })}</CardDescription>

      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setEditingAnnouncement(null);
          reset();
        }
        setIsFormDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingAnnouncement ? t("announcementsAdmin.dialog.editTitle", { default: "Edit Announcement" }) : t("announcementsAdmin.dialog.createTitle", { default: "Create New Announcement" })}
            </DialogTitle>
            <DialogUIDescription>
                {editingAnnouncement ? 'Update the details for your announcement.' : 'Fill out the form to create a new announcement for the platform or a specific tenant.'}
            </DialogUIDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="announcement-title">{t("announcementsAdmin.dialog.titleLabel", { default: "Title" })}</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="announcement-title" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="announcement-content">{t("announcementsAdmin.dialog.contentLabel", { default: "Content" })}</Label>
              <Controller name="content" control={control} render={({ field }) => <Textarea id="announcement-content" rows={5} {...field} placeholder={t("announcementsAdmin.dialog.contentPlaceholder", { default: "Enter the announcement content here (Markdown supported)." })} />} />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="announcement-startDate">{t("announcementsAdmin.dialog.startDateLabel", { default: "Start Date" })}</Label>
                <Controller name="startDate" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
                {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <Label htmlFor="announcement-endDate">{t("announcementsAdmin.dialog.endDateLabel", { default: "End Date (Optional)" })}</Label>
                <Controller name="endDate" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="announcement-audience">{t("announcementsAdmin.dialog.audienceLabel", { default: "Audience" })}</Label>
                <Controller name="audience" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={currentUser.role === 'manager' && editingAnnouncement?.audience !== 'Specific Tenant'}>
                    <SelectTrigger id="announcement-audience"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currentUser.role === 'admin' && <SelectItem value="All Users">{t("announcementsAdmin.dialog.audienceAllUsers", { default: "All Users (Platform-wide)" })}</SelectItem>}
                      <SelectItem value="Specific Tenant">{t("announcementsAdmin.dialog.audienceSpecificTenant", { default: "Specific Tenant" })}</SelectItem>
                      {currentUser.role === 'admin' && <SelectItem value="Specific Role">{t("announcementsAdmin.dialog.audienceSpecificRole", { default: "Specific Role" })}</SelectItem>}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              {watchedAudience === 'Specific Tenant' && (
                <div>
                  <Label htmlFor="announcement-audienceTarget">{t("announcementsAdmin.dialog.targetTenantLabel", { default: "Target Tenant" })}</Label>
                  <Controller name="audienceTarget" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={currentUser.role === 'manager'}>
                      <SelectTrigger id="announcement-audienceTarget"><SelectValue placeholder={t("announcementsAdmin.dialog.selectTenantPlaceholder", { default: "Select a tenant" })} /></SelectTrigger>
                      <SelectContent>
                        {currentUser.role === 'manager' ? (
                           <SelectItem value={currentUser.tenantId!}>{tenants.find(t=>t.id === currentUser.tenantId)?.name || currentUser.tenantId}</SelectItem>
                        ) : (
                            tenants.map(tenant => (
                                <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              )}
              {currentUser.role === 'admin' && watchedAudience === 'Specific Role' && (
                 <div>
                  <Label htmlFor="announcement-audienceTarget">{t("announcementsAdmin.dialog.targetRoleLabel", { default: "Target Role" })}</Label>
                  <Controller name="audienceTarget" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="announcement-audienceTarget"><SelectValue placeholder={t("announcementsAdmin.dialog.selectRolePlaceholder", { default: "Select a role" })} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t("announcementsAdmin.dialog.roleUser", { default: "User" })}</SelectItem>
                        <SelectItem value="manager">{t("announcementsAdmin.dialog.roleManager", { default: "Manager" })}</SelectItem>
                        <SelectItem value="admin">{t("announcementsAdmin.dialog.roleAdmin", { default: "Admin" })}</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="announcement-status">{t("announcementsAdmin.dialog.statusLabel", { default: "Status" })}</Label>
              <Controller name="status" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="announcement-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">{t("announcementsAdmin.dialog.statusDraft", { default: "Draft" })}</SelectItem>
                    <SelectItem value="Published">{t("announcementsAdmin.dialog.statusPublished", { default: "Published" })}</SelectItem>
                    {currentUser.role === 'admin' && <SelectItem value="Archived">{t("announcementsAdmin.dialog.statusArchived", { default: "Archived" })}</SelectItem>}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">{t("announcementsAdmin.dialog.cancelButton", { default: "Cancel" })}</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingAnnouncement ? t("announcementsAdmin.dialog.saveChangesButton", { default: "Save Changes" }) : t("announcementsAdmin.dialog.createButton", { default: "Create Announcement" })}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("announcementsAdmin.currentAnnouncementsTitle", { default: "Current Announcements" })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{currentUser.role === 'manager' ? t("announcementsAdmin.noAnnouncementsTenant", { default: "No announcements found for your tenant." }) : t("announcementsAdmin.noAnnouncementsPlatform", { default: "No announcements have been created yet." })}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("announcementsAdmin.table.title", { default: "Title" })}</TableHead>
                  <TableHead>{t("announcementsAdmin.table.status", { default: "Status" })}</TableHead>
                  <TableHead>{t("announcementsAdmin.table.audience", { default: "Audience" })}</TableHead>
                  <TableHead>{t("announcementsAdmin.table.startDate", { default: "Start Date" })}</TableHead>
                  <TableHead>{t("announcementsAdmin.table.endDate", { default: "End Date" })}</TableHead>
                  <TableHead className="text-right">{t("announcementsAdmin.table.actions", { default: "Actions" })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={announcement.title}>{announcement.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                        announcement.status === 'Published' ? 'bg-green-100 text-green-700' :
                        announcement.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t(`announcementsAdmin.dialog.status${announcement.status}` as any, { default: announcement.status })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {t(`announcementsAdmin.dialog.audience${announcement.audience.replace(/\s/g, '')}` as any, { default: announcement.audience })}
                      {announcement.audienceTarget && ` ${t("announcementsAdmin.audienceTargetDisplay", { default: "(Target: {target})", target: (announcement.audience === 'Specific Tenant' ? tenants.find(t=>t.id === announcement.audienceTarget)?.name || announcement.audienceTarget : announcement.audienceTarget) })}`}
                      {announcement.audience === 'All Users' && ` ${t("announcementsAdmin.audiencePlatformWide", { default: "(Platform-wide)" })}`}
                    </TableCell>
                    <TableCell>{format(parseISO(announcement.startDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{announcement.endDate ? format(parseISO(announcement.endDate), "MMM dd, yyyy") : t("announcementsAdmin.endDateOngoing", { default: "Ongoing" })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditAnnouncementDialog(announcement)} disabled={currentUser.role === 'manager' && announcement.createdBy !== currentUser.id && announcement.tenantId !== currentUser.tenantId && announcement.audience !== 'All Users'}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)} disabled={currentUser.role === 'manager' && announcement.createdBy !== currentUser.id && announcement.tenantId !== currentUser.tenantId && announcement.audience !== 'All Users'}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
