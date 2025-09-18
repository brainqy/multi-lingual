
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter as DialogUIFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Settings, Palette, UploadCloud, Bell, Lock, WalletCards, Sun, Moon, Award, Gift, Paintbrush, KeyRound, Code2, Puzzle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tenant, UserProfile, PlatformSettings, InterviewQuestionCategory, TourStep, TenantSettings } from "@/types";
import { ALL_CATEGORIES } from "@/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import WelcomeTourDialog from "@/components/features/WelcomeTourDialog";
import { useAuth } from "@/hooks/use-auth";
import { updateUser } from "@/lib/data-services/users";
import { getTenants, updateTenant, updateTenantSettings } from "@/lib/actions/tenants";
import { updatePlatformSettings as updatePlatformSettingsAction } from "@/lib/actions/platform-settings";
import { changePassword } from "@/lib/actions/auth";
import { useSettings } from "@/contexts/settings-provider";

export default function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user: currentUser, login } = useAuth();
  const { settings: platformSettings, setSettings: setPlatformSettings } = useSettings();
  
  const [challengeTopics, setChallengeTopics] = useState<InterviewQuestionCategory[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Notification States
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [appNotificationsEnabled, setAppNotificationsEnabled] = useState(true);
  const [gamificationNotificationsEnabled, setGamificationNotificationsEnabled] = useState(true);
  const [referralNotificationsEnabled, setReferralNotificationsEnabled] = useState(true);

  // Admin Platform Feature State
  const [walletEnabled, setWalletEnabled] = useState(platformSettings.walletEnabled);

  const [userApiKey, setUserApiKey] = useState("");
  const [tenantNameInput, setTenantNameInput] = useState("");
  const [tenantLogoUrlInput, setTenantLogoUrlInput] = useState("");
  const [currentPrimaryColor, setCurrentPrimaryColor] = useState("");
  const [currentAccentColor, setCurrentAccentColor] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showApiKeyTour, setShowApiKeyTour] = useState(false);

  const CONFIRMATION_PHRASE = t("userSettings.deleteConfirmationPhrase", { default: "delete my account" });

  const apiKeyTourSteps: TourStep[] = [
    { title: t("userSettings.apiKeyTour.step1.title"), description: t("userSettings.apiKeyTour.step1.description") },
    { title: t("userSettings.apiKeyTour.step2.title"), description: t("userSettings.apiKeyTour.step2.description"), targetId: "developer-settings-card" },
    { title: t("userSettings.apiKeyTour.step3.title"), description: t("userSettings.apiKeyTour.step3.description"), targetId: "user-api-key-input" }
  ];
  
  useEffect(() => {
    if (currentUser) {
      setChallengeTopics(currentUser.challengeTopics || []);
      setUserApiKey(currentUser.userApiKey || "");
      // Set notification states from user profile
      setEmailNotificationsEnabled(currentUser.emailNotificationsEnabled ?? true);
      setAppNotificationsEnabled(currentUser.appNotificationsEnabled ?? true);
      setGamificationNotificationsEnabled(currentUser.gamificationNotificationsEnabled ?? true);
      setReferralNotificationsEnabled(currentUser.referralNotificationsEnabled ?? true);
    }
  }, [currentUser]);

  useEffect(() => {
    // This effect runs only on the client side
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      const darkMode = storedTheme === 'dark';
      setIsDarkMode(darkMode);
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, []);

  useEffect(() => {
    const fetchTenantData = async () => {
      if (currentUser?.role === 'manager' && currentUser.tenantId) {
        // In a real app, you might fetch just one tenant, but getTenants is fine for demo
        const allTenants = await getTenants();
        const currentTenant = allTenants.find(t => t.id === currentUser.tenantId);
        if (currentTenant) {
          setTenantNameInput(currentTenant.name);
          setTenantLogoUrlInput(currentTenant.settings?.customLogoUrl || "");
          setCurrentPrimaryColor(currentTenant.settings?.primaryColor || "hsl(180 100% 25%)");
          setCurrentAccentColor(currentTenant.settings?.accentColor || "hsl(180 100% 30%)");
        }
      }
    };
    fetchTenantData();
    setWalletEnabled(platformSettings.walletEnabled);

    // Check for API Key tour
    if (platformSettings.allowUserApiKey && typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('apiKeyTourSeen');
      if (!tourSeen) {
        setShowApiKeyTour(true);
      }
    }
  }, [currentUser?.role, currentUser?.tenantId, platformSettings.walletEnabled, platformSettings.allowUserApiKey]);


  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    document.documentElement.classList.toggle('dark', newIsDarkMode);
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
    toast({ title: t("userSettings.toastThemeChanged.title"), description: t("userSettings.toastThemeChanged.description", { themeMode: newIsDarkMode ? 'Dark' : 'Light' }) });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setTenantLogoUrlInput(`https://placehold.co/200x50?text=${file.name.substring(0,10)}`);
      toast({ title: t("userSettings.toastLogoSelectedMock.title"), description: t("userSettings.toastLogoSelectedMock.description", { fileName: file.name }) });
    }
  };

  const handleTenantColorChange = (colorType: 'primary' | 'accent', value: string) => {
    if (colorType === 'primary') setCurrentPrimaryColor(value);
    if (colorType === 'accent') setCurrentAccentColor(value);
  };

  const handleSaveSettings = async () => {
    if (!currentUser) return;

    let userUpdateSuccess = false;
    let tenantUpdateSuccess = true;
    let platformUpdateSuccess = true;

    // 1. Update user-specific settings
    const updatedUser = await updateUser(currentUser.id, {
        challengeTopics,
        userApiKey
    });

    if (updatedUser) {
        await login(updatedUser.email);
        userUpdateSuccess = true;
    } else {
        toast({ title: "Save Failed", description: "Could not save your personal settings.", variant: "destructive" });
    }

    // 2. If user is a manager, update tenant settings
    if (currentUser.role === 'manager' && currentUser.tenantId) {
        const tenantSettingsData: Partial<TenantSettings> = {
            customLogoUrl: tenantLogoUrlInput,
            primaryColor: currentPrimaryColor,
            accentColor: currentAccentColor,
        };
        const updatedTenant = await updateTenant(currentUser.tenantId, { name: tenantNameInput });
        const updatedSettings = await updateTenantSettings(currentUser.tenantId, tenantSettingsData);
        
        if (!updatedTenant || !updatedSettings) tenantUpdateSuccess = false;
    }
    
    // 3. If user is an admin, update platform settings
    if (currentUser.role === 'admin') {
      const platformSettingsData: Partial<PlatformSettings> = {
        walletEnabled: walletEnabled,
      };
      const updatedPlatformSettings = await updatePlatformSettingsAction(platformSettingsData);
      if (updatedPlatformSettings) {
        setPlatformSettings(updatedPlatformSettings);
      } else {
        platformUpdateSuccess = false;
      }
    }

    if (userUpdateSuccess && tenantUpdateSuccess && platformUpdateSuccess) {
        toast({ title: "Settings Saved", description: "Your preferences have been successfully updated." });
    } else {
        toast({ title: "Partial Save", description: "Some settings could not be saved. Please try again.", variant: "destructive" });
    }
  };


  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;
    if (newPassword !== confirmNewPassword) {
      toast({ title: t("userSettings.toast.passwordMismatch.title"), description: t("userSettings.toast.passwordMismatch.description"), variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: t("userSettings.toast.passwordTooShort.title"), description: t("userSettings.toast.passwordTooShort.description"), variant: "destructive" });
      return;
    }
    
    const result = await changePassword({
      userId: currentUser.id,
      currentPassword: currentPassword,
      newPassword: newPassword,
    });

    if (result.success) {
      toast({ title: "Password Changed", description: "Your password has been successfully updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsChangePasswordDialogOpen(false);
    } else {
      toast({ title: "Password Change Failed", description: result.error, variant: "destructive" });
    }
  };

  const handleDataDeletionRequest = () => {
    setDeleteConfirmText("");
    toast({title: t("userSettings.toast.dataDeletionMock.title"), description:t("userSettings.toast.dataDeletionMock.description")});
  };

  const handleChallengeTopicChange = (category: InterviewQuestionCategory, checked: boolean) => {
    setChallengeTopics(prev => {
        if (checked) {
            return [...prev, category];
        } else {
            return prev.filter(c => c !== category);
        }
    });
  };
  
  if (!currentUser) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Settings className="h-8 w-8" /> {t("userSettings.pageTitle")}
      </h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>{t("userSettings.appearanceCardTitle")}</CardTitle>
          <CardDescription>{t("userSettings.appearanceCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-secondary/30 gap-2">
            <Label htmlFor="theme-switcher" className="flex items-center gap-2 text-sm font-medium">
              {isDarkMode ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}
              {t("userSettings.darkModeLabel")}
            </Label>
            <Switch id="theme-switcher" checked={isDarkMode} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {currentUser.role === 'manager' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Paintbrush className="h-5 w-5 text-primary"/>{t("userSettings.tenantBrandingCardTitle")}</CardTitle>
            <CardDescription>{t("userSettings.tenantBrandingCardDescription", { tenantName: tenantNameInput || currentUser.currentOrganization || currentUser.tenantId })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tenant-name-input">{t("userSettings.tenantNameLabel")}</Label>
              <Input
                id="tenant-name-input"
                value={tenantNameInput}
                onChange={(e) => setTenantNameInput(e.target.value)}
                placeholder={t("userSettings.tenantNamePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="tenant-logo-url-input">{t("userSettings.tenantLogoUrlLabel")}</Label>
              <Input
                id="tenant-logo-url-input"
                value={tenantLogoUrlInput}
                onChange={(e) => setTenantLogoUrlInput(e.target.value)}
                placeholder={t("userSettings.tenantLogoUrlPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-upload" className="text-sm font-medium flex items-center gap-2">
                  <UploadCloud className="h-5 w-5"/> {t("userSettings.logoUploadLabel")}
              </Label>
              <Input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="text-sm"/>
              <p className="text-xs text-muted-foreground">{t("userSettings.logoUploadHelpText")}</p>
            </div>
             <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                    {t("userSettings.tenantThemeColorsLabel")}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="tenant-primary-color" className="text-xs">{t("userSettings.primaryColorLabel")}</Label>
                        <div className="flex items-center gap-2">
                            <Input type="color" id="tenant-primary-color" value={currentPrimaryColor} onChange={(e) => handleTenantColorChange('primary', e.target.value)} className="w-12 h-8 p-1"/>
                            <Input type="text" value={currentPrimaryColor} onChange={(e) => handleTenantColorChange('primary', e.target.value)} placeholder={t("userSettings.colorPlaceholder")}/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="tenant-accent-color" className="text-xs">{t("userSettings.accentColorLabel")}</Label>
                        <div className="flex items-center gap-2">
                            <Input type="color" id="tenant-accent-color" value={currentAccentColor} onChange={(e) => handleTenantColorChange('accent', e.target.value)} className="w-12 h-8 p-1"/>
                            <Input type="text" value={currentAccentColor} onChange={(e) => handleTenantColorChange('accent', e.target.value)} placeholder={t("userSettings.colorPlaceholder")}/>
                        </div>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Puzzle className="h-5 w-5 text-primary" />{t("userSettings.challengePrefsCardTitle")}</CardTitle>
          <CardDescription>{t("userSettings.challengePrefsCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                {ALL_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                            id={`topic-${category}`}
                            checked={challengeTopics.includes(category)}
                            onCheckedChange={(checked) => handleChallengeTopicChange(category, !!checked)}
                        />
                        <Label htmlFor={`topic-${category}`} className="font-normal">{category}</Label>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/>{t("userSettings.notificationsCardTitle")}</CardTitle>
          <CardDescription>{t("userSettings.notificationsCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-secondary/30 gap-2">
            <Label htmlFor="email-notifications" className="text-sm font-medium">{t("userSettings.emailNotificationsLabel")}</Label>
            <Switch id="email-notifications" checked={emailNotificationsEnabled} onCheckedChange={setEmailNotificationsEnabled} />
          </div>
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-secondary/30 gap-2">
            <Label htmlFor="app-notifications" className="text-sm font-medium">{t("userSettings.appNotificationsLabel")}</Label>
            <Switch id="app-notifications" checked={appNotificationsEnabled} onCheckedChange={setAppNotificationsEnabled} />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-secondary/30 gap-2">
            <Label htmlFor="gamification-notifications" className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4" /> {t("userSettings.gamificationNotificationsLabel")}
            </Label>
            <Switch id="gamification-notifications" checked={gamificationNotificationsEnabled} onCheckedChange={setGamificationNotificationsEnabled} />
          </div>
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-secondary/30 gap-2">
            <Label htmlFor="referral-notifications" className="flex items-center gap-2 text-sm font-medium">
              <Gift className="h-4 w-4" /> {t("userSettings.referralNotificationsLabel")}
            </Label>
            <Switch id="referral-notifications" checked={referralNotificationsEnabled} onCheckedChange={setReferralNotificationsEnabled} />
          </div>
        </CardContent>
      </Card>
      
      {platformSettings.allowUserApiKey && (
        <Card className="shadow-lg" id="developer-settings-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-primary"/>{t("userSettings.devSettings.title")}</CardTitle>
            <CardDescription>{t("userSettings.devSettings.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="user-api-key-input">
              <Label htmlFor="user-api-key">{t("userSettings.devSettings.apiKeyLabel")}</Label>
              <Input
                id="user-api-key"
                type="password"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder={t("userSettings.devSettings.apiKeyPlaceholder")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("userSettings.devSettings.apiKeyDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentUser.role === 'admin' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-primary"/>{t("userSettings.platformFeaturesAdminCardTitle")}</CardTitle>
            <CardDescription>{t("userSettings.platformFeaturesAdminCardDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-secondary/30 gap-2">
              <Label htmlFor="wallet-enable-platform" className="text-sm font-medium">{t("userSettings.walletEnablePlatformLabel")}</Label>
              <Switch
                id="wallet-enable-platform"
                checked={walletEnabled}
                onCheckedChange={setWalletEnabled}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary"/>{t("userSettings.accountSecurityCardTitle")}</CardTitle>
          <CardDescription>{t("userSettings.accountSecurityCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={isChangePasswordDialogOpen} onOpenChange={(isOpen) => {
            setIsChangePasswordDialogOpen(isOpen);
            if (!isOpen) { 
              setCurrentPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <KeyRound className="mr-2 h-4 w-4" /> {t("userSettings.changePasswordButton")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("userSettings.changePasswordDialogTitle")}</DialogTitle>
                <DialogUIDescription>
                  {t("userSettings.changePasswordDialogDescription")}
                </DialogUIDescription>
              </DialogHeader>
              <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                <div>
                  <Label htmlFor="dialog-current-password">{t("userSettings.currentPasswordLabel")}</Label>
                  <Input
                    id="dialog-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-new-password">{t("userSettings.newPasswordLabel")}</Label>
                  <Input
                    id="dialog-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-confirm-new-password">{t("userSettings.confirmNewPasswordLabel")}</Label>
                  <Input
                    id="dialog-confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                <DialogUIFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">{t("userSettings.cancelButton")}</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t("userSettings.updatePasswordButton")}
                  </Button>
                </DialogUIFooter>
              </form>
            </DialogContent>
          </Dialog>

           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-secondary/30 gap-2">
             <Label htmlFor="data-sharing" className="text-sm font-medium">{t("userSettings.dataSharingLabel")}</Label>
            <Switch id="data-sharing" defaultChecked />
          </div>
          {currentUser.role === 'admin' && (
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-secondary/30 gap-2">
                <Label htmlFor="two-factor-auth" className="text-sm font-medium">{t("userSettings.twoFactorAuthLabel")}</Label>
                <Switch id="two-factor-auth" onCheckedChange={() => toast({ title: t("userSettings.toast.mockAction.title"), description: t("userSettings.toast.mockAction.description") })} />
            </div>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4">{t("userSettings.requestDataDeletionButton")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("userSettings.confirmDataDeletionDialogTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("userSettings.confirmDataDeletionDialogDescription", { phrase: CONFIRMATION_PHRASE })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="delete-confirm-input" className="sr-only">{t("userSettings.confirmDeletionInputPlaceholder", { phrase: CONFIRMATION_PHRASE })}</Label>
                <Input
                  id="delete-confirm-input"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t("userSettings.confirmDeletionInputPlaceholder", { phrase: CONFIRMATION_PHRASE })}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>{t("userSettings.cancelButton")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDataDeletionRequest}
                  className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                  disabled={deleteConfirmText !== CONFIRMATION_PHRASE}
                >
                  {t("userSettings.confirmDeletionButton")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <div className="pt-4 text-center">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveSettings}>
          {t("userSettings.saveAllSettingsButton")}
        </Button>
      </div>

      <WelcomeTourDialog
        isOpen={showApiKeyTour}
        onClose={() => {
          setShowApiKeyTour(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('apiKeyTourSeen', 'true');
          }
        }}
        tourKey="apiKeyTourSeen"
        steps={apiKeyTourSteps}
        title={t("userSettings.apiKeyTour.dialogTitle")}
      />

    </div>
  );
}
