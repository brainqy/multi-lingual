import type { UserProfile } from '@/types';
import { db } from '@/lib/db';

// This file acts as a database service. In a real application, these
// functions would interact with a database like PostgreSQL.

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  console.log(`[DataService] Fetching user by email: ${email}`);
  const user = await db.user.findUnique({
    where: { email },
  });
  return user as UserProfile | null;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  console.log(`[DataService] Fetching user by id: ${id}`);
  const user = await db.user.findUnique({
    where: { id },
  });
  return user as UserProfile | null;
}

export async function createUser(data: Partial<UserProfile>): Promise<UserProfile | null> {
    console.log(`[DataService] Creating new user: ${data.email}`);
    if (!data.name || !data.email || !data.role) {
        throw new Error("Name, email, and role are required to create a user.");
    }

    const newUser = await db.user.create({
        data: {
            id: `user-${Date.now()}`,
            tenantId: data.tenantId || 'Brainqy',
            name: data.name,
            email: data.email,
            role: data.role,
            status: 'active',
            lastLogin: new Date(),
            currentJobTitle: data.currentJobTitle || '',
            company: data.company || '',
            skills: data.skills || [],
            bio: data.bio || '',
            profilePictureUrl: data.profilePictureUrl || `https://avatar.vercel.sh/${data.email}.png`,
            xpPoints: 0,
            dailyStreak: 0,
            longestStreak: 0,
            totalActiveDays: 0,
            weeklyActivity: Array(7).fill(false),
            earnedBadges: [],
            interviewCredits: 5, // Starter credits
            createdAt: new Date(),
            isDistinguished: false,
            shortBio: '',
            university: '',
            sessionId: data.sessionId,
            areasOfSupport: [],
            interests: [],
            offersHelpWith: [],
            pastInterviewSessions: [],
            challengeTopics: [],
        },
    });

    return newUser as UserProfile;
}

export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  console.log(`[DataService] Updating user: ${userId}`);
  const user = await db.user.update({
    where: { id: userId },
    data: data as any, // Cast to any to avoid type conflicts with Prisma's generated types
  });
  return user as UserProfile | null;
}
