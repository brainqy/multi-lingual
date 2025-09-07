
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, PlusCircle, Edit3, Trash2, Wand2, Copy, Loader2, Coins, Star, Zap, ShieldCheck, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PromoCode } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isPast } from "date-fns";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { DatePicker } from "@/components/ui/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createPromoCode, deletePromoCode, getPromoCodes, updatePromoCode } from "@/lib/actions/promo-codes";
import { Checkbox } from "@/components/ui/checkbox";
import { MetricCard } from "@/components/dashboard/metric-card";

const promoCodeSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code cannot exceed 20 characters").transform(val => val.toUpperCase()),
  description: z.string().min(5, "Description must be at least 5 characters"),
  rewardType: z.enum(['coins', 'xp', 'premium_days', 'flash_coins', 'streak_freeze']),
  rewardValue: z.coerce.number().min(1, "Reward value must be at least 1"),
  expiresAt: z.date().optional(),
  usageLimit: z.coerce.number().min(0, "Usage limit cannot be negative").default(0),
  isActive: z.boolean().default(true),
  isPlatformWide: z.boolean().default(false),
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

const generatorSchema = z.object({
  prefix: z.string().min(1, "Prefix is required").max(10, "Prefix cannot exceed 10 characters").transform(val => val.toUpperCase()),
  count: z.coerce.number().min(1, "Must generate at least 1 code").max(100, "Cannot generate more than 100 codes at once"),
  rewardType: z.enum(['coins', 'xp', 'premium_days', 'flash_coins', 'streak_freeze']),
  rewardValue: z.coerce.number().min(1, "Reward value must be at least 1"),
  expiresAt: z.date().optional(),
});

type GeneratorFormData = z.infer<typeof generatorSchema>;

