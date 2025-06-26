"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Edit3, Trash2, UserCog, UserCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, UserRole, UserStatus, Tenant } from "@/types";
import { samplePlatformUsers, sampleTenants, ensureFullUserProfile } from "@/lib/sample-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";

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

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const [users, setUsers] = useState<UserProfile[]>(samplePlatformUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    // This effect ensures that any global changes to sample data are reflected locally.
    setUsers(samplePlatformUsers);
  }, []);

  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.tenantId && user.tenantId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const openNewUserDialog = () => {
    setEditingUser(null);
    reset({ name: '', email: '', role: 'user', status: 'active', tenantId: '', password: '' });
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
      // Update existing user
      const updatedUser: UserProfile = { ...editingUser, ...data, role: data.role as UserRole, status: data.status as UserStatus };
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      const globalIndex = samplePlatformUsers.findIndex(u => u.id === editingUser.id);
      if (globalIndex !== -1) samplePlatformUsers[globalIndex] = updatedUser;
      toast({ title: "User Updated", description: `Details for ${data.name} have been updated.` });
    } else {
      // Create new user
      if (!data.password || data.password.length < 8) {
        toast({ title: "Password Required", description: "A password of at least 8 characters is required for new users.", variant: "destructive" });
        return;
      }
      const newUser = ensureFullUserProfile({
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        tenantId: data.tenantId,
        status: data.status as UserStatus,
        createdAt: new Date().toISOString(),
      });
      setUsers(prev => [newUser, ...prev]);
      samplePlatformUsers.push(newUser); // Add to global for persistence
      toast({ title: "User Created", description: `User ${data.name} has been created.` });
    }
    setIsFormDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
        toast({ title: "Action Forbidden", description: "You cannot delete your own account.", variant: "destructive" });
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    const globalIndex = samplePlatformUsers.findIndex(u => u.id === userId);
    if (globalIndex !== -1) samplePlatformUsers.splice(globalIndex, 1);
    toast({ title: "User Deleted", description: "The user has been removed from the system.", variant: "destructive" });
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserCog className="h-8 w-8" /> User Management
        </h1>
        <Button onClick={openNewUserDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New User
        </Button>
      </div>
      <CardDescription>View, create, edit, and manage all user accounts on the platform.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <div className="mt-2">
            <Input
              placeholder="Search users (name, email, tenant ID)..."
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
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
                  <TableCell>{getTenantName(user.tenantId)}</TableCell>
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
                         <Button variant="destructive" size="sm" disabled={user.id === currentUser.id}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                           <AlertDialogDescription>
                             This action cannot be undone. This will permanently delete the user account for {user.name}.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete User</AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} />} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            {!editingUser && (
              <div>
                <Label htmlFor="password">Initial Password</Label>
                <Controller name="password" control={control} render={({ field }) => <Input id="password" type="password" {...field} />} />
                <p className="text-xs text-muted-foreground mt-1">Required for new users. Must be at least 8 characters.</p>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Controller name="role" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div>
              <Label htmlFor="tenantId">Tenant</Label>
              <Controller name="tenantId" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="tenantId"><SelectValue placeholder="Select a tenant for this user" /></SelectTrigger>
                  <SelectContent>
                    {sampleTenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
              {errors.tenantId && <p className="text-sm text-destructive mt-1">{errors.tenantId.message}</p>}
            </div>

            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingUser ? "Save Changes" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
