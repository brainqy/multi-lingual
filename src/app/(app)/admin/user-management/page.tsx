
"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useState, useMemo, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription as DialogUIDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit3, Trash2, UserCog, UserCircle, Search, Loader2, UploadCloud, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, UserRole, UserStatus, Tenant } from "@/types";
import { samplePlatformUsers, sampleTenants, ensureFullUserProfile, sampleUserProfile } from "@/lib/sample-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum(['user', 'manager', 'admin']),
  tenantId: z.string().min(1, "Tenant is required."),
  status: z.enum(['active', 'inactive', 'suspended', 'pending', 'PENDING_DELETION']),
  password: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

type CsvUser = {
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
};


export default function UserManagementPage() {
  const currentUser = sampleUserProfile;
  const { toast } = useToast();
  const { t } = useI18n();
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>(samplePlatformUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    setAllUsers(samplePlatformUsers);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const usersToDisplay = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return allUsers;
    }
    if (currentUser.role === 'manager') {
      return allUsers.filter(u => u.tenantId === currentUser.tenantId && u.role !== 'admin');
    }
    return [];
  }, [allUsers, currentUser]);


  const filteredUsers = useMemo(() => {
    return usersToDisplay.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.tenantId && user.tenantId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [usersToDisplay, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage, usersPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
    return <AccessDeniedMessage />;
  }


  const openNewUserDialog = () => {
    setEditingUser(null);
    reset({
        name: '', 
        email: '', 
        role: 'user', 
        status: 'active', 
        tenantId: currentUser.role === 'manager' ? currentUser.tenantId : '', 
        password: '' 
    });
    setIsFormDialogOpen(true);
  };

  const openEditUserDialog = (user: UserProfile) => {
    setEditingUser(user);
    reset({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      tenantId: user.tenantId,
      password: '', // Don't expose password
    });
    setIsFormDialogOpen(true);
  };

  const onSubmitForm = (data: UserFormData) => {
    if (editingUser) {
      const updatedUser: UserProfile = { ...editingUser, ...data, role: data.role as UserRole, status: data.status as UserStatus };
      setAllUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      const globalIndex = samplePlatformUsers.findIndex(u => u.id === editingUser.id);
      if (globalIndex !== -1) samplePlatformUsers[globalIndex] = updatedUser;
      toast({ title: t("userManagement.toast.updated.title"), description: t("userManagement.toast.updated.description", { name: data.name }) });
    } else {
      if (!data.password || data.password.length < 8) {
        toast({ title: t("userManagement.toast.passwordRequired.title"), description: t("userManagement.toast.passwordRequired.description"), variant: "destructive" });
        return;
      }
      const tenantIdForNewUser = currentUser.role === 'manager' ? currentUser.tenantId : data.tenantId;

      const newUser = ensureFullUserProfile({
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        tenantId: tenantIdForNewUser,
        status: data.status as UserStatus,
        createdAt: new Date().toISOString(),
      });
      setAllUsers(prev => [newUser, ...prev]);
      samplePlatformUsers.push(newUser); 
      toast({ title: t("userManagement.toast.created.title"), description: t("userManagement.toast.created.description", { name: data.name }) });
    }
    setIsFormDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
        toast({ title: t("userManagement.toast.deleteSelf.title"), description: t("userManagement.toast.deleteSelf.description"), variant: "destructive" });
        return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    const globalIndex = samplePlatformUsers.findIndex(u => u.id === userId);
    if (globalIndex !== -1) samplePlatformUsers.splice(globalIndex, 1);
    toast({ title: t("userManagement.toast.deleted.title"), description: t("userManagement.toast.deleted.description"), variant: "destructive" });
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setCsvError(null);
    }
  };

  const handleProcessCsv = () => {
    if (!csvFile) {
      setCsvError(t("userManagement.bulkUpload.errorNoFile"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);
        if (rows.length < 2) throw new Error(t("userManagement.bulkUpload.errorCsvFormat"));

        const header = rows[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'email', 'role', 'tenantid'];
        if (!requiredHeaders.every(h => header.includes(h))) {
          throw new Error(t("userManagement.bulkUpload.errorCsvHeader", { headers: requiredHeaders.join(', ') }));
        }
        
        const nameIndex = header.indexOf('name');
        const emailIndex = header.indexOf('email');
        const roleIndex = header.indexOf('role');
        const tenantIdIndex = header.indexOf('tenantid');
        
        let addedCount = 0;
        const newUsers: UserProfile[] = [];

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map(v => v.trim());
          const newUserCsv: Partial<CsvUser> = {
            name: values[nameIndex],
            email: values[emailIndex],
            role: values[roleIndex] as UserRole,
            tenantId: values[tenantIdIndex],
          };

          if (newUserCsv.email && !allUsers.some(u => u.email === newUserCsv.email)) {
            const fullUserProfile = ensureFullUserProfile({
              name: newUserCsv.name,
              email: newUserCsv.email,
              role: newUserCsv.role,
              tenantId: newUserCsv.tenantId,
              status: 'active'
            });
            newUsers.push(fullUserProfile);
            addedCount++;
          }
        }
        
        // Batch update state and sample data
        setAllUsers(prev => [...newUsers, ...prev]);
        samplePlatformUsers.unshift(...newUsers);

        toast({
          title: t("userManagement.toast.uploaded.title"),
          description: t("userManagement.toast.uploaded.description", { count: addedCount }),
        });
        
        setIsUploadDialogOpen(false);
        setCsvFile(null);

      } catch (err: any) {
        setCsvError(err.message || t("userManagement.bulkUpload.errorProcessing"));
      }
    };
    reader.onerror = () => {
      setCsvError(t("userManagement.bulkUpload.errorReading"));
    };
    reader.readAsText(csvFile);
  };


  const getStatusClass = (status?: UserStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTenantName = (tenantId: string) => {
    return sampleTenants.find(t => t.id === tenantId)?.name || tenantId;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserCog className="h-8 w-8" /> 
          {currentUser.role === 'manager' ? t("userManagement.titleManager", { tenantName: getTenantName(currentUser.tenantId) }) : t("userManagement.titleAdmin")}
        </h1>
        <div className="flex gap-2">
           <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline">
            <UploadCloud className="mr-2 h-4 w-4"/> {t("userManagement.bulkUploadButton")}
          </Button>
          <Button onClick={openNewUserDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> {t("userManagement.addNewButton")}
          </Button>
        </div>
      </div>
      <CardDescription>
        {currentUser.role === 'manager' ? 
          t("userManagement.descriptionManager", { tenantName: getTenantName(currentUser.tenantId) }) :
          t("userManagement.descriptionAdmin")
        }
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("userManagement.allUsersTitle")}</CardTitle>
          <div className="mt-2">
            <Input
              placeholder={t("userManagement.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("userManagement.table.user")}</TableHead>
                <TableHead>{t("userManagement.table.role")}</TableHead>
                {currentUser.role === 'admin' && <TableHead>{t("userManagement.table.tenant")}</TableHead>}
                <TableHead>{t("userManagement.table.status")}</TableHead>
                <TableHead className="text-right">{t("userManagement.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profilePictureUrl || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                        <AvatarFallback><UserCircle /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  {currentUser.role === 'admin' && <TableCell>{getTenantName(user.tenantId)}</TableCell>}
                  <TableCell>
                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getStatusClass(user.status)}`}>
                      {user.status || 'unknown'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditUserDialog(user)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm" disabled={user.id === currentUser?.id}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>{t("userManagement.deleteDialog.title")}</AlertDialogTitle>
                           <AlertDialogDescription>
                             {t("userManagement.deleteDialog.description", { name: user.name })}
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t("userManagement.deleteDialog.deleteButton")}</AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="flex justify-center items-center gap-2 pt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </CardFooter>
        )}
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingUser ? t("userManagement.dialog.editTitle") : t("userManagement.dialog.addTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">{t("userManagement.form.nameLabel")}</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">{t("userManagement.form.emailLabel")}</Label>
              <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} />} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            {!editingUser && (
              <div>
                <Label htmlFor="password">{t("userManagement.form.passwordLabel")}</Label>
                <Controller name="password" control={control} render={({ field }) => <Input id="password" type="password" {...field} />} />
                <p className="text-xs text-muted-foreground mt-1">{t("userManagement.form.passwordHelp")}</p>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">{t("userManagement.form.roleLabel")}</Label>
                <Controller name="role" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={editingUser?.role === 'admin'}>
                    <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t("userManagement.roles.user")}</SelectItem>
                      <SelectItem value="manager">{t("userManagement.roles.manager")}</SelectItem>
                      {currentUser.role === 'admin' && <SelectItem value="admin">{t("userManagement.roles.admin")}</SelectItem>}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label htmlFor="status">{t("userManagement.form.statusLabel")}</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("userManagement.statuses.active")}</SelectItem>
                      <SelectItem value="inactive">{t("userManagement.statuses.inactive")}</SelectItem>
                      <SelectItem value="suspended">{t("userManagement.statuses.suspended")}</SelectItem>
                      <SelectItem value="pending">{t("userManagement.statuses.pending")}</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            {currentUser.role === 'admin' && (
              <div>
                <Label htmlFor="tenantId">{t("userManagement.form.tenantLabel")}</Label>
                <Controller name="tenantId" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={editingUser?.role === 'admin'}>
                    <SelectTrigger id="tenantId"><SelectValue placeholder={t("userManagement.form.tenantPlaceholder")} /></SelectTrigger>
                    <SelectContent>
                      {sampleTenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.tenantId && <p className="text-sm text-destructive mt-1">{errors.tenantId.message}</p>}
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel")}</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingUser ? t("userManagement.dialog.saveButton") : t("userManagement.dialog.createButton")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* CSV Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("userManagement.bulkUpload.title")}</DialogTitle>
            <DialogUIDescription>
              {t("userManagement.bulkUpload.description")}
            </DialogUIDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="csv-upload">{t("userManagement.bulkUpload.csvLabel")}</Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
              />
              {csvFile && <p className="text-xs text-muted-foreground mt-1">{t("userManagement.bulkUpload.selectedFile")}: {csvFile.name}</p>}
              {csvError && <p className="text-sm text-destructive mt-1">{csvError}</p>}
            </div>
            <Button asChild variant="link" className="p-0 h-auto -mt-2">
              <a href="/sample-users.csv" download="sample-users.csv">
                <Download className="mr-2 h-4 w-4" />
                {t("userManagement.bulkUpload.downloadSample")}
              </a>
            </Button>
            <p className="text-xs text-muted-foreground pt-2">
              <strong>{t("userManagement.bulkUpload.exampleFormat")}:</strong> <br/>
              `John Doe,john@example.com,user,tenant-1` <br/>
              `Jane Smith,jane@example.com,user,tenant-2`
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">{t("common.cancel")}</Button></DialogClose>
            <Button onClick={handleProcessCsv}>{t("userManagement.bulkUpload.uploadButton")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
