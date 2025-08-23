
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Star, PlusCircle, Edit3, Trash2, ListChecks, HelpCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Badge, GamificationRule } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as LucideIcons from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { getBadges, createBadge, updateBadge, deleteBadge, getGamificationRules, createGamificationRule, updateGamificationRule, deleteGamificationRule } from "@/lib/actions/gamification";
import { useAuth } from "@/hooks/use-auth";

type IconName = keyof typeof LucideIcons;

const badgeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Badge name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  icon: z.string().min(1, "Icon name is required"), 
  xpReward: z.coerce.number().min(0, "XP Reward must be non-negative").default(0),
  triggerCondition: z.string().min(5, "Trigger condition must be described"),
});

type BadgeFormData = z.infer<typeof badgeSchema>;

const xpRuleSchema = z.object({
  actionId: z.string().min(1, "Action ID is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  xpPoints: z.coerce.number().min(0, "XP points must be non-negative"),
});

type XpRuleFormData = z.infer<typeof xpRuleSchema>;


export default function GamificationRulesPage() {
  const { t } = useI18n();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [xpRules, setXpRules] = useState<GamificationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [isXpRuleDialogOpen, setIsXpRuleDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [editingXpRule, setEditingXpRule] = useState<GamificationRule | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const { control: badgeControl, handleSubmit: handleBadgeSubmit, reset: resetBadgeForm, setValue: setBadgeValue, formState: { errors: badgeErrors } } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: { name: '', description: '', icon: 'Award', xpReward: 0, triggerCondition: '' }
  });

  const { control: xpRuleControl, handleSubmit: handleXpRuleSubmit, reset: resetXpRuleForm, setValue: setXpRuleValue, formState: { errors: xpRuleErrors } } = useForm<XpRuleFormData>({
    resolver: zodResolver(xpRuleSchema),
    defaultValues: { actionId: '', description: '', xpPoints: 0 }
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [fetchedBadges, fetchedRules] = await Promise.all([
      getBadges(),
      getGamificationRules(),
    ]);
    setBadges(fetchedBadges);
    setXpRules(fetchedRules);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const onBadgeFormSubmit = async (data: BadgeFormData) => {
    if (editingBadge) {
      const updated = await updateBadge(editingBadge.id, data);
      if(updated) {
        setBadges(prev => prev.map(b => b.id === editingBadge.id ? updated : b));
        toast({ title: t("gamificationRules.toast.badgeUpdated.title"), description: t("gamificationRules.toast.badgeUpdated.description", { name: data.name }) });
      }
    } else {
      const created = await createBadge(data);
      if (created) {
        setBadges(prev => [created, ...prev]);
        toast({ title: t("gamificationRules.toast.badgeCreated.title"), description: t("gamificationRules.toast.badgeCreated.description", { name: data.name }) });
      }
    }
    setIsBadgeDialogOpen(false);
    resetBadgeForm();
    setEditingBadge(null);
  };

  const onXpRuleFormSubmit = async (data: XpRuleFormData) => {
    if (editingXpRule) {
      const updated = await updateGamificationRule(editingXpRule.actionId, { description: data.description, xpPoints: data.xpPoints });
      if (updated) {
        setXpRules(prev => prev.map(r => r.actionId === editingXpRule.actionId ? updated : r));
        toast({ title: t("gamificationRules.toast.xpRuleUpdated.title"), description: t("gamificationRules.toast.xpRuleUpdated.description", { description: data.description }) });
      }
    } else {
      if (xpRules.some(r => r.actionId === data.actionId)) {
          toast({ title: t("gamificationRules.toast.error.title"), description: t("gamificationRules.toast.error.description", { actionId: data.actionId }), variant: "destructive" });
          return;
      }
      const created = await createGamificationRule(data);
      if (created) {
        setXpRules(prev => [created, ...prev]);
        toast({ title: t("gamificationRules.toast.xpRuleCreated.title"), description: t("gamificationRules.toast.xpRuleCreated.description", { description: data.description }) });
      }
    }
    setIsXpRuleDialogOpen(false);
    resetXpRuleForm();
    setEditingXpRule(null);
  };


  const openNewBadgeDialog = () => {
    setEditingBadge(null);
    resetBadgeForm({ name: '', description: '', icon: 'Award', xpReward: 0, triggerCondition: '' });
    setIsBadgeDialogOpen(true);
  };

  const openEditBadgeDialog = (badge: Badge) => {
    setEditingBadge(badge);
    setBadgeValue('name', badge.name);
    setBadgeValue('description', badge.description);
    setBadgeValue('icon', badge.icon);
    setBadgeValue('xpReward', badge.xpReward || 0);
    setBadgeValue('triggerCondition', badge.triggerCondition || '');
    setBadgeValue('id', badge.id);
    setIsBadgeDialogOpen(true);
  };

  const handleDeleteBadge = async (badgeId: string) => {
    const success = await deleteBadge(badgeId);
    if (success) {
      setBadges(prev => prev.filter(b => b.id !== badgeId));
      toast({ title: t("gamificationRules.toast.badgeDeleted.title"), description: t("gamificationRules.toast.badgeDeleted.description"), variant: "destructive" });
    }
  };

  const openNewXpRuleDialog = () => {
    setEditingXpRule(null);
    resetXpRuleForm({ actionId: '', description: '', xpPoints: 0 });
    setIsXpRuleDialogOpen(true);
  };

  const openEditXpRuleDialog = (rule: GamificationRule) => {
    setEditingXpRule(rule);
    setXpRuleValue('actionId', rule.actionId);
    setXpRuleValue('description', rule.description);
    setXpRuleValue('xpPoints', rule.xpPoints);
    setIsXpRuleDialogOpen(true);
  };

  const handleDeleteXpRule = async (actionId: string) => {
    const success = await deleteGamificationRule(actionId);
    if (success) {
      setXpRules(prev => prev.filter(r => r.actionId !== actionId));
      toast({ title: t("gamificationRules.toast.xpRuleDeleted.title"), description: t("gamificationRules.toast.xpRuleDeleted.description"), variant: "destructive" });
    }
  };

  function DynamicIcon({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) {
    const IconComponent = LucideIcons[name] as React.ElementType;
    if (!IconComponent) return <LucideIcons.HelpCircle {...props} />; 
    return <IconComponent {...props} />;
  }

  const BadgeCard = ({ badge }: { badge: Badge }) => (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                <DynamicIcon name={badge.icon as IconName} className="h-6 w-6 text-primary" />
                <p className="font-bold">{badge.name}</p>
            </div>
            <p className="text-sm font-semibold text-yellow-500">+{badge.xpReward || 0} XP</p>
        </div>
        <p className="text-sm text-muted-foreground">{badge.description}</p>
        <p className="text-xs text-muted-foreground italic"><strong>{t("gamificationRules.table.trigger")}:</strong> {badge.triggerCondition || 'N/A'}</p>
        <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => openEditBadgeDialog(badge)}>
                <Edit3 className="h-4 w-4 mr-1" /> {t("gamificationRules.badgeConfig.editButton")}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteBadge(badge.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> {t("gamificationRules.badgeConfig.deleteButton")}
            </Button>
        </div>
      </CardContent>
    </Card>
  );

  const XpRuleCard = ({ rule }: { rule: GamificationRule }) => (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">{rule.description}</p>
              <p className="font-mono text-xs text-muted-foreground">{rule.actionId}</p>
            </div>
            <p className="text-sm font-semibold text-yellow-500">+{rule.xpPoints} XP</p>
        </div>
        <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => openEditXpRuleDialog(rule)}>
                <Edit3 className="h-4 w-4 mr-1" /> {t("gamificationRules.badgeConfig.editButton")}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteXpRule(rule.actionId)}>
                <Trash2 className="h-4 w-4 mr-1" /> {t("gamificationRules.badgeConfig.deleteButton")}
            </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ListChecks className="h-8 w-8" /> {t("gamificationRules.title")}
        </h1>
      </div>
      <CardDescription>{t("gamificationRules.description")}</CardDescription>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2"><Award className="h-6 w-6 text-primary"/> {t("gamificationRules.badgeConfig.title")}</CardTitle>
            <CardDescription>{t("gamificationRules.badgeConfig.description")}</CardDescription>
          </div>
          <Button onClick={openNewBadgeDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> {t("gamificationRules.badgeConfig.createButton")}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : badges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("gamificationRules.badgeConfig.noBadges")}</p>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
              </div>
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("gamificationRules.table.icon")}</TableHead>
                      <TableHead>{t("gamificationRules.table.name")}</TableHead>
                      <TableHead>{t("gamificationRules.table.description")}</TableHead>
                      <TableHead>{t("gamificationRules.table.xpReward")}</TableHead>
                      <TableHead>{t("gamificationRules.table.trigger")}</TableHead>
                      <TableHead className="text-right">{t("gamificationRules.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {badges.map((badge) => (
                      <TableRow key={badge.id}>
                        <TableCell><DynamicIcon name={badge.icon as IconName} className="h-6 w-6 text-primary" /></TableCell>
                        <TableCell className="font-medium">{badge.name}</TableCell>
                        <TableCell>{badge.description}</TableCell>
                        <TableCell>{badge.xpReward || 0}</TableCell>
                        <TableCell>{badge.triggerCondition || 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditBadgeDialog(badge)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteBadge(badge.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
           <div>
             <CardTitle className="flex items-center gap-2"><Star className="h-6 w-6 text-primary"/> {t("gamificationRules.xpRules.title")}</CardTitle>
             <CardDescription>{t("gamificationRules.xpRules.description")}</CardDescription>
           </div>
           <Button onClick={openNewXpRuleDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             <PlusCircle className="mr-2 h-5 w-5" /> {t("gamificationRules.xpRules.createButton")}
           </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : xpRules.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">{t("gamificationRules.xpRules.noRules")}</p>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {xpRules.map((rule) => <XpRuleCard key={rule.actionId} rule={rule} />)}
              </div>
              {/* Desktop View */}
              <div className="hidden md:block">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>{t("gamificationRules.table.actionId")}</TableHead>
                       <TableHead>{t("gamificationRules.table.description")}</TableHead>
                       <TableHead>{t("gamificationRules.table.xpPoints")}</TableHead>
                       <TableHead className="text-right">{t("gamificationRules.table.actions")}</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {xpRules.map((rule) => (
                       <TableRow key={rule.actionId}>
                         <TableCell className="font-mono">{rule.actionId}</TableCell>
                         <TableCell>{rule.description}</TableCell>
                         <TableCell>{rule.xpPoints}</TableCell>
                         <TableCell className="text-right space-x-2">
                           <Button variant="outline" size="sm" onClick={() => openEditXpRuleDialog(rule)}>
                             <Edit3 className="h-4 w-4" />
                           </Button>
                           <Button variant="destructive" size="sm" onClick={() => handleDeleteXpRule(rule.actionId)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
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

      <Dialog open={isBadgeDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingBadge(null); resetBadgeForm(); } setIsBadgeDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-primary"/> {editingBadge ? t("gamificationRules.dialog.editBadgeTitle") : t("gamificationRules.dialog.createBadgeTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBadgeSubmit(onBadgeFormSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="badge-name" className="flex items-center gap-1">{t("gamificationRules.dialog.badgeNameLabel")}
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>{t("gamificationRules.dialog.badgeNameTooltip")}</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="name" control={badgeControl} render={({ field }) => <Input id="badge-name" {...field} />} />
              {badgeErrors.name && <p className="text-sm text-destructive mt-1">{badgeErrors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="badge-description" className="flex items-center gap-1">{t("gamificationRules.dialog.descriptionLabel")}
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>{t("gamificationRules.dialog.descriptionTooltip")}</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="description" control={badgeControl} render={({ field }) => <Textarea id="badge-description" {...field} />} />
               {badgeErrors.description && <p className="text-sm text-destructive mt-1">{badgeErrors.description.message}</p>}
            </div>
             <div>
              <Label htmlFor="badge-icon" className="flex items-center gap-1">{t("gamificationRules.dialog.iconNameLabel")}
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>{t("gamificationRules.dialog.iconNameTooltip")}</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="icon" control={badgeControl} render={({ field }) => <Input id="badge-icon" placeholder={t("gamificationRules.dialog.iconNamePlaceholder")} {...field} />} />
              {badgeErrors.icon && <p className="text-sm text-destructive mt-1">{badgeErrors.icon.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">{t("gamificationRules.dialog.iconNameHelpText")} <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">lucide.dev/icons</a>.</p>
            </div>
            <div>
              <Label htmlFor="badge-xpReward" className="flex items-center gap-1">{t("gamificationRules.dialog.xpRewardLabel")}
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>{t("gamificationRules.dialog.xpRewardTooltip")}</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="xpReward" control={badgeControl} render={({ field }) => <Input id="badge-xpReward" type="number" min="0" {...field} />} />
               {badgeErrors.xpReward && <p className="text-sm text-destructive mt-1">{badgeErrors.xpReward.message}</p>}
            </div>
            <div>
              <Label htmlFor="badge-triggerCondition" className="flex items-center gap-1">{t("gamificationRules.dialog.triggerConditionLabel")}
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>{t("gamificationRules.dialog.triggerConditionTooltip")}</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="triggerCondition" control={badgeControl} render={({ field }) => <Textarea id="badge-triggerCondition" placeholder={t("gamificationRules.dialog.triggerConditionPlaceholder")} {...field} />} />
               {badgeErrors.triggerCondition && <p className="text-sm text-destructive mt-1">{badgeErrors.triggerCondition.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel")}</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingBadge ? t("gamificationRules.dialog.saveChangesButton") : t("gamificationRules.dialog.createButton")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isXpRuleDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingXpRule(null); resetXpRuleForm(); } setIsXpRuleDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-[525px]">
           <DialogHeader>
             <DialogTitle className="text-2xl flex items-center gap-2">
               <Star className="h-6 w-6 text-primary"/> {editingXpRule ? t("gamificationRules.dialog.editXpRuleTitle") : t("gamificationRules.dialog.createXpRuleTitle")}
            </DialogTitle>
          </DialogHeader>
           <form onSubmit={handleXpRuleSubmit(onXpRuleFormSubmit)} className="space-y-4 py-4">
             <div>
               <Label htmlFor="xp-actionId" className="flex items-center gap-1">{t("gamificationRules.dialog.actionIdLabel")}
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>{t("gamificationRules.dialog.actionIdTooltip")}</p></TooltipContent>
                 </Tooltip>
               </Label>
               <Controller name="actionId" control={xpRuleControl} render={({ field }) => <Input id="xp-actionId" placeholder={t("gamificationRules.dialog.actionIdPlaceholder")} {...field} disabled={!!editingXpRule} />} />
               {xpRuleErrors.actionId && <p className="text-sm text-destructive mt-1">{xpRuleErrors.actionId.message}</p>}
               {!editingXpRule && <p className="text-xs text-muted-foreground mt-1">{t("gamificationRules.dialog.actionIdHelpText")}</p>}
             </div>
             <div>
               <Label htmlFor="xp-description" className="flex items-center gap-1">{t("gamificationRules.dialog.ruleDescriptionLabel")}
                <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>{t("gamificationRules.dialog.ruleDescriptionTooltip")}</p></TooltipContent>
                 </Tooltip>
               </Label>
               <Controller name="description" control={xpRuleControl} render={({ field }) => <Input id="xp-description" placeholder={t("gamificationRules.dialog.ruleDescriptionPlaceholder")} {...field} />} />
                {xpRuleErrors.description && <p className="text-sm text-destructive mt-1">{xpRuleErrors.description.message}</p>}
             </div>
             <div>
               <Label htmlFor="xp-xpPoints" className="flex items-center gap-1">{t("gamificationRules.dialog.xpPointsLabel")}
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>{t("gamificationRules.dialog.xpPointsTooltip")}</p></TooltipContent>
                 </Tooltip>
               </Label>
               <Controller name="xpPoints" control={xpRuleControl} render={({ field }) => <Input id="xp-xpPoints" type="number" min="0" {...field} />} />
                {xpRuleErrors.xpPoints && <p className="text-sm text-destructive mt-1">{xpRuleErrors.xpPoints.message}</p>}
             </div>
             <DialogFooter>
               <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel")}</Button></DialogClose>
               <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingXpRule ? t("gamificationRules.dialog.saveChangesButton") : t("gamificationRules.dialog.createButton")}</Button>
             </DialogFooter>
           </form>
         </DialogContent>
       </Dialog>

    </div>
    </TooltipProvider>
  );
}

    