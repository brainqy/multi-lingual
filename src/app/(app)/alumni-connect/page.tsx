
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Briefcase, GraduationCap, MessageSquare, Eye, CalendarDays, Coins, Filter as FilterIcon, User as UserIcon, Mail, CalendarPlus, Star, ChevronLeft, ChevronRight, Edit3, Loader2 } from "lucide-react";
import { getUsers, updateUser } from "@/lib/data-services/users";
import type { AlumniProfile, PreferredTimeSlot, UserProfile } from "@/types";
import { PreferredTimeSlots } from "@/types";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Image from "next/image";
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/hooks/use-auth';
import { getWallet, updateWallet } from '@/lib/actions/wallet';
import { createAppointment } from '@/lib/actions/appointments';

const bookingSchema = z.object({
  purpose: z.string().min(10, "Purpose must be at least 10 characters."),
  preferredDate: z.date({ required_error: "Preferred date is required." }),
  preferredTimeSlot: z.string().min(1, "Preferred time slot is required."),
  message: z.string().optional(),
});
type BookingFormData = z.infer<typeof bookingSchema>;

export default function AlumniConnectPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [allAlumniData, setAllAlumniData] = useState<AlumniProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedUniversities, setSelectedUniversities] = useState<Set<string>>(new Set());

  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [alumniToBook, setAlumniToBook] = useState<AlumniProfile | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const alumniPerPage = 9;

  const { control, handleSubmit: handleBookingSubmit, reset: resetBookingForm, formState: { errors: bookingErrors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      purpose: '',
      preferredTimeSlot: PreferredTimeSlots[0],
      message: '',
    }
  });

  const fetchAlumni = useCallback(async () => {
    setIsLoading(true);
    // Fetch all users, then filter on the client-side based on the current user's tenant.
    const users = await getUsers(); 
    setAllAlumniData(users as AlumniProfile[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCompanies, selectedSkills, selectedUniversities]);

  const distinguishedAlumni = useMemo(() => allAlumniData.filter(a => a.isDistinguished), [allAlumniData]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(allAlumniData.map(a => a.currentOrganization).filter(Boolean))).sort(), [allAlumniData]);
  const uniqueSkills = useMemo(() => Array.from(new Set(allAlumniData.flatMap(a => a.skills))).sort(), [allAlumniData]);
  const uniqueUniversities = useMemo(() => Array.from(new Set(allAlumniData.map(a => a.university).filter(Boolean))).sort(), [allAlumniData]);

  const filteredAlumni = useMemo(() => {
    if (!currentUser) return [];

    // Filter alumni to show only those from the same tenant or the 'platform' tenant
    let results = allAlumniData.filter(alumni => 
      alumni.id !== currentUser.id && 
      (alumni.tenantId === currentUser.tenantId || alumni.tenantId === 'platform')
    );

    if (searchTerm) {
      results = results.filter(alumni =>
        alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alumni.currentJobTitle && alumni.currentJobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedCompanies.size > 0) {
      results = results.filter(alumni => alumni.currentOrganization && selectedCompanies.has(alumni.currentOrganization));
    }
    if (selectedSkills.size > 0) {
      results = results.filter(alumni => alumni.skills.some(skill => selectedSkills.has(skill)));
    }
    if (selectedUniversities.size > 0) {
      results = results.filter(alumni => alumni.university && selectedUniversities.has(alumni.university));
    }
    return results;
  }, [searchTerm, selectedCompanies, selectedSkills, selectedUniversities, allAlumniData, currentUser]);

  const paginatedAlumni = useMemo(() => {
    const startIndex = (currentPage - 1) * alumniPerPage;
    return filteredAlumni.slice(startIndex, startIndex + alumniPerPage);
  }, [filteredAlumni, currentPage, alumniPerPage]);

  const totalPages = Math.ceil(filteredAlumni.length / alumniPerPage);

  const handleFilterChange = (filterSet: Set<string>, item: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(filterSet);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setter(newSet);
  };

  const handleSendMessage = (alumniName: string) => {
    toast({
      title: "Message Sent (Mock)",
      description: `Your message to ${alumniName} has been sent. This is a mocked feature.`,
    });
  };

  const openBookingDialog = (alumni: AlumniProfile) => {
    setAlumniToBook(alumni);
    resetBookingForm({
      purpose: '',
      preferredDate: new Date(),
      preferredTimeSlot: PreferredTimeSlots[0],
      message: ''
    });
    setIsBookingDialogOpen(true);
  };

  const onBookAppointmentSubmit = async (data: BookingFormData) => {
    if (!alumniToBook || !currentUser) return;
    const cost = alumniToBook.appointmentCoinCost || 10;
    
    const userWallet = await getWallet(currentUser.id);

    if (!userWallet || userWallet.coins < cost) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${cost} coins for this appointment. You currently have ${userWallet?.coins || 0}.`,
        variant: "destructive",
      });
      return;
    }
    
    const [hourStr] = data.preferredTimeSlot.match(/\d+/) || ['0'];
    const isPM = data.preferredTimeSlot.includes('PM');
    let hour = parseInt(hourStr, 10);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    const finalDate = new Date(data.preferredDate);
    finalDate.setHours(hour, 30, 0, 0);

    const newAppointmentData = {
        tenantId: alumniToBook.tenantId,
        requesterUserId: currentUser.id,
        alumniUserId: alumniToBook.id,
        title: data.purpose,
        dateTime: finalDate.toISOString(),
        status: 'Pending' as const,
        notes: data.message,
        costInCoins: cost,
        withUser: alumniToBook.name
    };

    const newAppointment = await createAppointment(newAppointmentData);

    if (newAppointment) {
        await updateWallet(currentUser.id, {
            coins: userWallet.coins - cost,
        }, `Appointment fee for ${alumniToBook.name}`);

        toast({
          title: `-${cost} Coins`,
          description: `Your appointment request with ${alumniToBook.name} has been sent.`,
        });
        setIsBookingDialogOpen(false);
    } else {
        toast({ title: "Booking Failed", description: "Could not create the appointment. Please try again.", variant: "destructive" });
    }
  };

  const handleToggleDistinguished = async (alumniId: string) => {
    if (!currentUser) return;
    const alumniToUpdate = allAlumniData.find(a => a.id === alumniId);
    if (!alumniToUpdate) return;

    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      toast({ title: "Permission Denied", description: "You do not have permission to change this status.", variant: "destructive" });
      return;
    }

    const newDistinguishedStatus = !alumniToUpdate.isDistinguished;
    
    // Optimistically update UI
    setAllAlumniData(prevAlumni =>
        prevAlumni.map(a =>
            a.id === alumniId ? { ...a, isDistinguished: newDistinguishedStatus } : a
        )
    );
    
    // Update database
    const updatedUser = await updateUser(alumniId, { isDistinguished: newDistinguishedStatus });

    if (updatedUser) {
        toast({ title: "Status Updated", description: `${updatedUser.name} marked as ${newDistinguishedStatus ? "distinguished" : "not distinguished"}.` });
    } else {
        // Revert UI on failure
        setAllAlumniData(prevAlumni =>
            prevAlumni.map(a =>
                a.id === alumniId ? { ...a, isDistinguished: !newDistinguishedStatus } : a
            )
        );
        toast({ title: "Update Failed", description: "Could not update the user's status.", variant: "destructive"});
    }
  };

  const renderTags = (tags: string[] | undefined, maxVisible: number = 3) => {
    if (!tags || tags.length === 0) return <p className="text-xs text-muted-foreground">N/A</p>;
    const visibleTags = tags.slice(0, maxVisible);
    const remainingCount = tags.length - maxVisible;
    return (
      <div className="flex flex-wrap gap-1">
        {visibleTags.map(tag => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">{tag}</span>
        ))}
        {remainingCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">+{remainingCount} more</span>
        )}
      </div>
    );
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("alumniConnect.title", { default: "Alumni Directory" })}</h1>
        <p className="text-muted-foreground mt-1">
          {t("alumniConnect.pageDescription", { default: "Connect with fellow alumni. Discover skills, interests, and potential collaborators." })}
        </p>
      </div>

      {distinguishedAlumni.length > 0 && (
        <Card data-testid="distinguished-alumni-carousel" className="shadow-lg bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
              <Star className="h-6 w-6" /> {t("alumniConnect.distinguishedTitle", { default: "Most Distinguished Alumni" })}
            </CardTitle>
            <CardDescription>{t("alumniConnect.distinguishedDesc", { default: "Spotlight on our accomplished alumni making an impact." })}</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: "start",
                loop: distinguishedAlumni.length > 2,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {distinguishedAlumni.map((alumni) => (
                  <CarouselItem key={alumni.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                    <Card className="h-full flex flex-col shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 flex-grow flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-3 border-2 border-primary">
                          <AvatarImage src={alumni.profilePictureUrl || `https://avatar.vercel.sh/${alumni.email}.png`} alt={alumni.name} data-ai-hint="person portrait" />
                          <AvatarFallback className="text-2xl">{alumni.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-md font-semibold text-foreground">{alumni.name}</h3>
                        <p className="text-xs text-primary">{alumni.currentJobTitle}</p>
                        <p className="text-xs text-muted-foreground mb-2">{alumni.currentOrganization}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 flex-grow">{alumni.shortBio}</p>
                      </CardContent>
                      <CardFooter className="p-3 border-t mt-auto">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => toast({ title: "View Profile (Mock)", description: `Viewing profile of ${alumni.name}.`})}>
                          <Eye className="mr-1 h-3.5 w-3.5" /> View Profile
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {distinguishedAlumni.length > 1 && (
                <>
                    <CarouselPrevious className="ml-2 bg-card hover:bg-secondary" />
                    <CarouselNext className="mr-2 bg-card hover:bg-secondary" />
                </>
              )}
            </Carousel>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full bg-card shadow-lg rounded-lg">
        <AccordionItem value="filters">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Button variant="ghost" size="sm" className="gap-2">
                <FilterIcon className="h-5 w-5" /> {t("alumniConnect.filters", { default: "Filters" })}
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <div className="space-y-1">
                <Label htmlFor="search-term">{t("alumniConnect.nameOrJobTitle", { default: "Name or Job Title" })}</Label>
                <Input id="search-term" placeholder={t("alumniConnect.namePlaceholder", { default: "e.g., Alice Wonderland" })} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("alumniConnect.company", { default: "Company" })}</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueCompanies.map(company => (
                      <div key={company} className="flex items-center space-x-2">
                        <Checkbox
                          id={`comp-${company}`}
                          checked={selectedCompanies.has(company)}
                          onCheckedChange={() => handleFilterChange(selectedCompanies, company, setSelectedCompanies)}
                          aria-label={company}
                        />
                        <Label htmlFor={`comp-${company}`} className="font-normal">{company}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("alumniConnect.skills", { default: "Skills" })}</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueSkills.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={selectedSkills.has(skill)}
                          onCheckedChange={() => handleFilterChange(selectedSkills, skill, setSelectedSkills)}
                        />
                        <Label htmlFor={`skill-${skill}`} className="font-normal">{skill}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("alumniConnect.university", { default: "University" })}</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueUniversities.map(uni => (
                      <div key={uni} className="flex items-center space-x-2">
                        <Checkbox
                          id={`uni-${uni}`}
                          checked={selectedUniversities.has(uni)}
                          onCheckedChange={() => handleFilterChange(selectedUniversities, uni, setSelectedUniversities)}
                        />
                        <Label htmlFor={`uni-${uni}`} className="font-normal">{uni}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {filteredAlumni.length === 0 ? (
        <Card className="text-center py-12 shadow-md col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-2xl">{t("alumniConnect.noAlumniFound", { default: "No Alumni Found" })}</CardTitle>
                <CardDescription>
                  {t("alumniConnect.tryAdjusting", { default: "Try adjusting your search or filter criteria." })}
                </CardDescription>
            </CardHeader>
        </Card>
      ) : (
        <>
        <div data-testid="alumni-directory-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAlumni.map(alumni => (
            <Card key={alumni.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardContent className="pt-6 flex-grow">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={alumni.profilePictureUrl || `https://avatar.vercel.sh/${alumni.email}.png`} alt={alumni.name} data-ai-hint="person portrait" />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{alumni.name}</h3>
                    <p className="text-sm text-primary">{alumni.currentJobTitle} at {alumni.currentOrganization}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Mail className="h-3 w-3 mr-1" /> {alumni.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Skills:</h4>
                    {renderTags(alumni.skills, 5)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Interests:</h4>
                    {renderTags(alumni.interests, 3)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Offers Help With:</h4>
                    {renderTags(alumni.offersHelpWith, 3)}
                  </div>
                </div>
                 <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{alumni.shortBio}</p>
                 <p className="text-xs text-muted-foreground mb-3"><GraduationCap className="inline h-3 w-3 mr-1"/>{alumni.university}</p>
                 {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                    <div className="flex items-center space-x-2 my-2 p-2 border-t border-b">
                      <Switch
                        id={`distinguished-${alumni.id}`}
                        checked={alumni.isDistinguished}
                        onCheckedChange={() => handleToggleDistinguished(alumni.id)}
                      />
                      <Label htmlFor={`distinguished-${alumni.id}`} className="text-xs font-normal">Mark as Distinguished</Label>
                    </div>
                  )}
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto flex flex-col space-y-2">
                <div className="flex w-full justify-between items-center">
                   <Button variant="outline" size="sm" onClick={() => toast({ title: "View Profile (Mock)", description: `Viewing profile of ${alumni.name}. This feature is for demonstration.`})}>
                    <Eye className="mr-1 h-4 w-4" /> View Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSendMessage(alumni.name)}>
                    <MessageSquare className="mr-1 h-4 w-4" /> Message
                  </Button>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => openBookingDialog(alumni)}
                  >
                    <CalendarDays className="mr-1 h-4 w-4" /> Book ({alumni.appointmentCoinCost || 10} <Coins className="ml-1 -mr-0.5 h-3 w-3" />)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {totalPages > 1 && (
            <div className="flex items-center justify-center pt-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="mx-4 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        )}
        </>
      )}

      <Dialog open={isBookingDialogOpen} onOpenChange={(isOpen) => {
        setIsBookingDialogOpen(isOpen);
        if (!isOpen) setAlumniToBook(null);
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {t("alumniConnect.bookTitle", { default: "Book Appointment with {name}", name: alumniToBook?.name || '' })}
            </DialogTitle>
            <CardDescription>
              {t("alumniConnect.bookDesc", { default: "Complete the form below to request a meeting." })}
            </CardDescription>
          </DialogHeader>
          {alumniToBook && (
            <form onSubmit={handleBookingSubmit(onBookAppointmentSubmit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="purpose">{t("alumniConnect.purposeLabel", { default: "Purpose of Meeting" })}</Label>
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => <Textarea id="purpose" placeholder={t("alumniConnect.purposePlaceholder", { default: "e.g., Career advice, Mock interview..." })} {...field} />}
                />
                {bookingErrors.purpose && <p className="text-sm text-destructive mt-1">{bookingErrors.purpose.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredDate">{t("alumniConnect.preferredDate", { default: "Preferred Date" })}</Label>
                  <Controller
                    name="preferredDate"
                    control={control}
                    render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                  />
                  {bookingErrors.preferredDate && <p className="text-sm text-destructive mt-1">{bookingErrors.preferredDate.message}</p>}
                </div>
                <div>
                  <Label htmlFor="preferredTimeSlot">{t("alumniConnect.preferredTimeSlot", { default: "Preferred Time Slot" })}</Label>
                  <Controller
                    name="preferredTimeSlot"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="preferredTimeSlot"><SelectValue placeholder={t("alumniConnect.selectTimeSlot", { default: "Select a time slot" })} /></SelectTrigger>
                        <SelectContent>
                          {PreferredTimeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {bookingErrors.preferredTimeSlot && <p className="text-sm text-destructive mt-1">{bookingErrors.preferredTimeSlot.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="message">{t("alumniConnect.messageOptional", { default: "Brief Message (Optional)" })}</Label>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => <Textarea id="message" placeholder={t("alumniConnect.messagePlaceholder", { default: "Any additional details for your request." })} rows={3} {...field} />}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("alumniConnect.feeNotice_part1", { default: "A fee of " })}
                <strong className="text-primary">{alumniToBook.appointmentCoinCost || 10} coins</strong>
                {t("alumniConnect.feeNotice_part2", { default: " will be deducted upon confirmation." })}
              </p>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">{t("alumniConnect.cancel", { default: "Cancel" })}</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <CalendarPlus className="mr-2 h-4 w-4"/> {t("alumniConnect.requestAppointment", { default: "Request Appointment" })}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
