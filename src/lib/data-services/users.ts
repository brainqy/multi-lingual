
'use server';

import type { UserProfile, Tenant } from '@/types';
import { db } from '@/lib/db';

const log = console.log;

export async function getUsers(tenantId?: string): Promise<UserProfile[]> {
  log(`[DataService] Fetching users for tenant: ${tenantId || 'all'}`);
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
  log(`[DataService] Fetching user by email: ${email}`);
  const user = await db.user.findUnique({
    where: { email },
  });
  if (!user) {
      return null;
  }
  return user as unknown as UserProfile;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  log(`[DataService] Fetching user by id: ${id}`);
  const user = await db.user.findUnique({
    where: { id },
  });
  return user as unknown as UserProfile | null;
}

export async function createUser(data: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!data.name || !data.email || !data.role) {
        throw new Error("Name, email, and role are required to create a user.");
    }

    const defaultTenantId = 'brainqy';
    const tenantId = data.tenantId || defaultTenantId;
    const password = data.password;

    const newUserPayload = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status || 'active',
        lastLogin: new Date(),
        createdAt: new Date(),
        password: password,
        sessionId: `session-${Date.now()}`,
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
        streakFreezes: 1, // Start with one free pass
    };
    
    log(`[DataService] Creating user in real DB: ${data.email}`);
    
    const tenantExists = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenantExists) {
      log(`[DataService] Tenant ${tenantId} not found, cannot create user.`);
      throw new Error(`Tenant with ID ${tenantId} does not exist.`);
    }

    const newUser = await db.user.create({
      data: {
        ...(newUserPayload as any),
        tenant: {
          connect: {
            id: tenantId,
          },
        },
      },
    });

    return newUser as unknown as UserProfile;
}


export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  log(`[DataService] Updating user: ${userId}`);
  
  const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

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
  log(`[DataService] Deleting user: ${userId}`);
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

    
