
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter as DialogUIFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Settings, Palette, UploadCloud, Bell, Lock, WalletCards, Sun, Moon, Award, Gift, Paintbrush, KeyRound, Code2, Puzzle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleTenants, samplePlatformSettings } from "@/lib/sample-data";
import type { Tenant, UserProfile, PlatformSettings, InterviewQuestionCategory, TourStep } from "@/types";
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

export default function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile>(sampleUserProfile);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(samplePlatformSettings);
  const [challengeTopics, setChallengeTopics] = useState<InterviewQuestionCategory[]>(currentUser.challengeTopics || []);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [appNotificationsEnabled, setAppNotificationsEnabled] = useState(true);
  const [gamificationNotificationsEnabled, setGamificationNotificationsEnabled] = useState(true);
  const [referralNotificationsEnabled, setReferralNotificationsEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(platformSettings.walletEnabled);
  const [userApiKey, setUserApiKey] = useState(currentUser.userApiKey || "");
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

  const CONFIRMATION_PHRASE = "delete my account";

  const apiKeyTourSteps: TourStep[] = [
    { title: "Use Your Own API Key!", description: "The platform admin has enabled a new feature! You can now use your personal Google Gemini API key for all AI features." },
    { title: "Developer Settings", description: "You'll find the new input field inside the 'Developer Settings' card.", targetId: "developer-settings-card" },
    { title: "Enter Your Key", description: "Just paste your Gemini API key here and save your settings. This will use your key instead of the platform's default.", targetId: "user-api-key-input" }
  ];

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    if (currentUser.role === 'manager' && currentUser.tenantId) {
      const currentTenant = sampleTenants.find(t => t.id === currentUser.tenantId);
      if (currentTenant) {
        setTenantNameInput(currentTenant.name);
        setTenantLogoUrlInput(currentTenant.settings?.customLogoUrl || "");
        setCurrentPrimaryColor(currentTenant.settings?.primaryColor || "hsl(180 100% 25%)");
        setCurrentAccentColor(currentTenant.settings?.accentColor || "hsl(180 100% 30%)");
      }
    }
    setWalletEnabled(platformSettings.walletEnabled);

    // Check for API Key tour
    if (platformSettings.allowUserApiKey && typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('apiKeyTourSeen');
      if (!tourSeen) {
        setShowApiKeyTour(true);
      }
    }

  }, [currentUser.role, currentUser.tenantId, platformSettings.walletEnabled, platformSettings.allowUserApiKey]);

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

  const handleSaveSettings = () => {
    const updatedUser = { ...currentUser, challengeTopics, userApiKey };
    Object.assign(sampleUserProfile, updatedUser);
    setCurrentUser(updatedUser);

    console.log("General settings saved (mocked):", {
      isDarkMode, emailNotificationsEnabled, appNotificationsEnabled,
      gamificationNotificationsEnabled, referralNotificationsEnabled, walletEnabled, challengeTopics, userApiKey
    });

    if(currentUser.role === 'admin'){
        Object.assign(samplePlatformSettings, { walletEnabled });
        toast({ title: t("userSettings.toastPlatformSettingsSaved.title"), description: t("userSettings.toastPlatformSettingsSaved.description") });
    }

    if (currentUser.role === 'manager' && currentUser.tenantId) {
      const tenantIndex = sampleTenants.findIndex(t => t.id === currentUser.tenantId);
      if (tenantIndex !== -1) {
        const updatedTenant = { ...sampleTenants[tenantIndex] };
        updatedTenant.name = tenantNameInput;
        if (!updatedTenant.settings) updatedTenant.settings = { allowPublicSignup: true };
        updatedTenant.settings.customLogoUrl = tenantLogoUrlInput;
        updatedTenant.settings.primaryColor = currentPrimaryColor;
        updatedTenant.settings.accentColor = currentAccentColor;
        sampleTenants[tenantIndex] = updatedTenant;
        toast({ title: t("userSettings.toastTenantBrandingSaved.title"), description: t("userSettings.toastTenantBrandingSaved.description", { tenantName: tenantNameInput }) });
      }
    } else if (currentUser.role !== 'admin') {
      toast({ title: t("userSettings.toastUserSettingsSaved.title"), description: t("userSettings.toastUserSettingsSaved.description") });
    }
  };

  const handleChangePassword = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: t("userSettings.toastPasswordMismatch.title"), description: t("userSettings.toastPasswordMismatch.description"), variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: t("userSettings.toastPasswordTooShort.title"), description: t("userSettings.toastPasswordTooShort.description"), variant: "destructive" });
      return;
    }
    console.log("Attempting to change password (mocked):", { currentPassword, newPassword });
    toast({ title: t("userSettings.toastPasswordChangedMock.title"), description: t("userSettings.toastPasswordChangedMock.description") });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsChangePasswordDialogOpen(false);
  };

  const handleDataDeletionRequest = () => {
    setDeleteConfirmText("");
    toast({title: t("userSettings.toastDataDeletionMock.title"), description:t("userSettings.toastDataDeletionMock.description")});
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
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
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
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="email-notifications" className="text-sm font-medium">{t("userSettings.emailNotificationsLabel")}</Label>
            <Switch id="email-notifications" checked={emailNotificationsEnabled} onCheckedChange={setEmailNotificationsEnabled} />
          </div>
           <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="app-notifications" className="text-sm font-medium">{t("userSettings.appNotificationsLabel")}</Label>
            <Switch id="app-notifications" checked={appNotificationsEnabled} onCheckedChange={setAppNotificationsEnabled} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="gamification-notifications" className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4" /> {t("userSettings.gamificationNotificationsLabel")}
            </Label>
            <Switch id="gamification-notifications" checked={gamificationNotificationsEnabled} onCheckedChange={setGamificationNotificationsEnabled} />
          </div>
           <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
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
            <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-primary"/>Developer Settings</CardTitle>
            <CardDescription>Manage your personal API keys for third-party services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="user-api-key-input">
              <Label htmlFor="user-api-key">Your Gemini API Key</Label>
              <Input
                id="user-api-key"
                type="password"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder="Enter your personal Google Gemini API key"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your key is stored locally and used for AI feature requests. It will override the platform's default key for your account.
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
            <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
              <Label htmlFor="wallet-enable-platform" className="text-sm font-medium">{t("userSettings.walletEnablePlatformLabel")}</Label>
              <Switch
                id="wallet-enable-platform"
                checked={walletEnabled}
                onCheckedChange={(checked) => {
                    setWalletEnabled(checked);
                    setPlatformSettings(prev => ({...prev, walletEnabled: checked}));
                }}
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

           <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30 mt-4">
             <Label htmlFor="data-sharing" className="text-sm font-medium">{t("userSettings.dataSharingLabel")}</Label>
            <Switch id="data-sharing" defaultChecked />
          </div>
          {currentUser.role === 'admin' && (
             <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
                <Label htmlFor="two-factor-auth" className="text-sm font-medium">{t("userSettings.twoFactorAuthLabel")}</Label>
                <Switch id="two-factor-auth" onCheckedChange={() => toast({ title: t("userSettings.toastMockAction.title"), description: t("userSettings.toastMockAction.description") })} />
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
        title="New Developer Option!"
      />

    </div>
  );
}

    