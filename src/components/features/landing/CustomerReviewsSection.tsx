
"use client";

import { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const customerReviews = [
    { name: "Alice Wonderland", review: "JobMatch AI helped me land my dream job at Google! The AI Mock Interview feature was a game-changer.", avatar: "https://picsum.photos/seed/alice/50/50" },
    { name: "Bob The Builder", review: "The resume analyzer gave me insights I never thought of. Highly recommend this platform!", avatar: "https://picsum.photos/seed/bob/50/50" },
    { name: "Charlie Brown", review: "The alumni network feature connected me with mentors who guided me through my career transition.", avatar: "https://picsum.photos/seed/charlie/50/50" },
    { name: "Diana Prince", review: "The gamified rewards kept me motivated throughout my job search journey. Great platform!", avatar: "https://picsum.photos/seed/diana/50/50" },
    { name: "Eve Adams", review: "The job tracker feature helped me stay organized and focused during my job search.", avatar: "https://picsum.photos/seed/eve/50/50" },
    { name: "Frank Castle", review: "The resume templates are professional and easy to customize. Highly recommended!", avatar: "https://picsum.photos/seed/frank/50/50" },
];

export default function CustomerReviewsSection() {
    const plugin = useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );
    
    return (
        <section className="py-16 sm:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12">What Our Users Say</h2>
            <Carousel
              plugins={[plugin.current]}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{ align: "start", loop: true, }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {customerReviews.map((review, index) => (
                  <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col items-center justify-center text-center p-6 shadow-lg">
                        <Avatar className="w-16 h-16 mb-4">
                          <AvatarImage src={review.avatar} alt={review.name} />
                          <AvatarFallback>{review.name[0]}</AvatarFallback>
                        </Avatar>
                        <CardContent className="p-0">
                           <p className="text-sm text-muted-foreground italic">"{review.review}"</p>
                           <p className="text-sm text-primary font-semibold mt-4">- {review.name}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-[-1rem] bg-card hover:bg-secondary" />
              <CarouselNext className="mr-[-1rem] bg-card hover:bg-secondary" />
            </Carousel>
          </div>
        </section>
    );
}
