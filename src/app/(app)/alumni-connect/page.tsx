
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { Users, Search, Briefcase, GraduationCap, MessageSquare, Eye, CalendarDays, Coins, Filter as FilterIcon, User as UserIcon, Mail, CalendarPlus, Star, ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import { sampleAlumni, sampleUserProfile } from "@/lib/sample-data";
import type { AlumniProfile, PreferredTimeSlot } from "@/types";
import { PreferredTimeSlots } from "@/types";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Image from "next/image";
import { Switch } from '@/components/ui/switch';

const bookingSchema = z.object({
  purpose: z.string().min(10, "Purpose must be at least 10 characters."),
  preferredDate: z.date({ required_error: "Preferred date is required." }),
  preferredTimeSlot: z.string().min(1, "Preferred time slot is required."),
  message: z.string().optional(),
});
type BookingFormData = z.infer<typeof bookingSchema>;

export default function AlumniConnectPage() {
  const [allAlumniData, setAllAlumniData] = useState<AlumniProfile[]>(sampleAlumni);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedUniversities, setSelectedUniversities] = useState<Set<string>>(new Set());

  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [alumniToBook, setAlumniToBook] = useState<AlumniProfile | null>(null);

  const { control, handleSubmit: handleBookingSubmit, reset: resetBookingForm, formState: { errors: bookingErrors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      purpose: '',
      preferredTimeSlot: PreferredTimeSlots[0],
      message: '',
    }
  });

  useEffect(() => {
    setAllAlumniData(sampleAlumni); // Ensure local state is in sync with potentially mutated global sample
  }, [sampleAlumni]); // Add sampleAlumni to dependency array if it can be mutated globally and needs to trigger refresh

  const distinguishedAlumni = useMemo(() => allAlumniData.filter(a => a.isDistinguished), [allAlumniData]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(allAlumniData.map(a => a.company))).sort(), [allAlumniData]);
  const uniqueSkills = useMemo(() => Array.from(new Set(allAlumniData.flatMap(a => a.skills))).sort(), [allAlumniData]);
  const uniqueUniversities = useMemo(() => Array.from(new Set(allAlumniData.map(a => a.university))).sort(), [allAlumniData]);

  const filteredAlumni = useMemo(() => {
    let results = allAlumniData;
    if (searchTerm) {
      results = results.filter(alumni =>
        alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.currentJobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCompanies.size > 0) {
      results = results.filter(alumni => selectedCompanies.has(alumni.company));
    }
    if (selectedSkills.size > 0) {
      results = results.filter(alumni => alumni.skills.some(skill => selectedSkills.has(skill)));
    }
    if (selectedUniversities.size > 0) {
      results = results.filter(alumni => selectedUniversities.has(alumni.university));
    }
    return results;
  }, [searchTerm, selectedCompanies, selectedSkills, selectedUniversities, allAlumniData]);

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

  const onBookAppointmentSubmit = (data: BookingFormData) => {
    if (!alumniToBook) return;

    toast({
      title: "Coins Deducted (Mock)",
      description: `${alumniToBook.appointmentCoinCost || 10} coins deducted from your wallet.`,
    });
    toast({
      title: "Appointment Request Sent (Mock)",
      description: `Your appointment request with ${alumniToBook.name} for ${data.preferredDate.toLocaleDateString()} (${data.preferredTimeSlot}) regarding "${data.purpose.substring(0,20)}..." has been sent.`,
    });
    setIsBookingDialogOpen(false);
  };

  const handleToggleDistinguished = (alumniId: string) => {
    const alumniToUpdate = allAlumniData.find(a => a.id === alumniId);
    if (!alumniToUpdate) return;

    // Updated Permission check: Admin or Manager can toggle anyone's distinguished status.
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      toast({ title: "Permission Denied", description: "You do not have permission to change this alumnus's distinguished status.", variant: "destructive" });
      return;
    }

    const newDistinguishedStatus = !alumniToUpdate.isDistinguished;

    // Update the global sampleAlumni (for demo persistence across app)
    const globalAlumniIndex = sampleAlumni.findIndex(a => a.id === alumniId);
    if (globalAlumniIndex !== -1) {
        sampleAlumni[globalAlumniIndex].isDistinguished = newDistinguishedStatus;
    }

    // Update the local state for immediate UI refresh
    setAllAlumniData(prevAlumni =>
        prevAlumni.map(a =>
            a.id === alumniId ? { ...a, isDistinguished: newDistinguishedStatus } : a
        )
    );
    toast({ title: "Status Updated", description: `${alumniToUpdate.name} marked as ${newDistinguishedStatus ? "distinguished" : "not distinguished"}.` });
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


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Alumni Directory</h1>
        <p className="text-muted-foreground mt-1">Connect with fellow alumni. Discover skills, interests, and potential collaborators.</p>
      </div>

      {distinguishedAlumni.length > 0 && (
        <Card className="shadow-lg bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
              <Star className="h-6 w-6" /> Most Distinguished Alumni
            </CardTitle>
            <CardDescription>Spotlight on our accomplished alumni making an impact.</CardDescription>
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
                        <p className="text-xs text-muted-foreground mb-2">{alumni.company}</p>
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
              <FilterIcon className="h-5 w-5" /> Filters
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <div className="space-y-1">
                <Label htmlFor="search-term">Name or Job Title</Label>
                <Input id="search-term" placeholder="e.g., Alice Wonderland" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <h4 className="font-medium mb-2">Company</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueCompanies.map(company => (
                      <div key={company} className="flex items-center space-x-2">
                        <Checkbox
                          id={`comp-${company}`}
                          checked={selectedCompanies.has(company)}
                          onCheckedChange={() => handleFilterChange(selectedCompanies, company, setSelectedCompanies)}
                        />
                        <Label htmlFor={`comp-${company}`} className="font-normal">{company}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
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
                <h4 className="font-medium mb-2">University</h4>
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
                <CardTitle className="text-2xl">No Alumni Found</CardTitle>
                <CardDescription>
                Try adjusting your search or filter criteria.
                </CardDescription>
            </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map(alumni => (
            <Card key={alumni.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardContent className="pt-6 flex-grow">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={alumni.profilePictureUrl || `https://avatar.vercel.sh/${alumni.email}.png`} alt={alumni.name} data-ai-hint="person portrait" />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{alumni.name}</h3>
                    <p className="text-sm text-primary">{alumni.currentJobTitle} at {alumni.company}</p>
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
                        // A manager can toggle any alumnus's distinguished status. An admin can too.
                        // This switch is primarily for admin/manager roles. Regular users won't see it.
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
      )}

      <Dialog open={isBookingDialogOpen} onOpenChange={(isOpen) => {
        setIsBookingDialogOpen(isOpen);
        if (!isOpen) setAlumniToBook(null);
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Book Appointment with {alumniToBook?.name}</DialogTitle>
            <CardDescription>Complete the form below to request a meeting.</CardDescription>
          </DialogHeader>
          {alumniToBook && (
            <form onSubmit={handleBookingSubmit(onBookAppointmentSubmit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="purpose">Purpose of Meeting</Label>
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => <Textarea id="purpose" placeholder="e.g., Career advice, Mock interview..." {...field} />}
                />
                {bookingErrors.purpose && <p className="text-sm text-destructive mt-1">{bookingErrors.purpose.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Controller
                    name="preferredDate"
                    control={control}
                    render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                  />
                  {bookingErrors.preferredDate && <p className="text-sm text-destructive mt-1">{bookingErrors.preferredDate.message}</p>}
                </div>
                <div>
                  <Label htmlFor="preferredTimeSlot">Preferred Time Slot</Label>
                  <Controller
                    name="preferredTimeSlot"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="preferredTimeSlot"><SelectValue placeholder="Select a time slot" /></SelectTrigger>
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
                <Label htmlFor="message">Brief Message (Optional)</Label>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => <Textarea id="message" placeholder="Any additional details for your request." rows={3} {...field} />}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                A fee of <strong className="text-primary">{alumniToBook.appointmentCoinCost || 10} coins</strong> will be deducted upon confirmation.
              </p>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <CalendarPlus className="mr-2 h-4 w-4"/> Request Appointment
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

