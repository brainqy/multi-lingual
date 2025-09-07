
'use server';

import { db } from '@/lib/db';
import type { UserProfile, UserRole, UserStatus } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { getWallet } from '../actions/wallet';
import { headers } from 'next/headers';

/**
 * Fetches users from the database, scoped by the tenant ID.
 * @param tenantId The ID of the tenant to fetch users for. If null/undefined, fetches all users (admin action).
 * @returns A promise that resolves to an array of UserProfile objects.
 */
export async function getUsers(tenantId?: string | null): Promise<UserProfile[]> {
  logAction('Fetching users', { tenantId });
  try {
    const whereClause: any = {};
    if (tenantId && tenantId !== 'platform') {
      whereClause.tenantId = tenantId;
    }
    const users = await db.user.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
    return users as unknown as UserProfile[];
  } catch (error) {
    logError('[User Dataservice] Error fetching users', error, { tenantId });
    return [];
  }
}

/**
 * Fetches a single user by their email address.
 * @param email The email of the user to fetch.
 * @returns The user profile or null if not found.
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  logAction('Fetching user by email', { email });
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return user as unknown as UserProfile | null;
  } catch (error) {
    logError('[User Dataservice] Error fetching user by email', error, { email });
    return null;
  }
}

/**
 * Creates a new user in the database. Requires an explicit tenantId.
 * @param userData The data for the new user, including the tenantId.
 * @returns The newly created user profile or null.
 */
export async function createUser(userData: {
  name?: string;
  email: string;
  role: UserRole;
  password?: string;
  status?: UserStatus;
  tenantId: string; // tenantId is now required
  profilePictureUrl?: string;
}): Promise<UserProfile | null> {
  logAction('Creating user', { email: userData.email, tenantId: userData.tenantId });
  try {
    const newUser = await db.user.create({
      data: {
        name: userData.name || userData.email,
        email: userData.email,
        password: userData.password, // In a real app, this should be hashed
        role: userData.role,
        tenantId: userData.tenantId, // Use the provided tenantId
        status: userData.status || 'active',
        sessionId: `session-${Date.now()}`, // Generate an initial session ID
        profilePictureUrl: userData.profilePictureUrl,
      },
    });
    
    // Create a wallet for the new user
    await getWallet(newUser.id);
    
    return newUser as unknown as UserProfile;
  } catch (error) {
    logError('[User Dataservice] Error creating user', error, { email: userData.email });
    return null;
  }
}


/**
 * Updates an existing user's profile.
 * @param userId The ID of the user to update.
 * @param updateData The data to update.
 * @returns The updated user profile or null.
 */
export async function updateUser(userId: string, updateData: Partial<UserProfile>): Promise<UserProfile | null> {
  logAction('Updating user', { userId, fields: Object.keys(updateData) });
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        // Ensure complex types like weeklyActivity are handled correctly
        weeklyActivity: updateData.weeklyActivity as any[],
        challengeProgress: updateData.challengeProgress as any,
        currentFlipChallenge: updateData.currentFlipChallenge as any,
        flipChallengeProgressStart: updateData.flipChallengeProgressStart as any,
      },
    });
    return updatedUser as unknown as UserProfile;
  } catch (error) {
    logError(`[User Dataservice] Error updating user ${userId}`, error, { userId });
    return null;
  }
}


/**
 * Deletes a user from the database.
 * @param userId The ID of the user to delete.
 * @returns A boolean indicating success.
 */
export async function deleteUser(userId: string): Promise<boolean> {
  logAction('Deleting user', { userId });
  try {
    // In a real application, you might want to handle related data (e.g., posts, applications)
    // either by cascading delete in the DB schema or by deleting them here in a transaction.
    await db.user.delete({
      where: { id: userId },
    });
    return true;
  } catch (error) {
    logError(`[User Dataservice] Error deleting user ${userId}`, error, { userId });
    return false;
  }
}
