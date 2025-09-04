
'use server';

import type { UserProfile, Tenant } from '@/types';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { sendEmail } from '../actions/send-email';

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

async function generateUniqueReferralCode(name: string): Promise<string> {
    let code = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Sanitize name to create a base for the code
    const namePart = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();

    while (!isUnique && attempts < maxAttempts) {
        // Generate a random part to ensure uniqueness
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        code = `${namePart}${randomPart}`;

        // Check if the code already exists in the database
        const existingUser = await db.user.findUnique({
            where: { referralCode: code },
        });

        if (!existingUser) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        // Fallback for the rare case of repeated collisions
        code = `REF${Date.now()}`;
    }

    return code;
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

    const defaultTenantId = 'platform'; // Fallback to platform if no tenant ID is provided
    const tenantId = data.tenantId || defaultTenantId;
    const password = data.password;
    const referralCode = await generateUniqueReferralCode(data.name);

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
        dailyStreak: 1, // Start with a 1-day streak
        longestStreak: 1,
        totalActiveDays: 1,
        weeklyActivity: [0, 0, 0, 0, 0, 0, 1], // Mark today as active
        earnedBadges: [],
        interviewCredits: 5,
        isDistinguished: false,
        streakFreezes: 1, // Start with one free pass
        referralCode: referralCode,
    };
    
    log(`[DataService] Creating user in real DB: ${data.email} for tenant ${tenantId}`);
    
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

    // Send welcome email after user is successfully created
    await sendEmail({
        tenantId: newUser.tenantId,
        recipientEmail: newUser.email,
        type: 'WELCOME',
        placeholders: {
            userName: newUser.name,
            userEmail: newUser.email,
        }
    });

    return newUser as unknown as UserProfile;
}


export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  log(`[DataService] Updating user: ${userId}`);
  
  const { dashboardWidgets, ...restOfData } = data;
  const cleanData = Object.fromEntries(Object.entries(restOfData).filter(([_, v]) => v !== undefined));

  const dataForDb: Prisma.UserUpdateInput = {
    ...cleanData,
  };

  if (dashboardWidgets) {
    dataForDb.dashboardWidgets = dashboardWidgets as Prisma.JsonObject;
  }

 try {
    const user = await db.user.update({
        where: { id: userId },
        data: dataForDb as any,
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
