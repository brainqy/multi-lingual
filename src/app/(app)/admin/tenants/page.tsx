
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, PlusCircle, Edit3, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tenant } from "@/types"; 
import { useState, useEffect } from "react";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { getTenants, deleteTenant } from "@/lib/actions/tenants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    async function loadTenants() {
      setIsLoading(true);
      const fetchedTenants = await getTenants();
      setTenants(fetchedTenants);
      setIsLoading(false);
    }
    loadTenants();
  }, []);

  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const handleEditTenant = (tenantId: string) => {
    toast({ title: t("tenantManagement.editActionMock", { default: "Edit action for tenant {tenantId} is a mock.", tenantId}), description: "" });
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    const success = await deleteTenant(tenantId);
    if (success) {
      setTenants(prev => prev.filter(t => t.id !== tenantId));
      toast({ title: t("tenantManagement.deleteActionToast", { default: "Tenant '{tenantName}' and all its data have been removed.", tenantName}), variant: "destructive" });
    } else {
      toast({ title: "Error", description: `Could not delete tenant '${tenantName}'.`, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="h-8 w-8" /> {t("tenantManagement.title", { default: "Tenant Management" })}
        </h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/admin/tenant-onboarding">
              <PlusCircle className="mr-2 h-5 w-5" /> {t("tenantManagement.createNewButton", { default: "Create New Tenant" })}
            </Link>
        </Button>
      </div>
      <CardDescription>{t("tenantManagement.description", { default: "Oversee and manage all organizational tenants on the platform." })}</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("tenantManagement.tenantListTitle", { default: "Current Tenants" })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : tenants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("tenantManagement.noTenantsFound", { default: "No tenants have been onboarded yet. Click 'Create New Tenant' to get started." })}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tenantManagement.table.name", { default: "Tenant Name" })}</TableHead>
                  <TableHead>{t("tenantManagement.table.id", { default: "Tenant ID" })}</TableHead>
                  <TableHead>{t("tenantManagement.table.createdAt", { default: "Created On" })}</TableHead>
                  <TableHead>{t("tenantManagement.table.publicSignup", { default: "Public Signup" })}</TableHead>
                  <TableHead className="text-right">{t("tenantManagement.table.actions", { default: "Actions" })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.id}</TableCell>
                    <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{tenant.settings?.allowPublicSignup ? 'Enabled' : 'Disabled'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTenant(tenant.id)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the tenant "{tenant.name}" and all associated users and data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTenant(tenant.id, tenant.name)} className="bg-destructive hover:bg-destructive/90">
                              Delete Tenant
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
