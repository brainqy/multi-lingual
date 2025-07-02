
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PromoCode } from "@/types";
import { samplePromoCodes, sampleUserProfile } from "@/lib/sample-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { DatePicker } from "@/components/ui/date-picker";

const promoCodeSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code cannot exceed 20 characters").transform(val => val.toUpperCase()),
  description: z.string().min(5, "Description must be at least 5 characters"),
  rewardType: z.enum(['coins', 'xp', 'premium_days']),
  rewardValue: z.coerce.number().min(1, "Reward value must be at least 1"),
  expiresAt: z.date().optional(),
  usageLimit: z.coerce.number().min(0, "Usage limit cannot be negative").default(0),
  isActive: z.boolean().default(true),
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;


export default function PromoCodeManagementPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(samplePromoCodes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { rewardType: 'coins', isActive: true, usageLimit: 0 },
  });

  if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    return <AccessDeniedMessage />;
  }

  const openNewDialog = () => {
    setEditingCode(null);
    reset({
      code: '',
      description: '',
      rewardType: 'coins',
      rewardValue: 50,
      isActive: true,
      usageLimit: 0,
      expiresAt: undefined,
    });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (code: PromoCode) => {
    setEditingCode(code);
    reset({
        ...code,
        expiresAt: code.expiresAt ? parseISO(code.expiresAt) : undefined,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: PromoCodeFormData) => {
    if (editingCode) {
      const updatedCode = { ...editingCode, ...data, expiresAt: data.expiresAt?.toISOString() };
      setPromoCodes(prev => prev.map(c => c.id === editingCode.id ? updatedCode : c));
      const globalIndex = samplePromoCodes.findIndex(c => c.id === editingCode.id);
      if (globalIndex !== -1) samplePromoCodes[globalIndex] = updatedCode;
      toast({ title: "Promo Code Updated", description: `Code "${data.code}" has been updated.` });
    } else {
       if (promoCodes.some(c => c.code === data.code)) {
        toast({ title: "Code Exists", description: `The code "${data.code}" is already in use. Please choose another.`, variant: "destructive" });
        return;
      }
      const newCode: PromoCode = {
        ...data,
        id: `promo-${Date.now()}`,
        timesUsed: 0,
        expiresAt: data.expiresAt?.toISOString(),
      };
      setPromoCodes(prev => [newCode, ...prev]);
      samplePromoCodes.unshift(newCode);
      toast({ title: "Promo Code Created", description: `Code "${data.code}" has been created.` });
    }
    setIsDialogOpen(false);
  };
  
  const handleDelete = (id: string) => {
    setPromoCodes(prev => prev.filter(c => c.id !== id));
    const index = samplePromoCodes.findIndex(c => c.id === id);
    if (index > -1) samplePromoCodes.splice(index, 1);
    toast({ title: "Promo Code Deleted", variant: "destructive" });
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Gift className="h-8 w-8" /> Promo Code Management
        </h1>
        <Button onClick={openNewDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Code
        </Button>
      </div>
      <CardDescription>
        Manage promotional codes for rewards like bonus coins, XP, or premium access.
      </CardDescription>

      <Card>
        <CardHeader>
          <CardTitle>Current Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map(code => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono">{code.code}</TableCell>
                  <TableCell>{code.description}</TableCell>
                  <TableCell>{code.rewardValue} {code.rewardType}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{code.timesUsed || 0} / {code.usageLimit === 0 ? '∞' : code.usageLimit}</TableCell>
                  <TableCell>{code.expiresAt ? format(parseISO(code.expiresAt), 'PP') : 'Never'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(code)}><Edit3 className="h-4 w-4"/></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(code.id)}><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCode ? 'Edit' : 'Create'} Promo Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Promo Code</Label>
              <Controller name="code" control={control} render={({ field }) => <Input id="code" {...field} placeholder="e.g., WELCOME50" disabled={!!editingCode} />} />
              {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Controller name="description" control={control} render={({ field }) => <Input id="description" {...field} placeholder="e.g., Grants 50 bonus coins" />} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rewardType">Reward Type</Label>
                <Controller name="rewardType" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coins">Coins</SelectItem>
                      <SelectItem value="xp">XP</SelectItem>
                      <SelectItem value="premium_days">Premium Days</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label htmlFor="rewardValue">Reward Value</Label>
                <Controller name="rewardValue" control={control} render={({ field }) => <Input id="rewardValue" type="number" {...field} />} />
                {errors.rewardValue && <p className="text-sm text-destructive mt-1">{errors.rewardValue.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <Label htmlFor="usageLimit">Usage Limit (0 for unlimited)</Label>
                <Controller name="usageLimit" control={control} render={({ field }) => <Input id="usageLimit" type="number" {...field} />} />
                {errors.usageLimit && <p className="text-sm text-destructive mt-1">{errors.usageLimit.message}</p>}
              </div>
              <div>
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Controller name="expiresAt" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} placeholder="No Expiration"/>} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Controller name="isActive" control={control} render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />} />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">{editingCode ? 'Save Changes' : 'Create Code'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

