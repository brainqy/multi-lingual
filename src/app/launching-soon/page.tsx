
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { Rocket, Mail } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import SpreadTheWordCard from '@/components/features/SpreadTheWordCard';
import type { UserProfile } from '@/types';


export default function LaunchingSoonPage() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const [isWaitlistJoined, setIsWaitlistJoined] = useState(false);
  const [waitlistUser, setWaitlistUser] = useState<UserProfile | null>(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Effect for real-time social proof toasts
  useEffect(() => {
    const sampleNames = ['Ram', 'Jyoti', 'Aarav', 'Priya', 'Vikram', 'Anika', 'Rohan', 'Sneha', 'Arjun'];
    const intervals = [7000, 12000, 9000, 15000, 10000]; // Random intervals in ms

    const showRandomToast = () => {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      toast({
        title: "🎉 New Waitlist Signup!",
        description: `${randomName} just joined the waitlist.`,
      });
    };

    // Show one immediately after a short delay to start the effect
    const initialTimeout = setTimeout(showRandomToast, 4000);

    // Then set up the interval for subsequent toasts
    const intervalId = setInterval(() => {
      showRandomToast();
    }, intervals[Math.floor(Math.random() * intervals.length)]);

    // Cleanup on component unmount
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [toast]); // Dependency array includes toast to ensure it's available

  // Effect for the countdown timer
  useEffect(() => {
    // Set a fixed future date for the launch: August 1st, 2025, at 12:00 PM IST
    const launchDate = new Date("2025-08-01T12:00:00+05:30");

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleJoinWaitlist = (e: FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      console.log('Waitlist submission:', email);
      
      toast({
        title: "You're on the list!",
        description: `We've added ${email} to our waiting list. We'll notify you on launch!`,
      });
      
      const mockUser: UserProfile = {
        id: 'waitlist-user',
        name: 'A Future User',
        email: email,
        referralCode: 'WAITLIST25',
        tenantId: 'platform',
        role: 'user',
        currentJobTitle: '',
        company: '',
        shortBio: '',
        university: '',
        skills: [],
        bio: ''
      };

      setWaitlistUser(mockUser);
      setIsWaitlistJoined(true);
      setEmail('');
    } else {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  const TimeUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center justify-center bg-primary/10 p-4 rounded-lg shadow-inner min-w-[70px]">
      <span className="text-4xl font-bold text-primary">{String(value).padStart(2, '0')}</span>
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <Rocket className="h-24 w-24 text-primary mb-8 animate-pulse" />
      <h1 className="text-5xl font-headline font-bold text-primary mb-4">
        Launching Soon!
      </h1>
      <p className="text-xl text-foreground/80 mb-6 max-w-lg">
        We are working hard to bring you something amazing.
      </p>

      {/* Countdown Timer */}
      <div className="flex items-center space-x-2 sm:space-x-4 mb-10">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>

      {isWaitlistJoined && waitlistUser ? (
        <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-2">Thank You for Joining!</h2>
            <p className="text-muted-foreground mb-4">
                While you wait, join our community and share the excitement with your friends!
            </p>
            <Button 
              onClick={() => window.open('https://chat.whatsapp.com/EPfjQi6YXs6AyfBHrrx8K3', '_blank')}
              className="mb-4 bg-green-600 hover:bg-green-700 text-white w-full"
              size="lg"
            >
                <img src="/images/wht.svg" alt="WhatsApp" />
                Join our WhatsApp Community
            </Button>
            <SpreadTheWordCard user={waitlistUser} />
        </div>
      ) : (
        <>
            <p className="text-muted-foreground mb-6">
                Be the first to know when we launch. Join our waiting list!
            </p>
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader>
                <CardTitle>Join the Waitlist</CardTitle>
                <CardDescription>Get notified when JobMatch AI goes live.</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row items-center gap-2">
                    <Label htmlFor="email-waitlist" className="sr-only">
                    Email
                    </Label>
                    <div className="relative w-full">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="email-waitlist"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                    Notify Me
                    </Button>
                </form>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
