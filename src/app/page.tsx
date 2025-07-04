
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, Briefcase, Users, Zap, FileText, Edit, MessageSquare, Brain, Layers3, Award, CalendarCheck2, ArrowRight, Code2, CalendarDays, User as UserIcon, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { samplePlatformSettings, sampleBlogPosts } from "@/lib/sample-data";
import { format, parseISO } from "date-fns";

export default function LandingPage() {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const platformName = samplePlatformSettings.platformName;

  const stats = [
    { name: "Resumes Analyzed", value: "10,000+", icon: FileText },
    { name: "Successful Placements", value: "1,500+", icon: Briefcase },
    { name: "Alumni Network", value: "5,000+", icon: Users },
    { name: "AI Features Used", value: "25,000+", icon: Zap },
  ];

  const coreFeatures = [
    { title: "AI Resume Analyzer", description: "Get deep insights into your resume's match with job descriptions, ATS compatibility, and keyword optimization.", icon: Zap, dataAiHint: "resume analysis report", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "AI Resume & Cover Letter Writer", description: "Generate tailored resumes and compelling cover letters in minutes with AI assistance.", icon: Edit, dataAiHint: "ai resume writer", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Engaging Community Feed", description: "Share insights, ask questions, participate in polls, and connect with your peers.", icon: MessageSquare, dataAiHint: "community feed", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Gamified Rewards & Progress", description: "Earn XP, unlock badges, and see your progress on the leaderboard as you engage.", icon: Award, dataAiHint: "gamification rewards", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Resume Templates & Builder", description: "Choose from professional templates or build your resume step-by-step.", icon: Layers3, dataAiHint: "resume templates builder", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Comprehensive Job Tracker", description: "Organize your job applications in a visual Kanban board, set reminders, and track your progress.", icon: Briefcase, dataAiHint: "job tracker board", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Interview Preparation Hub", description: "Practice with AI mock interviews, browse a vast question bank, and take custom quizzes.", icon: Brain, dataAiHint: "interview preparation", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Alumni Connect Directory", description: "Network with fellow alumni, find mentors, and book appointments for career guidance.", icon: Users, dataAiHint: "alumni directory", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Event Management & Gallery", description: "Discover and register for alumni events, and browse past event galleries.", icon: CalendarCheck2, dataAiHint: "events gallery", imagePlaceholder: "https://placehold.co/600x400.png" },
  ];

  const trendingJobs = [
    { name: "AI & Machine Learning", icon: Brain, roles: ["ML Engineer", "Data Scientist", "AI Researcher"] },
    { name: "Frontend Development", icon: Code2, roles: ["React Developer", "Next.js Specialist", "UI Engineer"] },
    { name: "Cloud & DevOps", icon: Layers3, roles: ["Cloud Architect", "DevOps Engineer", "SRE"] },
    { name: "Product Management", icon: Zap, roles: ["Product Manager", "Product Owner", "Technical PM"] },
  ];

  const faqs = [
    { question: "What is ResumeMatch AI?", answer: "ResumeMatch AI is a platform that uses AI to optimize resumes, prepare for interviews, and connect with alumni networks." },
    { question: "How does AI Mock Interview work?", answer: "AI Mock Interview generates questions based on your job role and evaluates your answers with detailed feedback." },
    { question: "Is ResumeMatch AI free?", answer: "Yes, you can start using ResumeMatch AI for free. Premium features are available with subscription plans." },
    { question: "Can I customize my resume templates?", answer: "Absolutely! ResumeMatch AI provides customizable templates to suit your needs." },
  ];

  const customerReviews = [
    { name: "Alice Wonderland", review: "ResumeMatch AI helped me land my dream job at Google! The AI Mock Interview feature was a game-changer.", avatar: "https://picsum.photos/seed/alice/50/50" },
    { name: "Bob The Builder", review: "The resume analyzer gave me insights I never thought of. Highly recommend this platform!", avatar: "https://picsum.photos/seed/bob/50/50" },
    { name: "Charlie Brown", review: "The alumni network feature connected me with mentors who guided me through my career transition.", avatar: "https://picsum.photos/seed/charlie/50/50" },
    { name: "Diana Prince", review: "The gamified rewards kept me motivated throughout my job search journey. Great platform!", avatar: "https://picsum.photos/seed/diana/50/50" },
    { name: "Eve Adams", review: "The job tracker feature helped me stay organized and focused during my job search.", avatar: "https://picsum.photos/seed/eve/50/50" },
    { name: "Frank Castle", review: "The resume templates are professional and easy to customize. Highly recommended!", avatar: "https://picsum.photos/seed/frank/50/50" },
  ];
  
  const latestBlogPosts = sampleBlogPosts.slice(0, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % customerReviews.length); // Cyclic rotation
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, [customerReviews.length]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary via-secondary to-accent">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-7 w-7" />
            {platformName}
          </Link>
          <nav className="space-x-2 sm:space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="secondary" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Unlock Your <span className="text-primary">Career Potential</span> with AI
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
              Leverage AI to perfectly match your resume with your dream job. Get insightful analysis, generate tailored documents, practice interviews, and connect with a powerful alumni network.
            </p>
            <div className="mt-10">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                  Get Started Free
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="py-16 sm:py-24 bg-gradient-to-br from-secondary via-muted to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">All The Tools You Need to Succeed</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From crafting the perfect resume to acing the interview and building your network, ResumeMatch AI provides a comprehensive suite of tools.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
              {coreFeatures.map((feature, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex items-center gap-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Jobs Section */}
        <section id="trending-jobs" className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Trending Job Categories</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the most in-demand roles and industries our alumni are thriving in.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-10">
              {trendingJobs.map((job, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 text-left">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <job.icon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">{job.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {job.roles.map((role, rIndex) => (
                        <li key={rIndex} className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary/70 shrink-0" />
                          <span>{role}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                   <CardFooter>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Explore Roles <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 sm:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Join a Thriving Community</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.name} className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-muted-foreground mt-1">{stat.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-secondary via-muted to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8">What Our Users Say</h2>
            <div className="relative overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500"
                style={{ transform: `translateX(-${currentReviewIndex * 33.33}%)` }} // Slide one review at a time
              >
                {customerReviews.map((review, index) => (
                  <div
                    key={index}
                    className="w-1/3 p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center gap-4"
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
        
        {/* Latest Blog Posts Section */}
        <section id="blog" className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">From Our Blog</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Get the latest insights, tips, and success stories to supercharge your career.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestBlogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} passHref>
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden h-full cursor-pointer">
                    {post.imageUrl && (
                      <div className="relative w-full h-48">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint="blog post image"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {post.author}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {format(parseISO(post.date), 'MMM d, yyyy')}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    </CardContent>
                    <CardFooter className="border-t pt-4 mt-auto">
                       <div className="flex flex-wrap gap-1">
                         {post.tags?.slice(0, 2).map(tag => (
                           <span key={tag} className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full flex items-center gap-1">
                             <Tag className="h-3 w-3"/>{tag}
                           </span>
                         ))}
                       </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/blog">
                <Button variant="outline" className="px-6 py-2">
                  Read More Posts <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Ready to Elevate Your Career?</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              Stop guessing and start getting results. Sign up for ResumeMatch AI today and take the next step in your professional journey.
            </p>
            <div className="mt-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 text-lg">
                  Sign Up For Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-primary/5 text-center text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <p className="font-semibold text-foreground mb-1">{platformName}</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} {platformName}. All rights reserved.</p>
          <div className="mt-3 space-x-4 text-sm">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <span className="text-gray-400">|</span>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <span className="text-gray-400">|</span>
            <Link href="/contact" className="hover:text-primary">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
