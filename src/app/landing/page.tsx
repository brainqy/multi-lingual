
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, Briefcase, Users, Zap, FileText, Edit, MessageSquare, Brain, Layers3, Award, CalendarCheck2, ArrowRight, Code2, CalendarDays, User as UserIcon, Tag, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import CustomerReviewsSection from "@/components/features/landing/CustomerReviewsSection";
import type { PlatformSettings, BlogPost } from "@/types";
import { getPlatformSettings } from "@/lib/actions/platform-settings";
import { getBlogPosts } from "@/lib/actions/blog";
import { useI18n } from "@/hooks/use-i18n";

export default function LandingPage() {
  const { t } = useI18n();
  const [platformName, setPlatformName] = useState("Bhasha Setu");
  const [latestBlogPosts, setLatestBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [settings, posts] = await Promise.all([
        getPlatformSettings(),
        getBlogPosts(),
      ]);
      setPlatformName(settings.platformName);
      setLatestBlogPosts(posts.slice(0, 5));
      setIsLoading(false);
    }
    loadData();
  }, []);

  const stats = [
    { nameKey: "landing.stats.resumesAnalyzed", value: "10,000+", icon: FileText },
    { nameKey: "landing.stats.placements", value: "1,500+", icon: Briefcase },
    { nameKey: "landing.stats.alumniNetwork", value: "5,000+", icon: Users },
    { nameKey: "landing.stats.aiFeaturesUsed", value: "25,000+", icon: Zap },
  ];

  const coreFeatures = [
    { titleKey: "landing.features.analyzer.title", descriptionKey: "landing.features.analyzer.description", icon: Zap },
    { titleKey: "landing.features.writer.title", descriptionKey: "landing.features.writer.description", icon: Edit },
    { titleKey: "landing.features.feed.title", descriptionKey: "landing.features.feed.description", icon: MessageSquare },
    { titleKey: "landing.features.rewards.title", descriptionKey: "landing.features.rewards.description", icon: Award },
    { titleKey: "landing.features.builder.title", descriptionKey: "landing.features.builder.description", icon: Layers3 },
    { titleKey: "landing.features.tracker.title", descriptionKey: "landing.features.tracker.description", icon: Briefcase },
    { titleKey: "landing.features.prep.title", descriptionKey: "landing.features.prep.description", icon: Brain },
    { titleKey: "landing.features.connect.title", descriptionKey: "landing.features.connect.description", icon: Users },
    { titleKey: "landing.features.events.title", descriptionKey: "landing.features.events.description", icon: CalendarCheck2 },
  ];

  const trendingJobs = [
    { nameKey: "landing.trending.ai", icon: Brain, rolesKeys: ["landing.trending.ai_role1", "landing.trending.ai_role2", "landing.trending.ai_role3"] },
    { nameKey: "landing.trending.frontend", icon: Code2, rolesKeys: ["landing.trending.frontend_role1", "landing.trending.frontend_role2", "landing.trending.frontend_role3"] },
    { nameKey: "landing.trending.cloud", icon: Layers3, rolesKeys: ["landing.trending.cloud_role1", "landing.trending.cloud_role2", "landing.trending.cloud_role3"] },
    { nameKey: "landing.trending.product", icon: Zap, rolesKeys: ["landing.trending.product_role1", "landing.trending.product_role2", "landing.trending.product_role3"] },
  ];

  const faqs = [
    { questionKey: "landing.faq.q1", answerKey: "landing.faq.a1" },
    { questionKey: "landing.faq.q2", answerKey: "landing.faq.a2" },
    { questionKey: "landing.faq.q3", answerKey: "landing.faq.a3" },
    { questionKey: "landing.faq.q4", answerKey: "landing.faq.a4" },
  ];
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card text-card-foreground shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-7 w-7 text-primary" />
            <span className="hidden sm:inline">{platformName}</span>
          </Link>
          <nav className="space-x-2 sm:space-x-4 flex items-center">
            <Link href="/diwali-special">
              <Button variant="link" className="text-primary">Diwali Special</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">{t("landing.nav.login")}</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>{t("landing.nav.signup")}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground font-headline">
              {t("landing.hero.title_part1")} <span className="text-primary">{t("landing.hero.title_highlight")}</span> {t("landing.hero.title_part2")}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
              {t("landing.hero.subtitle")}
            </p>
            <div className="mt-10">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                  {t("landing.hero.cta")}
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-headline">{t("landing.features.title")}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.features.subtitle")}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
              {coreFeatures.map((feature, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 text-left">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <feature.icon className="h-8 w-8 text-primary shrink-0" />
                    <CardTitle className="text-lg font-semibold">{t(feature.titleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{t(feature.descriptionKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Jobs Section */}
        <section id="trending-jobs" className="py-16 sm:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-headline">{t("landing.trending.title")}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.trending.subtitle")}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-10">
              {trendingJobs.map((job, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 text-left">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <job.icon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-lg font-semibold">{t(job.nameKey)}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {job.rolesKeys.map((roleKey, rIndex) => (
                        <li key={rIndex} className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary/70 shrink-0" />
                          <span>{t(roleKey)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                   <CardFooter>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      {t("landing.trending.explore_cta")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12 font-headline">{t("landing.stats.title")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.nameKey} className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-muted-foreground mt-1">{t(stat.nameKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Customer Reviews Section */}
        <CustomerReviewsSection />
        
        {/* Latest Blog Posts Section */}
        <section id="blog" className="py-16 sm:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-headline">{t("landing.blog.title")}</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("landing.blog.subtitle")}
              </p>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: latestBlogPosts.length > 5,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {latestBlogPosts.map((post) => (
                  <CarouselItem key={post.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3">
                    <Link href={`/blog/${post.slug}`} passHref>
                      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden h-full cursor-pointer">
                        {post.imageUrl && (
                          <div className="relative w-full h-40">
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              fill
                              style={{ objectFit: "cover" }}
                              data-ai-hint="blog post image"
                            />
                          </div>
                        )}
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg leading-tight line-clamp-2 font-semibold">{post.title}</CardTitle>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {post.author}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {format(new Date(post.date), 'MMM d, yyyy')}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-grow">
                          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 mt-auto border-t">
                           <div className="flex flex-wrap gap-1">
                             {post.tags?.slice(0, 2).map(tag => (
                               <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-secondary text-secondary-foreground rounded-full flex items-center gap-1">
                                 <Tag className="h-2.5 w-2.5"/>{tag}
                               </span>
                             ))}
                           </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-[-1rem] bg-card hover:bg-secondary" />
              <CarouselNext className="mr-[-1rem] bg-card hover:bg-secondary" />
            </Carousel>
            <div className="text-center mt-10">
              <Link href="/blog">
                <Button variant="outline" className="px-6 py-2">
                  {t("landing.blog.cta")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* FAQs Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8 font-headline">{t("landing.faq.title")}</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold text-left">{t(faq.questionKey, { platformName })}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{t(faq.answerKey, { platformName })}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-headline">{t("landing.final_cta.title")}</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              {t("landing.final_cta.subtitle")}
            </p>
            <div className="mt-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 text-lg">
                  {t("landing.final_cta.cta")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-card text-center text-muted-foreground border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <p className="font-semibold text-foreground mb-1">{platformName}</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} {platformName}. {t("landing.footer.rights")}</p>
          <div className="mt-3 space-x-4 text-sm">
            <Link href="/privacy" className="hover:text-primary">{t("landing.footer.privacy")}</Link>
            <span className="text-gray-400">|</span>
            <Link href="/terms" className="hover:text-primary">{t("landing.footer.terms")}</Link>
            <span className="text-gray-400">|</span>
            <Link href="/request-tenant" className="hover:text-primary">Create a Tenant</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
