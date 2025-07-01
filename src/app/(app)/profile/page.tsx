"use client";
import { suggestDynamicSkills, type SuggestDynamicSkillsInput, type SuggestDynamicSkillsOutput } from '@/ai/flows/suggest-dynamic-skills';
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Briefcase, Sparkles, Upload, Save, CalendarDays, Users, HelpCircle, CheckSquare, Settings as SettingsIcon, Phone, MapPin, GraduationCap, Building, LinkIcon, Brain, Handshake, Clock, MessageCircle, Info, CheckCircle as CheckCircleIcon, XCircle, Edit3, Loader2, ThumbsUp, PlusCircle as PlusCircleIcon } from "lucide-react";
import { sampleUserProfile, graduationYears, sampleTenants } from "@/lib/sample-data";
import type { UserProfile, Gender, DegreeProgram, Industry, SupportArea, TimeCommitment, EngagementMode, SupportTypeSought } from "@/types";
import { DegreePrograms, Industries, AreasOfSupport as AreasOfSupportOptions, TimeCommitments, EngagementModes, SupportTypesSought as SupportTypesSoughtOptions, Genders, SupportTypesSought } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.date().optional(),
  gender: z.enum(Genders).optional(),
  mobileNumber: z.string().optional(),
  currentAddress: z.string().optional(),
  
  graduationYear: z.string().optional(),
  degreeProgram: z.enum(DegreePrograms).optional(),
  department: z.string().optional(),
  
  currentJobTitle: z.string().optional(),
  currentOrganization: z.string().optional(),
  industry: z.enum(Industries).optional(),
  workLocation: z.string().optional(),
  linkedInProfile: z.string().url("Invalid URL").optional().or(z.literal('')),
  yearsOfExperience: z.string().optional(),
  
  skills: z.string().optional(), 
  
  areasOfSupport: z.array(z.string()).optional(), 
  timeCommitment: z.enum(TimeCommitments).optional(), 
  preferredEngagementMode: z.enum(EngagementModes).optional(), 
  otherComments: z.string().optional(),
  
  lookingForSupportType: z.enum(SupportTypesSought).optional(),
  helpNeededDescription: z.string().optional(),
  
  shareProfileConsent: z.boolean().optional(),
  featureInSpotlightConsent: z.boolean().optional(),

  profilePictureUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  resumeText: z.string().optional(),
  careerInterests: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SuggestedSkill = SuggestDynamicSkillsOutput['suggestedSkills'][0];