export default function PromoCodeManagementPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();
  const { user: currentUser } = useAuth();

  const [isGeneratorDialogOpen, setIsGeneratorDialogOpen] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const codes = await getPromoCodes();
    setPromoCodes(codes);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { rewardType: 'coins', isActive: true, usageLimit: 0 },
  });
  
  const { control: generatorControl, handleSubmit: handleGeneratorSubmit, reset: resetGeneratorForm, formState: { errors: generatorErrors } } = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorSchema),
    defaultValues: { prefix: 'ONETIME', count: 10, rewardType: 'coins', rewardValue: 10 },
  });

  const stats = useMemo(() => {
    const totalCodes = promoCodes.length;
    const totalRedemptions = promoCodes.reduce((sum, code) => sum + (code.timesUsed || 0), 0);
    
    const isAvailable = (code: PromoCode) => {
      return code.isActive &&
             (!code.expiresAt || !isPast(new Date(code.expiresAt))) &&
             (code.usageLimit === 0 || (code.timesUsed || 0) < code.usageLimit);
    };

    const typeStats = promoCodes.reduce((acc, code) => {
      const type = code.rewardType;
      if (!acc[type]) {
        acc[type] = { total: 0, available: 0 };
      }
      acc[type].total += 1;
      if (isAvailable(code)) {
        acc[type].available += 1;
      }
      return acc;
    }, {} as Record<string, { total: number, available: number }>);

    return {
      totalCodes,
      totalRedemptions,
      coins: typeStats['coins'] || { total: 0, available: 0 },
      xp: typeStats['xp'] || { total: 0, available: 0 },
      flash_coins: typeStats['flash_coins'] || { total: 0, available: 0 },
      streak_freeze: typeStats['streak_freeze'] || { total: 0, available: 0 },
      premium_days: typeStats['premium_days'] || { total: 0, available: 0 },
    };
  }, [promoCodes]);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
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
      isPlatformWide: false,
    });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (code: PromoCode) => {
    setEditingCode(code);
    reset({
        ...code,
        expiresAt: code.expiresAt ? new Date(code.expiresAt) : undefined,
        isPlatformWide: code.tenantId === 'platform',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: PromoCodeFormData) => {
    if (!currentUser) return;
    
    const tenantId = currentUser.role === 'admin' && data.isPlatformWide ? 'platform' : currentUser.tenantId;

    const newCodeData: Omit<PromoCode, 'id' | 'timesUsed' | 'createdAt'> = {
      ...data,
      tenantId: tenantId,
      expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
    };

    if (editingCode) {
      const updatedCode = await updatePromoCode(editingCode.id, newCodeData);
      if (updatedCode) {
        setPromoCodes(prev => prev.map(c => c.id === editingCode.id ? updatedCode : c));
        toast({ title: t("promoCodes.toast.updated.title"), description: t("promoCodes.toast.updated.description", { code: data.code }) });
      } else {
        toast({ title: "Update Failed", description: `Could not update the code "${data.code}".`, variant: "destructive" });
      }
    } else {
       if (promoCodes.some(c => c.code === data.code)) {
        toast({ title: t("promoCodes.toast.exists.title"), description: t("promoCodes.toast.exists.description", { code: data.code }), variant: "destructive" });
        return;
      }
      const newCode = await createPromoCode(newCodeData);
      if (newCode) {
        setPromoCodes(prev => [newCode, ...prev]);
        toast({ title: t("promoCodes.toast.created.title"), description: t("promoCodes.toast.created.description", { code: data.code }) });
      } else {
        toast({ title: "Creation Failed", description: `Could not create the code "${data.code}". Please check the logs.`, variant: "destructive" });
      }
    }
    setIsDialogOpen(false);
  };
  
  const handleDelete = async (id: string) => {
    const success = await deletePromoCode(id);
    if (success) {
      setPromoCodes(prev => prev.filter(c => c.id !== id));
      toast({ title: t("promoCodes.toast.deleted.title"), variant: "destructive" });
    }
  };

  const onGeneratorSubmit = async (data: GeneratorFormData) => {
    if (!currentUser) return;
    const newCodeStrings: string[] = [];
    let createdCount = 0;
    for (let i = 0; i < data.count; i++) {
      const uniquePart = Math.random().toString(36).substring(2, 10).toUpperCase();
      const code = `${data.prefix}-${uniquePart}`;
      const newPromoCodeData: Omit<PromoCode, 'id' | 'timesUsed' | 'createdAt'> = {
        tenantId: currentUser.tenantId, // Generated codes are for the current tenant
        code,
        description: `One-time use code (${data.rewardValue} ${data.rewardType})`,
        rewardType: data.rewardType,
        rewardValue: data.rewardValue,
        expiresAt: data.expiresAt?.toISOString(),
        usageLimit: 1,
        isActive: true,
      };
      const created = await createPromoCode(newPromoCodeData);
      if (created) {
        newCodeStrings.push(code);
        createdCount++;
      }
    }
    setGeneratedCodes(newCodeStrings);
    setIsGeneratorDialogOpen(false);
    setIsResultsDialogOpen(true);
    toast({ title: t("promoCodes.toast.generated.title", { count: createdCount }), description: t("promoCodes.toast.generated.description") });
    fetchData(); // Refresh the list
  };
  
  const handleCopyGeneratedCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    toast({ title: t("promoCodes.toast.copied.title"), description: t("promoCodes.toast.copied.description") });
  };

  const PromoCodeCard = ({ code }: { code: PromoCode }) => (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold font-mono">{code.code}</p>
            <p className="text-sm text-muted-foreground">{code.description}</p>
            <p className="text-xs text-muted-foreground mt-1">Scope: {code.tenantId === 'platform' ? 'Platform-Wide' : `Tenant (${code.tenantId})`}</p>
          </div>
          <span className={`px-2 py-0.5 text-xs rounded-full capitalize shrink-0 ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {code.isActive ? t("promoCodes.status.active") : t("promoCodes.status.inactive")}
          </span>
        </div>
        <div className="text-sm text-muted-foreground space-y-1 border-t pt-3">
          <p><strong>{t("promoCodes.rewardLabel")}:</strong> {code.rewardValue} {t(`promoCodes.rewardTypes.${code.rewardType}`)}</p>
          <p><strong>{t("promoCodes.usageLabel")}:</strong> {code.timesUsed || 0} / {code.usageLimit === 0 ? '∞' : code.usageLimit}</p>
          <p><strong>{t("promoCodes.expiresLabel")}:</strong> {code.expiresAt ? format(new Date(code.expiresAt), 'PP') : t("promoCodes.status.never")}</p>
        </div>
        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={() => openEditDialog(code)}><Edit3 className="h-4 w-4 mr-1"/> {t("promoCodes.editButton")}</Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(code.id)}><Trash2 className="h-4 w-4 mr-1"/> {t("promoCodes.deleteButton")}</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Gift className="h-8 w-8" /> {t("promoCodes.title")}
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsGeneratorDialogOpen(true)} variant="outline" className="flex-1 sm:flex-initial">
            <Wand2 className="mr-2 h-4 w-4"/> {t("promoCodes.generateButton")}
          </Button>
          <Button onClick={openNewDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-initial">
            <PlusCircle className="mr-2 h-5 w-5" /> {t("promoCodes.createButton")}
          </Button>
        </div>
      </div>
      <CardDescription>
        {t("promoCodes.description")}
      </CardDescription>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={Gift} title="Total Codes" value={stats.totalCodes} />
        <MetricCard icon={CheckCircle} title="Total Redemptions" value={stats.totalRedemptions} />
        <MetricCard icon={Coins} title="Coin Codes" value={`${stats.coins.available} / ${stats.coins.total}`} description="Available / Total" />
        <MetricCard icon={Star} title="XP Codes" value={`${stats.xp.available} / ${stats.xp.total}`} description="Available / Total"/>
        <MetricCard icon={Zap} title="Flash Coin Codes" value={`${stats.flash_coins.available} / ${stats.flash_coins.total}`} description="Available / Total"/>
        <MetricCard icon={ShieldCheck} title="Streak Freeze Codes" value={`${stats.streak_freeze.available} / ${stats.streak_freeze.total}`} description="Available / Total"/>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("promoCodes.currentCodesTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : promoCodes.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">{t("promoCodes.noCodesFound")}</p>
          ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {promoCodes.map(code => <PromoCodeCard key={code.id} code={code} />)}
            </div>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("promoCodes.table.code")}</TableHead>
                    <TableHead>{t("promoCodes.table.description")}</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>{t("promoCodes.table.reward")}</TableHead>
                    <TableHead>{t("promoCodes.table.status")}</TableHead>
                    <TableHead>{t("promoCodes.table.usage")}</TableHead>
                    <TableHead>{t("promoCodes.table.expires")}</TableHead>
                    <TableHead className="text-right">{t("promoCodes.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map(code => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono">{code.code}</TableCell>
                      <TableCell>{code.description}</TableCell>
                      <TableCell>{code.tenantId === 'platform' ? 'Platform-Wide' : `Tenant (${code.tenantId})`}</TableCell>
                      <TableCell>{code.rewardValue} {t(`promoCodes.rewardTypes.${code.rewardType}`)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {code.isActive ? t("promoCodes.status.active") : t("promoCodes.status.inactive")}
                        </span>
                      </TableCell>
                      <TableCell>{code.timesUsed || 0} / {code.usageLimit === 0 ? '∞' : code.usageLimit}</TableCell>
                      <TableCell>{code.expiresAt ? format(new Date(code.expiresAt), 'PP') : t("promoCodes.status.never")}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(code)}><Edit3 className="h-4 w-4"/></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(code.id)}><Trash2 className="h-4 w-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCode ? t("promoCodes.dialog.editTitle") : t("promoCodes.dialog.createTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">{t("promoCodes.form.codeLabel")}</Label>
              <Controller name="code" control={control} render={({ field }) => <Input id="code" {...field} placeholder={t("promoCodes.form.codePlaceholder")} disabled={!!editingCode} />} />
              {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">{t("promoCodes.form.descriptionLabel")}</Label>
              <Controller name="description" control={control} render={({ field }) => <Input id="description" {...field} placeholder={t("promoCodes.form.descriptionPlaceholder")} />} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rewardType">{t("promoCodes.form.rewardTypeLabel")}</Label>
                <Controller name="rewardType" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder={t("promoCodes.form.rewardTypePlaceholder")}/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coins">{t("promoCodes.rewardTypes.coins")}</SelectItem>
                      <SelectItem value="flash_coins">{t("promoCodes.rewardTypes.flash_coins")}</SelectItem>
                      <SelectItem value="xp">{t("promoCodes.rewardTypes.xp")}</SelectItem>
                      <SelectItem value="premium_days">{t("promoCodes.rewardTypes.premium_days")}</SelectItem>
                      <SelectItem value="streak_freeze">Streak Freeze</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label htmlFor="rewardValue">{t("promoCodes.form.rewardValueLabel")}</Label>
                <Controller name="rewardValue" control={control} render={({ field }) => <Input id="rewardValue" type="number" {...field} />} />
                {errors.rewardValue && <p className="text-sm text-destructive mt-1">{errors.rewardValue.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <Label htmlFor="usageLimit">{t("promoCodes.form.usageLimitLabel")}</Label>
                <Controller name="usageLimit" control={control} render={({ field }) => <Input id="usageLimit" type="number" {...field} />} />
                {errors.usageLimit && <p className="text-sm text-destructive mt-1">{errors.usageLimit.message}</p>}
              </div>
              <div>
                <Label htmlFor="expiresAt">{t("promoCodes.form.expirationDateLabel")}</Label>
                <Controller name="expiresAt" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} placeholder={t("promoCodes.form.expirationDatePlaceholder")}/>} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Controller name="isActive" control={control} render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />} />
              <Label htmlFor="isActive">{t("promoCodes.form.activeLabel")}</Label>
            </div>
            {currentUser.role === 'admin' && (
              <div className="flex items-center space-x-2">
                <Controller name="isPlatformWide" control={control} render={({ field }) => <Checkbox id="isPlatformWide" checked={field.value} onCheckedChange={field.onChange} />} />
                <Label htmlFor="isPlatformWide">Make this a platform-wide code (available to all tenants)</Label>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">{t("common.cancel")}</Button></DialogClose>
              <Button type="submit">{editingCode ? t("promoCodes.dialog.saveButton") : t("promoCodes.dialog.createButton")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Generator Dialog */}
      <Dialog open={isGeneratorDialogOpen} onOpenChange={setIsGeneratorDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5"/> {t("promoCodes.generatorDialog.title")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGeneratorSubmit(onGeneratorSubmit)} className="space-y-4 py-4">
            <div>
                <Label htmlFor="prefix">{t("promoCodes.generatorDialog.prefixLabel")}</Label>
                <Controller name="prefix" control={generatorControl} render={({ field }) => <Input id="prefix" {...field} placeholder={t("promoCodes.generatorDialog.prefixPlaceholder")} />} />
                {generatorErrors.prefix && <p className="text-sm text-destructive mt-1">{generatorErrors.prefix.message}</p>}
            </div>
             <div>
                <Label htmlFor="count">{t("promoCodes.generatorDialog.countLabel")}</Label>
                <Controller name="count" control={generatorControl} render={({ field }) => <Input id="count" type="number" min="1" max="100" {...field} />} />
                {generatorErrors.count && <p className="text-sm text-destructive mt-1">{generatorErrors.count.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gen-rewardType">{t("promoCodes.form.rewardTypeLabel")}</Label>
                <Controller name="rewardType" control={generatorControl} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder={t("promoCodes.form.rewardTypePlaceholder")}/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coins">{t("promoCodes.rewardTypes.coins")}</SelectItem>
                      <SelectItem value="flash_coins">{t("promoCodes.rewardTypes.flash_coins")}</SelectItem>
                      <SelectItem value="xp">{t("promoCodes.rewardTypes.xp")}</SelectItem>
                      <SelectItem value="streak_freeze">Streak Freeze</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label htmlFor="gen-rewardValue">{t("promoCodes.form.rewardValueLabel")}</Label>
                <Controller name="rewardValue" control={generatorControl} render={({ field }) => <Input id="gen-rewardValue" type="number" {...field} />} />
                {generatorErrors.rewardValue && <p className="text-sm text-destructive mt-1">{generatorErrors.rewardValue.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="gen-expiresAt">{t("promoCodes.form.expirationDateLabel")}</Label>
              <Controller name="expiresAt" control={generatorControl} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} placeholder={t("promoCodes.form.expirationDatePlaceholder")}/>} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">{t("common.cancel")}</Button></DialogClose>
              <Button type="submit">{t("promoCodes.generatorDialog.generateButton")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Generated Codes Result Dialog */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t("promoCodes.resultsDialog.title", { count: generatedCodes.length })}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <ScrollArea className="h-64 border rounded p-2">
                    <pre className="text-sm font-mono">{generatedCodes.join('\n')}</pre>
                </ScrollArea>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={handleCopyGeneratedCodes}><Copy className="mr-2 h-4 w-4"/> {t("promoCodes.resultsDialog.copyButton")}</Button>
                <DialogClose asChild><Button>{t("promoCodes.resultsDialog.closeButton")}</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
