
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Star, PlusCircle, Edit3, Trash2, ListChecks, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Badge, GamificationRule } from "@/types";
import { sampleBadges as initialBadges, sampleXpRules as initialXpRules, sampleUserProfile } from "@/lib/sample-data";
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
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [xpRules, setXpRules] = useState<GamificationRule[]>(initialXpRules);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [isXpRuleDialogOpen, setIsXpRuleDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [editingXpRule, setEditingXpRule] = useState<GamificationRule | null>(null);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const { control: badgeControl, handleSubmit: handleBadgeSubmit, reset: resetBadgeForm, setValue: setBadgeValue, formState: { errors: badgeErrors } } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
        name: '',
        description: '',
        icon: 'Award',
        xpReward: 0,
        triggerCondition: ''
    }
  });

  const { control: xpRuleControl, handleSubmit: handleXpRuleSubmit, reset: resetXpRuleForm, setValue: setXpRuleValue, formState: { errors: xpRuleErrors } } = useForm<XpRuleFormData>({
    resolver: zodResolver(xpRuleSchema),
    defaultValues: {
        actionId: '',
        description: '',
        xpPoints: 0
    }
  });

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const onBadgeFormSubmit = (data: BadgeFormData) => {
    if (editingBadge) {
      setBadges(prev => prev.map(b => b.id === editingBadge.id ? { ...b, ...data } : b));
      toast({ title: "Badge Updated", description: `Badge "${data.name}" updated.` });
    } else {
      const newBadge: Badge = { ...data, id: `badge-${Date.now()}` };
      setBadges(prev => [newBadge, ...prev]);
      toast({ title: "Badge Created", description: `Badge "${data.name}" created.` });
    }
    setIsBadgeDialogOpen(false);
    resetBadgeForm();
    setEditingBadge(null);
  };

  const onXpRuleFormSubmit = (data: XpRuleFormData) => {
    if (editingXpRule) {
        setXpRules(prev => prev.map(r => r.actionId === editingXpRule.actionId ? { ...r, description: data.description, xpPoints: data.xpPoints } : r));
        toast({ title: "XP Rule Updated", description: `Rule "${data.description}" updated.` });
    } else {
        if (xpRules.some(r => r.actionId === data.actionId)) {
            toast({ title: "Error", description: `Action ID "${data.actionId}" already exists. Choose a unique ID.`, variant: "destructive" });
            return;
        }
        const newRule: GamificationRule = { ...data };
        setXpRules(prev => [newRule, ...prev]);
        toast({ title: "XP Rule Created", description: `Rule "${data.description}" created.` });
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

  const handleDeleteBadge = (badgeId: string) => {
    setBadges(prev => prev.filter(b => b.id !== badgeId));
    toast({ title: "Badge Deleted", description: "Badge configuration removed.", variant: "destructive" });
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

  const handleDeleteXpRule = (actionId: string) => {
    setXpRules(prev => prev.filter(r => r.actionId !== actionId));
    toast({ title: "XP Rule Deleted", description: "XP rule removed.", variant: "destructive" });
  };

  function DynamicIcon({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) {
    const IconComponent = LucideIcons[name] as React.ElementType;
    if (!IconComponent) return <LucideIcons.HelpCircle {...props} />; 
    return <IconComponent {...props} />;
  }

  return (
    <TooltipProvider>
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <ListChecks className="h-8 w-8" /> Gamification Rules
      </h1>
      <CardDescription>Define and manage badges and XP points awarded for user actions.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Award className="h-6 w-6 text-primary"/> Badge Configuration</CardTitle>
            <CardDescription>Create, edit, or delete badges awarded to users.</CardDescription>
          </div>
          <Button onClick={openNewBadgeDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> Create Badge
          </Button>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No badges configured yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>XP Reward</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2"><Star className="h-6 w-6 text-primary"/> XP Point Rules</CardTitle>
             <CardDescription>Define how many XP points users earn for specific actions.</CardDescription>
           </div>
           <Button onClick={openNewXpRuleDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             <PlusCircle className="mr-2 h-5 w-5" /> Create XP Rule
           </Button>
        </CardHeader>
        <CardContent>
          {xpRules.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">No XP rules configured yet.</p>
          ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Action ID</TableHead>
                   <TableHead>Description</TableHead>
                   <TableHead>XP Points</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
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
           )}
        </CardContent>
      </Card>

      <Dialog open={isBadgeDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingBadge(null); resetBadgeForm(); } setIsBadgeDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-primary"/> {editingBadge ? "Edit Badge" : "Create New Badge"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBadgeSubmit(onBadgeFormSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="badge-name" className="flex items-center gap-1">Badge Name
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>A short, descriptive name for the badge.</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="name" control={badgeControl} render={({ field }) => <Input id="badge-name" {...field} />} />
              {badgeErrors.name && <p className="text-sm text-destructive mt-1">{badgeErrors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="badge-description" className="flex items-center gap-1">Description
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>What this badge represents and how it's earned.</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="description" control={badgeControl} render={({ field }) => <Textarea id="badge-description" {...field} />} />
               {badgeErrors.description && <p className="text-sm text-destructive mt-1">{badgeErrors.description.message}</p>}
            </div>
             <div>
              <Label htmlFor="badge-icon" className="flex items-center gap-1">Icon Name (from Lucide)
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>Enter a valid icon name from lucide.dev/icons. Example: UserCheck, Award.</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="icon" control={badgeControl} render={({ field }) => <Input id="badge-icon" placeholder="e.g., UserCheck, Award" {...field} />} />
              {badgeErrors.icon && <p className="text-sm text-destructive mt-1">{badgeErrors.icon.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Enter a valid icon name from <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">lucide.dev/icons</a>.</p>
            </div>
            <div>
              <Label htmlFor="badge-xpReward" className="flex items-center gap-1">XP Reward
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>Optional XP points awarded when this badge is earned.</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="xpReward" control={badgeControl} render={({ field }) => <Input id="badge-xpReward" type="number" min="0" {...field} />} />
               {badgeErrors.xpReward && <p className="text-sm text-destructive mt-1">{badgeErrors.xpReward.message}</p>}
            </div>
            <div>
              <Label htmlFor="badge-triggerCondition" className="flex items-center gap-1">Trigger Condition
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent><p>Describe the specific action or achievement that earns this badge.</p></TooltipContent>
                </Tooltip>
              </Label>
              <Controller name="triggerCondition" control={badgeControl} render={({ field }) => <Textarea id="badge-triggerCondition" placeholder="Describe how this badge is earned..." {...field} />} />
               {badgeErrors.triggerCondition && <p className="text-sm text-destructive mt-1">{badgeErrors.triggerCondition.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingBadge ? "Save Changes" : "Create Badge"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isXpRuleDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingXpRule(null); resetXpRuleForm(); } setIsXpRuleDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-[525px]">
           <DialogHeader>
             <DialogTitle className="text-2xl flex items-center gap-2">
               <Star className="h-6 w-6 text-primary"/> {editingXpRule ? "Edit XP Rule" : "Create New XP Rule"}
            </DialogTitle>
          </DialogHeader>
           <form onSubmit={handleXpRuleSubmit(onXpRuleFormSubmit)} className="space-y-4 py-4">
             <div>
               <Label htmlFor="xp-actionId" className="flex items-center gap-1">Action ID
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>A unique system identifier for the action (e.g., profile_complete). Cannot be changed after creation.</p></TooltipContent>
                 </Tooltip>
               </Label>
               <Controller name="actionId" control={xpRuleControl} render={({ field }) => <Input id="xp-actionId" placeholder="e.g., profile_complete" {...field} disabled={!!editingXpRule} />} />
               {xpRuleErrors.actionId && <p className="text-sm text-destructive mt-1">{xpRuleErrors.actionId.message}</p>}
               {!editingXpRule && <p className="text-xs text-muted-foreground mt-1">Unique identifier for the action (cannot be changed later).</p>}
             </div>
             <div>
               <Label htmlFor="xp-description" className="flex items-center gap-1">Description
                <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>User-friendly description of the action (e.g., Complete Your Profile).</p></TooltipContent>
                 </Tooltip>
               </Label>
               <Controller name="description" control={xpRuleControl} render={({ field }) => <Input id="xp-description" placeholder="e.g., Complete Your Profile" {...field} />} />
                {xpRuleErrors.description && <p className="text-sm text-destructive mt-1">{xpRuleErrors.description.message}</p>}
             </div>
             <div>
               <Label htmlFor="xp-xpPoints" className="flex items-center gap-1">XP Points Awarded
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>The number of experience points awarded when this action is completed.</p></TooltipContent>
                 </Tooltip>
               </Label>
               <Controller name="xpPoints" control={xpRuleControl} render={({ field }) => <Input id="xp-xpPoints" type="number" min="0" {...field} />} />
                {xpRuleErrors.xpPoints && <p className="text-sm text-destructive mt-1">{xpRuleErrors.xpPoints.message}</p>}
             </div>
             <DialogFooter>
               <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
               <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingXpRule ? "Save Changes" : "Create Rule"}</Button>
             </DialogFooter>
           </form>
         </DialogContent>
       </Dialog>

    </div>
    </TooltipProvider>
  );
}
