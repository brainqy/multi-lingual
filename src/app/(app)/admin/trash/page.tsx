
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, History, Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SoftDeletedItem } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { getTrashItems, restoreItem, hardDeleteItem, cleanTrash } from "@/lib/actions/trash";
import { format } from "date-fns";
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

export default function TrashPage() {
  const { user: currentUser } = useAuth();
  const [trashItems, setTrashItems] = useState<SoftDeletedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { t } = useI18n();

  const fetchTrash = useCallback(async () => {
    setIsLoading(true);
    const items = await getTrashItems();
    setTrashItems(items);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchTrash();
    }
  }, [currentUser, fetchTrash]);

  const handleRestore = (item: SoftDeletedItem) => {
    startTransition(async () => {
      const result = await restoreItem(item.id, item.type);
      if (result.success) {
        toast({ title: "Item Restored", description: `${item.type} "${item.name}" has been restored.` });
        fetchTrash();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  const handlePermanentDelete = (item: SoftDeletedItem) => {
    startTransition(async () => {
      const result = await hardDeleteItem(item.id, item.type);
      if (result.success) {
        toast({ title: "Item Permanently Deleted", description: `${item.type} "${item.name}" has been permanently removed.` });
        fetchTrash();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };
  
  const handleCleanTrash = () => {
    startTransition(async () => {
      const result = await cleanTrash();
      if (result.success) {
        toast({ title: "Trash Cleaned", description: `${result.count} items older than 30 days have been permanently deleted.`});
        fetchTrash();
      } else {
        toast({ title: "Error", description: "Could not clean the trash at this time.", variant: "destructive"});
      }
    });
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Trash2 className="h-8 w-8" /> Trash
        </h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button variant="destructive" disabled={isPending}>
              <Trash2 className="mr-2 h-4 w-4"/> Clean Trash
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clean Trash?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all items that have been in the trash for more than 30 days. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCleanTrash} className="bg-destructive hover:bg-destructive/90">
                Yes, Clean Trash
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <CardDescription>
        Items in the trash will be automatically and permanently deleted after 30 days.
      </CardDescription>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Deleted Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : trashItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">The trash is empty.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name / ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Deleted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trashItems.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`} className={isPending ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{format(new Date(item.deletedAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleRestore(item)} disabled={isPending}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isPending}>
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete "{item.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handlePermanentDelete(item)} className="bg-destructive hover:bg-destructive/90">
                              Delete Permanently
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
