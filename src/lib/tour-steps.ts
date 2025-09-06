import type { TourStep } from '@/types';

export const userDashboardTourSteps: TourStep[] = [
    {
      title: "Welcome to Your Dashboard!",
      description: "This is your central hub. Let's take a quick look at the key features available to you.",
    },
    {
      title: "AI Resume Analyzer",
      description: "Analyze your resume against job descriptions to get a match score and improvement suggestions.",
      targetId: "resume-analyzer-link",
    },
    {
      title: "Job Application Tracker",
      description: "Keep track of all your job applications in one place using our Kanban board.",
      targetId: "job-tracker-link",
    },
    {
      title: "Alumni Network",
      description: "Connect with fellow alumni, find mentors, and grow your professional network.",
      targetId: "alumni-connect-link",
    },
    {
      title: "Rewards & Progress",
      description: "Earn XP and badges for being active on the platform. Check your progress here!",
      targetId: "gamification-link",
    },
];
  
export const adminDashboardTourSteps: TourStep[] = [
    {
      title: "Welcome, Admin!",
      description: "This is your command center for the entire platform. Here's a brief overview of your key management tools.",
    },
    {
      title: "Tenant Management",
      description: "Onboard new tenants (organizations/universities) and manage existing ones.",
      targetId: "tenant-management-link",
    },
    {
      title: "User Management",
      description: "View, edit, and manage all users across all tenants on the platform.",
      targetId: "user-management-link",
    },
    {
      title: "Platform Settings",
      description: "Control global features, enable/disable modules, and manage platform-wide settings.",
      targetId: "platform-settings-link",
    },
    {
      title: "Content Moderation",
      description: "Review and act on content that has been flagged by users in the community feed.",
      targetId: "content-moderation-link",
    },
];

export const managerDashboardTourSteps: TourStep[] = [
    {
      title: "Welcome, Manager!",
      description: "This is your dashboard for managing your specific tenant. Here are your primary tools.",
    },
    {
      title: "Tenant User Management",
      description: "Manage all the users that belong to your tenant.",
      targetId: "user-management-link", // Assuming manager has a link with this ID
    },
    {
      title: "Tenant Content Moderation",
      description: "Review content flagged by users specifically within your tenant's community.",
      targetId: "content-moderation-link",
    },
    {
      title: "Tenant Branding",
      description: "Customize your tenant's appearance, such as logo and colors, in the main settings page.",
      targetId: "settings-link",
    },
];
  
  
  
  
  
  
  