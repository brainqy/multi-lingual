
import type { PromotionalContent } from '@/types';

export let samplePromotionalContent: PromotionalContent[] = [
  {
    id: 'promo-1',
    isActive: true,
    title: 'Unlock Premium Features!',
    description: 'Upgrade your ResumeMatch AI experience with advanced analytics, unlimited resume scans, priority support, and exclusive templates.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageAlt: 'Retro motel sign against a blue sky',
    imageHint: 'motel sign',
    buttonText: 'Learn More',
    buttonLink: '#',
    gradientFrom: 'from-primary/80',
    gradientVia: 'via-primary',
    gradientTo: 'to-accent/80',
  },
  {
    id: 'promo-2',
    isActive: true,
    title: 'New Feature: AI Mock Interview!',
    description: 'Practice for your next big interview with our new AI-powered mock interview tool. Get instant feedback and improve your skills.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageAlt: 'Person in a video call interview',
    imageHint: 'interview video call',
    buttonText: 'Try it Now',
    buttonLink: '/ai-mock-interview',
    gradientFrom: 'from-blue-500',
    gradientVia: 'via-cyan-500',
    gradientTo: 'to-teal-500',
  },
    {
    id: 'promo-3',
    isActive: false, // Inactive example
    title: 'Upcoming: Networking Event',
    description: 'Join our annual networking event next month. Connect with top professionals and alumni from your field.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageAlt: 'People networking at an event',
    imageHint: 'networking event',
    buttonText: 'Save the Date',
    buttonLink: '/events',
    gradientFrom: 'from-purple-500',
    gradientVia: 'via-pink-500',
    gradientTo: 'to-red-500',
  }
];
