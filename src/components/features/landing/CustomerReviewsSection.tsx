
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const customerReviews = [
    { name: "Alice Wonderland", review: "JobMatch AI helped me land my dream job at Google! The AI Mock Interview feature was a game-changer.", avatar: "https://picsum.photos/seed/alice/50/50" },
    { name: "Bob The Builder", review: "The resume analyzer gave me insights I never thought of. Highly recommend this platform!", avatar: "https://picsum.photos/seed/bob/50/50" },
    { name: "Charlie Brown", review: "The alumni network feature connected me with mentors who guided me through my career transition.", avatar: "https://picsum.photos/seed/charlie/50/50" },
    { name: "Diana Prince", review: "The gamified rewards kept me motivated throughout my job search journey. Great platform!", avatar: "https://picsum.photos/seed/diana/50/50" },
    { name: "Eve Adams", review: "The job tracker feature helped me stay organized and focused during my job search.", avatar: "https://picsum.photos/seed/eve/50/50" },
    { name: "Frank Castle", review: "The resume templates are professional and easy to customize. Highly recommended!", avatar: "https://picsum.photos/seed/frank/50/50" },
];

export default function CustomerReviewsSection() {
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % customerReviews.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // To prevent hydration mismatch, we can return a placeholder or null on initial render
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return (
            <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8">What Our Users Say</h2>
                    <div className="relative overflow-hidden h-48 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading reviews...</p>
                    </div>
                </div>
            </section>
        );
    }
    
    return (
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8">What Our Users Say</h2>
            <div className="relative overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500"
                style={{ transform: `translateX(-${currentReviewIndex * 100 / 3}%)` }} // Adjust based on number of visible items
              >
                {customerReviews.map((review, index) => (
                  <div
                    key={index}
                    className="w-full md:w-1/3 shrink-0 p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center gap-4"
                  >
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={review.avatar} alt={review.name} />
                      <AvatarFallback>{review.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{review.review}</p>
                      <p className="text-xs text-primary font-semibold mt-2">{review.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
    );
}
