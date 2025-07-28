
import type { FeatureRequest } from '@/types';

export const sampleFeatureRequests: FeatureRequest[] = [
  { id: 'fr1', tenantId: 'Brainqy', userId: 'alumni1', userName: 'Alice Wonderland', userAvatar: 'https://picsum.photos/seed/alice/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), title: 'Integrate with LinkedIn for profile import', description: 'It would be great to automatically pull resume data from LinkedIn.', status: 'Pending', upvotes: 15 },
  { id: 'fr2', tenantId: 'Brainqy', userId: 'alumni2', userName: 'Bob The Builder', userAvatar: 'https://picsum.photos/seed/bob/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), title: 'Dark mode for the dashboard', description: 'A dark theme option would be easier on the eyes.', status: 'In Progress', upvotes: 28 },
  { id: 'fr3', tenantId: 'tenant-2', userId: 'managerUser1', userName: 'Manager Mike', userAvatar: 'https://avatar.vercel.sh/managermike.png', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), title: 'Tenant-specific branding options', description: 'Allow tenant managers to customize logos and color schemes.', status: 'Completed', upvotes: 42 },
];