export default function ProfilePage() {
  const { t } = useI18n();
  const [userProfile, setUserProfile] = useState<UserProfile>(sampleUserProfile);
  const [isEditing, setIsEditing] = useState(false); 
  const [suggestedSkills, setSuggestedSkills] = useState<SuggestedSkill[] | null>(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [isProfileSavedDialogOpen, setIsProfileSavedDialogOpen] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, watch, reset, setValue, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
      dateOfBirth: userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth) : undefined,
      gender: userProfile.gender,
      mobileNumber: userProfile.mobileNumber || '',
      currentAddress: userProfile.currentAddress || '',
      graduationYear: userProfile.graduationYear || '',
      degreeProgram: userProfile.degreeProgram,
      department: userProfile.department || '',
      currentJobTitle: userProfile.currentJobTitle || '',
      currentOrganization: userProfile.currentOrganization || '',
      industry: userProfile.industry,
      workLocation: userProfile.workLocation || '',
      linkedInProfile: userProfile.linkedInProfile || '',
      yearsOfExperience: userProfile.yearsOfExperience || '',
      skills: userProfile.skills?.join(', ') || '',
      areasOfSupport: userProfile.areasOfSupport || [],
      timeCommitment: userProfile.timeCommitment,
      preferredEngagementMode: userProfile.preferredEngagementMode,
      otherComments: userProfile.otherComments || '',
      lookingForSupportType: userProfile.lookingForSupportType,
      helpNeededDescription: userProfile.helpNeededDescription || '',
      shareProfileConsent: userProfile.shareProfileConsent ?? true,
      featureInSpotlightConsent: userProfile.featureInSpotlightConsent ?? false,
      profilePictureUrl: userProfile.profilePictureUrl || '',
      resumeText: userProfile.resumeText || '',
      careerInterests: userProfile.careerInterests || '',
      bio: userProfile.bio || '',
    }
  });
  
  useEffect(() => {
    reset({
      ...sampleUserProfile,
      dateOfBirth: sampleUserProfile.dateOfBirth ? new Date(sampleUserProfile.dateOfBirth) : undefined,
      skills: sampleUserProfile.skills?.join(', ') || '',
      areasOfSupport: sampleUserProfile.areasOfSupport || [],
      shareProfileConsent: sampleUserProfile.shareProfileConsent ?? true,
      featureInSpotlightConsent: sampleUserProfile.featureInSpotlightConsent ?? false,
    });
  }, [sampleUserProfile, reset]);


  const watchedFields = watch();

  const calculateProfileCompletion = () => {
    const fieldsToCheck = [
      watchedFields.name, watchedFields.email, watchedFields.dateOfBirth, watchedFields.gender,
      watchedFields.mobileNumber, watchedFields.currentAddress, watchedFields.graduationYear,
      watchedFields.degreeProgram, watchedFields.department, watchedFields.currentJobTitle,
      watchedFields.currentOrganization, watchedFields.industry, watchedFields.workLocation,
      watchedFields.linkedInProfile, watchedFields.yearsOfExperience, watchedFields.skills,
      watchedFields.profilePictureUrl, watchedFields.resumeText, watchedFields.careerInterests, watchedFields.bio,
      watchedFields.areasOfSupport && watchedFields.areasOfSupport.length > 0, 
      watchedFields.timeCommitment, watchedFields.preferredEngagementMode
    ];
    const filledFields = fieldsToCheck.filter(field => {
      if (typeof field === 'boolean') return true; 
      if (field instanceof Date) return true;
      return field && String(field).trim() !== '';
    }).length;
    return Math.round((filledFields / fieldsToCheck.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const onSubmit = (data: ProfileFormData) => {
    const updatedProfileData: UserProfile = {
      ...userProfile, 
      ...data,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : undefined,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
      areasOfSupport: data.areasOfSupport as SupportArea[] || [],
    };
    setUserProfile(updatedProfileData);

    if (sampleUserProfile.id === updatedProfileData.id) {
        Object.assign(sampleUserProfile, updatedProfileData);
    }
    setIsEditing(false); 
    console.log("Updated Profile Data (mock):", updatedProfileData);
    setIsProfileSavedDialogOpen(true);
  };
  
  const renderSectionHeader = (title: string, icon: React.ElementType, tooltipText?: string) => {
    const IconComponent = icon;
    return (
      <>
        <Separator className="my-6" />
        <div className="flex items-center gap-2 mb-4">
          <IconComponent className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
          {tooltipText && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </>
    );
  }

  const handleGetSkillSuggestions = async () => {
    setIsSkillsLoading(true);
    setSuggestedSkills(null);
    try {
      const currentSkills = watchedFields.skills?.split(',').map(s => s.trim()).filter(s => s) || [];
      const contextText = `${watchedFields.bio || ''} ${watchedFields.careerInterests || ''} ${watchedFields.currentJobTitle || ''} ${watchedFields.industry || ''}`.trim();
      if (!contextText) {
        toast({ title: "Cannot Suggest Skills", description: "Please provide more information in your bio, career interests, job title, or industry for better skill suggestions.", variant: "destructive" });
        setIsSkillsLoading(false);
        return;
      }
      const input: SuggestDynamicSkillsInput = {
        currentSkills,
        contextText,
      };
      const result = await suggestDynamicSkills(input);
      setSuggestedSkills(result.suggestedSkills);
      toast({ title: "Skill Suggestions Ready!", description: "AI has suggested some skills for you below." });
    } catch (error) {
      console.error("Skill suggestion error:", error);
      const errorMessage = (error as any).message || String(error);
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing')) {
          toast({
              title: "API Usage Limit Exceeded",
              description: "You have exceeded your Gemini API usage limit. Please check your Google Cloud billing account.",
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: "Skill Suggestion Failed", description: "An error occurred while fetching skill suggestions.", variant: "destructive" });
      }
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const handleAddSuggestedSkill = (skill: string) => {
    const currentSkillsValue = watchedFields.skills || "";
    const skillsArray = currentSkillsValue.split(',').map(s => s.trim()).filter(s => s);
    if (!skillsArray.includes(skill)) {
        const newSkillsString = [...skillsArray, skill].join(', ');
        setValue('skills', newSkillsString, { shouldDirty: true });
        toast({title: "Skill Added!", description: `"${skill}" has been added to your skills list.`});
    } else {
        toast({title: "Skill Already Exists", description: `"${skill}" is already in your skills list.`, variant: "default"});
    }
  };


  return (
    <div className="space-y-8">
    <TooltipProvider>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("profile.title", { default: "My Profile" })}</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit3 className="mr-2 h-4 w-4" /> {t("profile.editProfile", { default: "Edit Profile" })}
          </Button>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary"/>{t("profile.completion", { default: "Profile Completion" })}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("profile.completionTooltip", { default: "Complete your profile to unlock more features and get better recommendations." })}</p>
              </TooltipContent>
            </Tooltip>
            </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={profileCompletion} className="w-full h-3 [&>div]:bg-primary" />
          <p className="text-sm text-muted-foreground mt-2 text-center">{t("profile.completionPercent", { percent: profileCompletion, default: "Your profile is {percent}% complete." })}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={!isEditing} className="space-y-6"> 
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={watchedFields.profilePictureUrl || "https://picsum.photos/seed/defaultavatar/200/200"} alt={userProfile.name} data-ai-hint="person portrait"/>
                    <AvatarFallback className="text-3xl">{userProfile.name?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                    <label htmlFor="avatarUpload" className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <Upload className="h-8 w-8" />
                    </label>
                    <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={() => toast({title: "Avatar Upload (Mock)", description: "File selected. In a real app, this would upload and update the URL."})}/>
                    </>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-2xl">{watchedFields.name || "User Name"}</CardTitle>
                  <CardDescription>{watchedFields.email || "user@example.com"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderSectionHeader("Personal Information", User)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} />} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Controller name="dateOfBirth" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
                  {errors.dateOfBirth && <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gender">Gender</Label>
                  <Controller name="gender" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="gender"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                      <SelectContent>
                        {Genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mobileNumber" className="flex items-center gap-1"><Phone className="h-4 w-4 text-muted-foreground"/>Mobile Number</Label>
                  <Controller name="mobileNumber" control={control} render={({ field }) => <Input id="mobileNumber" placeholder="e.g., +1 555 123 4567" {...field} />} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="currentAddress" className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground"/>Current Address</Label>
                  <Controller name="currentAddress" control={control} render={({ field }) => <Textarea id="currentAddress" placeholder="City, State, Country" {...field} />} />
                </div>
              </div>
                
              {renderSectionHeader("Academic Information", GraduationCap)}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Controller name="graduationYear" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="graduationYear"><SelectValue placeholder="Select Year" /></SelectTrigger>
                      <SelectContent>
                        {graduationYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="degreeProgram">Degree / Program</Label>
                  <Controller name="degreeProgram" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="degreeProgram"><SelectValue placeholder="Select Degree" /></SelectTrigger>
                      <SelectContent>
                        {DegreePrograms.map(deg => <SelectItem key={deg} value={deg}>{deg}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="department">Department</Label>
                  <Controller name="department" control={control} render={({ field }) => <Input id="department" placeholder="e.g., Computer Science" {...field} />} />
                </div>
              </div>
              
              {renderSectionHeader("Professional Information", Briefcase)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="currentJobTitle">Current Job Title</Label>
                  <Controller name="currentJobTitle" control={control} render={({ field }) => <Input id="currentJobTitle" {...field} />} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currentOrganization" className="flex items-center gap-1"><Building className="h-4 w-4 text-muted-foreground"/>Current Organization</Label>
                  <Controller name="currentOrganization" control={control} render={({ field }) => <Input id="currentOrganization" {...field} />} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="industry">Industry</Label>
                  <Controller name="industry" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="industry"><SelectValue placeholder="Select Industry" /></SelectTrigger>
                      <SelectContent>
                        {Industries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="workLocation">Work Location</Label>
                  <Controller name="workLocation" control={control} render={({ field }) => <Input id="workLocation" {...field} />} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="linkedInProfile" className="flex items-center gap-1"><LinkIcon className="h-4 w-4 text-muted-foreground"/>LinkedIn Profile URL</Label>
                  <Controller name="linkedInProfile" control={control} render={({ field }) => <Input id="linkedInProfile" type="url" {...field} />} />
                  {errors.linkedInProfile && <p className="text-sm text-destructive mt-1">{errors.linkedInProfile.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Controller name="yearsOfExperience" control={control} render={({ field }) => <Input id="yearsOfExperience" type="text" placeholder="e.g., 5 or 5+" {...field} />} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="skills" className="flex items-center gap-1"><Brain className="h-4 w-4 text-muted-foreground"/>Skills (comma-separated)</Label>
                  <Controller name="skills" control={control} render={({ field }) => <Textarea id="skills" placeholder="e.g., React, Python, Project Management" {...field} />} />
                </div>
              </div>

              {renderSectionHeader("Alumni Engagement", Handshake, "How you'd like to engage with and support the alumni community.")}
              <div className="space-y-4">
                <Label className="flex items-center gap-1 text-md"><Users className="h-4 w-4 text-muted-foreground"/>Areas You Can Support</Label>
                <Controller
                  name="areasOfSupport"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      {AreasOfSupportOptions.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={`support-${area.replace(/\s+/g, '-')}`}
                            checked={field.value?.includes(area)}
                            onCheckedChange={(checked) => {
                              const currentAreas = field.value || [];
                              if (checked) {
                                field.onChange([...currentAreas, area]);
                              } else {
                                field.onChange(currentAreas.filter((value) => value !== area));
                              }
                            }}
                          />
                          <Label htmlFor={`support-${area.replace(/\s+/g, '-')}`} className="font-normal text-sm">{area}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="timeCommitment" className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground"/>Time Commitment (per month)</Label>
                  <Controller name="timeCommitment" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="timeCommitment"><SelectValue placeholder="Select Time Commitment" /></SelectTrigger>
                      <SelectContent>
                        {TimeCommitments.map(tc => <SelectItem key={tc} value={tc}>{tc}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="preferredEngagementMode" className="flex items-center gap-1"><MessageCircle className="h-4 w-4 text-muted-foreground"/>Preferred Engagement Mode</Label>
                  <Controller name="preferredEngagementMode" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="preferredEngagementMode"><SelectValue placeholder="Select Engagement Mode" /></SelectTrigger>
                      <SelectContent>
                        {EngagementModes.map(mode => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="otherComments" className="flex items-center gap-1"><Info className="h-4 w-4 text-muted-foreground"/>Other Engagement Comments/Notes</Label>
                <Controller name="otherComments" control={control} render={({ field }) => <Textarea id="otherComments" placeholder="Any other ways you'd like to contribute..." {...field} />} />
              </div>

              {renderSectionHeader("Support You're Looking For", HelpCircle, "What kind of help or connections are you seeking from the alumni network?")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="lookingForSupportType">Type of Support</Label>
                  <Controller name="lookingForSupportType" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="lookingForSupportType"><SelectValue placeholder="Select Support Type (Optional)" /></SelectTrigger>
                      <SelectContent>
                        {SupportTypesSoughtOptions.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="helpNeededDescription">Brief Description of Help Needed</Label>
                <Controller name="helpNeededDescription" control={control} render={({ field }) => <Textarea id="helpNeededDescription" placeholder="e.g., Looking for advice on transitioning to a Product Manager role." {...field} />} />
              </div>

              {renderSectionHeader("Visibility & Consent", CheckSquare, "Manage how your profile information is shared.")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Share profile with other alumni for relevant collaboration?</Label>
                  <Controller name="shareProfileConsent" control={control} render={({ field }) => (
                    <RadioGroup onValueChange={(val) => field.onChange(val === "true")} value={String(field.value)} className="flex space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="share-yes" /><Label htmlFor="share-yes" className="font-normal">Yes</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="share-no" /><Label htmlFor="share-no" className="font-normal">No</Label></div>
                    </RadioGroup>
                  )} />
                </div>
                <div className="space-y-2">
                  <Label>Feature on alumni dashboard or spotlight?</Label>
                  <Controller name="featureInSpotlightConsent" control={control} render={({ field }) => (
                    <RadioGroup onValueChange={(val) => field.onChange(val === "true")} value={String(field.value)} className="flex space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="feature-yes" /><Label htmlFor="feature-yes" className="font-normal">Yes</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="feature-no" /><Label htmlFor="feature-no" className="font-normal">No</Label></div>
                    </RadioGroup>
                  )} />
                </div>
              </div>
              
              {renderSectionHeader("Additional Information", SettingsIcon)}
              <div className="space-y-1">
                  <Label htmlFor="profilePictureUrl" className="flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground"/>Profile Picture URL</Label>
                  <Controller name="profilePictureUrl" control={control} render={({ field }) => <Input id="profilePictureUrl" placeholder="URL to your profile picture" {...field} />} />
                  {errors.profilePictureUrl && <p className="text-sm text-destructive mt-1">{errors.profilePictureUrl.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio" className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-muted-foreground"/>Short Bio / Professional Overview</Label>
                <Controller name="bio" control={control} render={({ field }) => <Textarea id="bio" rows={4} placeholder="A brief professional bio (2-3 sentences)" {...field} />} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="careerInterests" className="flex items-center gap-1"><Sparkles className="h-4 w-4 text-muted-foreground"/>Career Interests</Label>
                <Controller name="careerInterests" control={control} render={({ field }) => <Input id="careerInterests" placeholder="e.g., AI, Product Management, Fintech" {...field} />} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="resumeText" className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground"/>Primary Resume Text (for AI features)
                  <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Paste your main resume text here. This will be used by AI features like skill suggestions and cover letter generation if no specific resume is selected.</p>
                      </TooltipContent>
                    </Tooltip>
                </Label>
                <Controller name="resumeText" control={control} render={({ field }) => <Textarea id="resumeText" rows={8} placeholder="Paste your full resume text here..." {...field} />} />
              </div>
            </CardContent>
            <CardFooter>
              {isEditing && (
                <div className="flex gap-2">
                   <Button type="submit" disabled={!isDirty} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset(); }}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </fieldset>
      </form>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> {t("profile.aiSkillSuggestions", { default: "AI Skill Suggestions" })}
          </CardTitle>
          <CardDescription>{t("profile.aiSkillDesc", { default: "Get AI-powered skill suggestions based on your profile." })}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSkillsLoading && (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">{t("profile.aiAnalyzing", { default: "AI is analyzing your profile for skill suggestions..." })}</p>
            </div>
          )}
          {!isSkillsLoading && suggestedSkills && suggestedSkills.length === 0 && (
            <p className="text-muted-foreground text-center py-4">{t("profile.noSkillSuggestions", { default: "No new skill suggestions at this time. Ensure your bio and career interests are filled out!" })}</p>
          )}
          {!isSkillsLoading && suggestedSkills && suggestedSkills.length > 0 && (
            <div className="space-y-3">
              {suggestedSkills.map(skillRec => (
                <Card key={skillRec.skill} className="bg-secondary/50 p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{skillRec.skill}</h4>
                      <p className="text-xs text-muted-foreground">{t("profile.relevance", { default: "Relevance" })}: <span className="text-primary font-bold">{skillRec.relevanceScore}%</span></p>
                    </div>
                    {isEditing && (
                       <Button size="sm" variant="outline" onClick={() => handleAddSuggestedSkill(skillRec.skill)}>
                        <PlusCircleIcon className="mr-1 h-4 w-4" /> {t("profile.addSkill", { default: "Add Skill" })}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 italic">{t("profile.reasoning", { default: "Reasoning" })}: {skillRec.reasoning}</p>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleGetSkillSuggestions} disabled={isSkillsLoading || !isEditing} className="w-full md:w-auto">
            {isSkillsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
            {isEditing ? t("profile.getSkillSuggestions", { default: "Get Skill Suggestions" }) : t("profile.editToGetSuggestions", { default: "Edit Profile to Get Suggestions" })}
          </Button>
        </CardFooter>
      </Card>

    </TooltipProvider>

    <Dialog open={isProfileSavedDialogOpen} onOpenChange={setIsProfileSavedDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            {t("profile.savedTitle", { default: "Profile Saved Successfully!" })}
          </DialogTitle>
          <DialogUIDescription>
            {t("profile.savedDesc", { default: "Your profile information has been updated." })}
          </DialogUIDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={() => setIsProfileSavedDialogOpen(false)}>{t("profile.ok", { default: "OK" })}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}
