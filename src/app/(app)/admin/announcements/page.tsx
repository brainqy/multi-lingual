
"use client";

import { useI18n } from "@/hooks/use-i18n";


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Announcement, AnnouncementStatus, AnnouncementAudience } from "@/types";
import { sampleAnnouncements, sampleUserProfile, sampleTenants } from "@/lib/sample-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date().optional(),
  audience: z.enum(['All Users', 'Specific Tenant', 'Specific Role']),
  audienceTarget: z.string().optional(),
  status: z.enum(['Draft', 'Published', 'Archived']),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function AnnouncementManagementPage() {
  const currentUser = sampleUserProfile;
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    if (currentUser.role === 'admin') {
      return sampleAnnouncements;
    }
    return sampleAnnouncements.filter(a => 
      a.audience === 'All Users' || 
      (a.audience === 'Specific Tenant' && a.audienceTarget === currentUser.tenantId) ||
      (a.audience === 'Specific Role' && a.audienceTarget === currentUser.role && a.tenantId === currentUser.tenantId) // Assuming role-specific might be tenant-scoped too
    );
  });
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { status: 'Draft', audience: currentUser.role === 'manager' ? 'Specific Tenant' : 'All Users' }
  });

  const watchedAudience = watch("audience");
  
  useEffect(() => {
    if (currentUser.role === 'manager') {
      setValue('audience', 'Specific Tenant');
      setValue('audienceTarget', currentUser.tenantId || '');
    }
  }, [currentUser.role, currentUser.tenantId, setValue]);


  if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    return <AccessDeniedMessage />;
  }

  const onSubmitForm = (data: AnnouncementFormData) => {
    let audienceTarget = data.audienceTarget;
    if (currentUser.role === 'manager' && data.audience === 'Specific Tenant') {
        audienceTarget = currentUser.tenantId; // Ensure manager can only target their tenant
    }

    const announcementData: Announcement = {
      title: data.title,
      content: data.content,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate?.toISOString(),
      audience: data.audience as AnnouncementAudience,
      audienceTarget: data.audience === 'Specific Tenant' ? audienceTarget : data.audience === 'Specific Role' ? data.audienceTarget : undefined,
      status: data.status as AnnouncementStatus,
      id: editingAnnouncement ? editingAnnouncement.id : `announce-${Date.now()}`,
      createdAt: editingAnnouncement ? editingAnnouncement.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.id,
      tenantId: data.audience === 'Specific Tenant' ? audienceTarget : (data.audience === 'All Users' ? 'platform' : currentUser.tenantId) // Assign tenantId
    };

    if (editingAnnouncement) {
      if (currentUser.role === 'manager' && editingAnnouncement.createdBy !== currentUser.id && editingAnnouncement.tenantId !== currentUser.tenantId && editingAnnouncement.audience !== 'All Users') {
        toast({ title: "Permission Denied", description: "You can only edit announcements you created for your tenant.", variant: "destructive" });
        return;
      }
      setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? announcementData : a));
      const globalIndex = sampleAnnouncements.findIndex(sa => sa.id === editingAnnouncement.id);
      if (globalIndex !== -1) sampleAnnouncements[globalIndex] = announcementData;
      toast({ title: "Announcement Updated", description: `Announcement "${data.title}" has been updated.` });
    } else {
      setAnnouncements(prev => [announcementData, ...prev]);
      sampleAnnouncements.unshift(announcementData);
      toast({ title: "Announcement Created", description: `Announcement "${data.title}" has been added.` });
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
      toast({ title: "Permission Denied", description: "You can only edit announcements you created for your tenant, or platform-wide announcements if applicable.", variant: "destructive" });
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

  const handleDeleteAnnouncement = (announcementId: string) => {
    const announcementToDelete = announcements.find(a => a.id === announcementId);
     if (currentUser.role === 'manager' && announcementToDelete && announcementToDelete.createdBy !== currentUser.id && announcementToDelete.tenantId !== currentUser.tenantId && announcementToDelete.audience !== 'All Users') {
      toast({ title: "Permission Denied", description: "You can only delete announcements you created for your tenant.", variant: "destructive" });
      return;
    }
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    const globalIndex = sampleAnnouncements.findIndex(sa => sa.id === announcementId);
    if (globalIndex !== -1) sampleAnnouncements.splice(globalIndex, 1);
    toast({ title: "Announcement Deleted", description: "Announcement removed.", variant: "destructive" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Megaphone className="h-8 w-8" /> Announcement Management {currentUser.role === 'manager' && `(Tenant: ${currentUser.tenantId})`}
        </h1>
        <Button onClick={openNewAnnouncementDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Announcement
        </Button>
      </div>
      <CardDescription>Manage platform-wide or targeted announcements.</CardDescription>

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
              {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="announcement-title">Title</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="announcement-title" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="announcement-content">Content</Label>
              <Controller name="content" control={control} render={({ field }) => <Textarea id="announcement-content" rows={5} {...field} placeholder="Enter announcement details. Supports Markdown." />} />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="announcement-startDate">Start Date</Label>
                <Controller name="startDate" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
                {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <Label htmlFor="announcement-endDate">End Date (Optional)</Label>
                <Controller name="endDate" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="announcement-audience">Audience</Label>
                <Controller name="audience" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={currentUser.role === 'manager' && editingAnnouncement?.audience !== 'Specific Tenant'}>
                    <SelectTrigger id="announcement-audience"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currentUser.role === 'admin' && <SelectItem value="All Users">All Users</SelectItem>}
                      <SelectItem value="Specific Tenant">Specific Tenant</SelectItem>
                      {currentUser.role === 'admin' && <SelectItem value="Specific Role">Specific Role (mocked)</SelectItem>}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              {watchedAudience === 'Specific Tenant' && (
                <div>
                  <Label htmlFor="announcement-audienceTarget">Target Tenant</Label>
                  <Controller name="audienceTarget" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={currentUser.role === 'manager'}>
                      <SelectTrigger id="announcement-audienceTarget"><SelectValue placeholder="Select Tenant" /></SelectTrigger>
                      <SelectContent>
                        {currentUser.role === 'manager' ? (
                           <SelectItem value={currentUser.tenantId!}>{sampleTenants.find(t=>t.id === currentUser.tenantId)?.name || currentUser.tenantId}</SelectItem>
                        ) : (
                            sampleTenants.map(tenant => (
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
                  <Label htmlFor="announcement-audienceTarget">Target Role</Label>
                  <Controller name="audienceTarget" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="announcement-audienceTarget"><SelectValue placeholder="Select Role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="announcement-status">Status</Label>
              <Controller name="status" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="announcement-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    {currentUser.role === 'admin' && <SelectItem value="Archived">Archived</SelectItem>}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingAnnouncement ? "Save Changes" : "Create Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Current Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No announcements found{currentUser.role === 'manager' && ' for your tenant or globally'}.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        {announcement.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {announcement.audience}
                      {announcement.audienceTarget && ` (${announcement.audience === 'Specific Tenant' ? sampleTenants.find(t=>t.id === announcement.audienceTarget)?.name || announcement.audienceTarget : announcement.audienceTarget})`}
                      {announcement.audience === 'All Users' && ' (Platform-wide)'}
                    </TableCell>
                    <TableCell>{format(parseISO(announcement.startDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{announcement.endDate ? format(parseISO(announcement.endDate), "MMM dd, yyyy") : 'Ongoing'}</TableCell>
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
