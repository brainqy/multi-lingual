
"use client";

import { useState, type FormEvent } from 'react';
import { Rocket, Mail } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';


export default function LaunchingSoonPage() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleJoinWaitlist = (e: FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      console.log('Waitlist submission:', email);
      toast({
        title: "You're on the list!",
        description: `We've added ${email} to our waiting list. We'll notify you on launch!`,
      });
      setEmail('');
    } else {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <Rocket className="h-24 w-24 text-primary mb-8 animate-pulse" />
      <h1 className="text-5xl font-headline font-bold text-primary mb-4">
        Launching Soon!
      </h1>
      <p className="text-xl text-foreground/80 mb-2 max-w-lg">
        We are working hard to bring you something amazing.
      </p>
      <p className="text-muted-foreground mb-10">
        Be the first to know when we launch. Join our waiting list!
      </p>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>Join the Waitlist</CardTitle>
          <CardDescription>Get notified when ResumeMatch AI goes live.</CardDescription>
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
    </div>
  );
}
