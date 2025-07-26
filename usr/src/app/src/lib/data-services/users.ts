
'use server';

import type { UserProfile, Tenant } from '@/types';
import { db } from '@/lib/db';
import { samplePlatformUsers } from '@/lib/data/users';
import { sampleTenants } from '@/lib/data/platform';

const useMockDb = process.env.USE_MOCK_DB === 'true';
const log = console.log;

// This file acts as a database service. It will use Prisma for a real DB
// or a simple in-memory array for mock data based on the USE_MOCK_DB env variable.

export async function getUsers(tenantId?: string): Promise<UserProfile[]> {
  log(`[DataService] Fetching users for tenant: ${tenantId || 'all'} (Mock DB: ${useMockDb})`);
  if (useMockDb) {
    if (tenantId) {
      return samplePlatformUsers.filter(u => u.tenantId === tenantId);
    }
    return samplePlatformUsers;
  }
  try {
    const users = await db.user.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users as unknown as UserProfile[];
  } catch (error) {
    console.error('[DataService] Error fetching users:', error);
    return [];
  }
}


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

    // In a real app, you would hash the password here before saving.
    // For this demo, we store it as is, which is NOT secure for production.
    const password = data.password;

    const newUserPayload = {
        id: `user-${Date.now()}`,
        tenantId: data.tenantId || defaultTenantId,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status || 'active',
        lastLogin: new Date(),
        createdAt: new Date(),
        password: password, // Storing password (insecure, for demo only)
        sessionId: `session-${Date.now()}`, // Assign initial session ID
        currentJobTitle: data.currentJobTitle || '',
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
    };

    if (useMockDb) {
        const newUser: UserProfile = {
          ...newUserPayload,
          lastLogin: newUserPayload.lastLogin.toISOString(),
          createdAt: newUserPayload.createdAt.toISOString(),
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined
        } as unknown as UserProfile;
        samplePlatformUsers.push(newUser);
        return newUser;
    }

    log(`[DataService] Creating user in real DB: ${data.email}`);
    
    const tenantExists = await db.tenant.findUnique({
      where: { id: newUserPayload.tenantId },
    });

    if (!tenantExists) {
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
      data: newUserPayload as any,
    });

    return newUser as unknown as UserProfile;
}


export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  log(`[DataService] Updating user: ${userId} (Mock DB: ${useMockDb})`);
  
  // Clean the data to avoid passing undefined values to Prisma
  const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

  if (useMockDb) {
    const userIndex = samplePlatformUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const updatedUser = { ...samplePlatformUsers[userIndex], ...cleanData };
      samplePlatformUsers[userIndex] = updatedUser as UserProfile;
      return updatedUser as UserProfile;
    }
    return null;
  }
 try {
    const user = await db.user.update({
        where: { id: userId },
        data: cleanData as any,
    });
    return user as unknown as UserProfile | null;
  } catch (error) {
    console.error(`[DataService] Error updating user ${userId}:`, error);
    return null;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  log(`[DataService] Deleting user: ${userId} (Mock DB: ${useMockDb})`);
  if (useMockDb) {
    const userIndex = samplePlatformUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      samplePlatformUsers.splice(userIndex, 1);
      return true;
    }
    return false;
  }
  try {
    await db.user.delete({
      where: { id: userId },
    });
    return true;
  } catch (error) {
    console.error(`[DataService] Error deleting user ${userId}:`, error);
    return false;
  }
}
