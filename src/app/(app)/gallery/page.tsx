
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GalleryVerticalEnd, CalendarDays, Users, UserCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { sampleEvents, sampleUserProfile, samplePlatformUsers } from "@/lib/sample-data";
import Image from "next/image";
import type { UserProfile, GalleryEvent } from "@/types"; 
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"; 

export default function GalleryPage() {
  const { t } = useI18n();
  const currentUser = sampleUserProfile;
  const [selectedEventParticipants, setSelectedEventParticipants] = useState<UserProfile[]>([]);
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [viewingEventTitle, setViewingEventTitle] = useState("");

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedEventForImageView, setSelectedEventForImageView] = useState<GalleryEvent | null>(null);


  const handleViewParticipants = (event: GalleryEvent) => {
    if (!event.attendeeUserIds) {
      setSelectedEventParticipants([]);
      setViewingEventTitle(event.title);
      setIsParticipantDialogOpen(true);
      return;
    }
    const participants = samplePlatformUsers.filter(user => event.attendeeUserIds!.includes(user.id));
    setSelectedEventParticipants(participants);
    setViewingEventTitle(event.title);
    setIsParticipantDialogOpen(true);
  };

  const openImageViewer = (event: GalleryEvent) => {
    setSelectedEventForImageView(event);
    setIsImageViewerOpen(true);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <GalleryVerticalEnd className="h-8 w-8" /> {t("gallery.title")}
      </h1>
      <CardDescription>{t("gallery.pageDescription")}</CardDescription>

      {sampleEvents.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <GalleryVerticalEnd className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">{t("gallery.noEvents")}</CardTitle>
            <CardDescription>
              {t("gallery.noEventsHint")}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleEvents.map((event) => {
            const canViewAttendees =
              event.createdByUserId === currentUser.id ||
              currentUser.role === 'admin' ||
              (currentUser.role === 'manager' && event.tenantId === currentUser.tenantId);

            return (
              <Card key={event.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
                
                    <button onClick={() => openImageViewer(event)} className="block w-full aspect-video relative cursor-pointer group">
                      {event.imageUrls && event.imageUrls.length > 0 ? (
                        <Image
                            src={event.imageUrls[0]}
                            alt={event.title}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={event.dataAiHint || "event photo"}
                            className="group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
                          No Image
                        </div>
                      )}
                       <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-8 w-8 text-white" />
                       </div>
                    </button>
                
                <CardHeader className="pt-4 pb-2">
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="py-2 flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description || "A memorable event."}</p>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between items-center">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-4 w-4"/> {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {canViewAttendees && event.attendeeUserIds && event.attendeeUserIds.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs p-0 h-auto text-primary hover:underline"
                      onClick={() => handleViewParticipants(event)}
                    >
                      <Users className="mr-1 h-4 w-4 text-primary"/> Attendees: {event.attendeeUserIds.length}
                    </Button>
                  )}
                  {(!canViewAttendees || !event.attendeeUserIds || event.attendeeUserIds.length === 0) && event.attendeeUserIds && event.attendeeUserIds.length > 0 && (
                     <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4"/> Attendees: {event.attendeeUserIds.length}
                    </p>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Attendee List Dialog */}
      <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("gallery.participantsFor", { title: viewingEventTitle })}</DialogTitle>
            <CardDescription>{t("gallery.participantListDesc")}</CardDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedEventParticipants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("gallery.noParticipants")}</p>
            ) : (
              <ul className="space-y-3 py-2">
                {selectedEventParticipants.map(participant => (
                  <li key={participant.id} className="flex items-center gap-3 p-2 border rounded-md hover:bg-secondary/30">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.profilePictureUrl} alt={participant.name} data-ai-hint="person face"/>
                      <AvatarFallback>{participant.name?.substring(0,1) || <UserCircle className="h-4 w-4"/>}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">{participant.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("gallery.close")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="max-w-3xl p-0">
          {selectedEventForImageView && (
            <>
              <DialogHeader className="p-4 pb-0">
                <DialogTitle>{selectedEventForImageView.title}</DialogTitle>
                <CardDescription>
                  {selectedEventForImageView.description ||
                    new Date(selectedEventForImageView.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </DialogHeader>
              <div className="p-4">
                {selectedEventForImageView.imageUrls && selectedEventForImageView.imageUrls.length > 0 ? (
                  <Carousel className="w-full" opts={{ loop: selectedEventForImageView.imageUrls.length > 1 }}>
                    <CarouselContent>
                      {selectedEventForImageView.imageUrls.map((url, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                            <Image
                              src={url}
                              alt={`${selectedEventForImageView.title} - Image ${index + 1}`}
                              layout="fill"
                              objectFit="contain"
                              data-ai-hint={selectedEventForImageView.dataAiHint || "event photo detail"}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {selectedEventForImageView.imageUrls.length > 1 && (
                      <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t("gallery.noImages")}</p>
                )}
              </div>
              <DialogFooter className="p-4 border-t">
                <DialogClose asChild>
                  <Button variant="outline">{t("gallery.close")}</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
