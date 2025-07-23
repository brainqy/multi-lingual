
'use server';

import type { UserProfile, Tenant } from '@/types';
import { db } from '@/lib/db';
import { samplePlatformUsers } from '@/lib/data/users';
import { sampleTenants } from '@/lib/data/platform';

const useMockDb = process.env.USE_MOCK_DB === 'true';
const log = console.log;

// This file acts as a database service. It will use Prisma for a real DB
// or a simple in-memory array for mock data based on the USE_MOCK_DB env variable.

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  log(`[DataService] Fetching user by email: ${email} (Mock DB: ${useMockDb})`);
  if (useMockDb) {
    const user = samplePlatformUsers.find(u => u.email === email);
    return user ? (user as UserProfile) : null;
  }
  const user = await db.user.findUnique({
    where: { email },
  });
  if (!user) {
      return null;
  }
  return user as unknown as UserProfile;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  log(`[DataService] Fetching user by id: ${id} (Mock DB: ${useMockDb})`);
  if (useMockDb) {
    const user = samplePlatformUsers.find(u => u.id === id);
    return user ? (user as UserProfile) : null;
  }
  const user = await db.user.findUnique({
    where: { id },
  });
  return user as unknown as UserProfile | null;
}

export async function createUser(data: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!data.name || !data.email || !data.role) {
        throw new Error("Name, email, and role are required to create a user.");
    }

    const defaultTenantId = 'Brainqy';

    const newUserPayload = {
        id: `user-${Date.now()}`,
        tenantId: data.tenantId || defaultTenantId,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status || 'active',
        lastLogin: new Date(),
        createdAt: new Date(),
        // Add defaults for all other fields to ensure a complete object
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
        interviewCredits: 5,
        isDistinguished: false,
        shortBio: '',
        university: '',
        sessionId: data.sessionId,
    };

    if (useMockDb) {
        const newUser: UserProfile = {
            ...newUserPayload,
            lastLogin: newUserPayload.lastLogin.toISOString(),
            createdAt: newUserPayload.createdAt.toISOString(),
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined
        } as UserProfile; // Cast to satisfy all optional fields
        samplePlatformUsers.push(newUser);
        return newUser;
    }

    log(`[DataService] Creating user in real DB: ${data.email}`);
    
    // Ensure the default tenant exists before creating the user
    const tenantExists = await db.tenant.findUnique({
      where: { id: defaultTenantId },
    });

    if (!tenantExists) {
      log(`[DataService] Default tenant '${defaultTenantId}' not found. Creating it now.`);
      const defaultTenantData = sampleTenants.find((t: Tenant) => t.id === defaultTenantId);
      if (defaultTenantData) {
        await db.tenant.create({
          data: {
            id: defaultTenantData.id,
            name: defaultTenantData.name,
            domain: defaultTenantData.domain,
            createdAt: new Date(defaultTenantData.createdAt),
            settings: {
              create: {
                allowPublicSignup: defaultTenantData.settings?.allowPublicSignup ?? true,
                primaryColor: defaultTenantData.settings?.primaryColor,
                accentColor: defaultTenantData.settings?.accentColor,
                customLogoUrl: defaultTenantData.settings?.customLogoUrl,
              }
            }
          }
        });
      }
    }

    const newUser = await db.user.create({
      data: newUserPayload as any, // Cast to any to handle potential mismatches with Prisma's generated types
    });

    return newUser as unknown as UserProfile;
}


export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  log(`[DataService] Updating user: ${userId} (Mock DB: ${useMockDb})`);
  if (useMockDb) {
    const userIndex = samplePlatformUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const updatedUser = { ...samplePlatformUsers[userIndex], ...data };
      samplePlatformUsers[userIndex] = updatedUser as UserProfile;
      return updatedUser as UserProfile;
    }
    return null;
  }

  const user = await db.user.update({
    where: { id: userId },
    data: data as any, // Cast to any to avoid type conflicts with Prisma's generated types
  });
  return user as unknown as UserProfile | null;
}
