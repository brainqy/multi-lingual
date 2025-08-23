
'use server';

import { getUserByEmail, createUser, updateUser } from '@/lib/data-services/users';
import type { UserProfile } from '@/types';
import { db } from '@/lib/db';

/**
 * Handles user login, scoped to a specific tenant.
 * @param email The user's email address.
 * @param password The user's password.
 * @param tenantId The ID of the tenant from the URL subdomain.
 * @returns The user profile if login is successful, otherwise null.
 */
export async function loginUser(email: string, password?: string, tenantId?: string): Promise<UserProfile | null> {
  
  const user = await db.user.findFirst({
    where: {
      email: email,
    },
  });

  if (user) {
    // Enforce tenant login rules
    const isPlatformLogin = !tenantId || tenantId === 'platform';
    
    // Rule 1: Admins can ONLY log in via the main domain (platform)
    if (user.role === 'admin' && !isPlatformLogin) {
      console.warn(`[Auth] Admin login attempt failed for ${email} on tenant subdomain '${tenantId}'.`);
      return null;
    }
    
    // Rule 2: Non-admins MUST log in via their assigned tenant subdomain
    if (user.role !== 'admin' && user.tenantId !== tenantId) {
       console.warn(`[Auth] User login attempt failed for ${email}. User tenant '${user.tenantId}' does not match login subdomain '${tenantId}'.`);
      return null;
    }

    // In a real app, you would verify the hashed password here.
    const isPasswordMatch = user.password ? (password === user.password) : true;
    
    if (isPasswordMatch) {
      const sessionId = `session-${Date.now()}`;
      const updatedUser = await updateUser(user.id, { sessionId, lastLogin: new Date().toISOString() });
      return updatedUser;
    }
  }

  return null;
}

/**
 * Handles new user registration.
 * @param userData The data for the new user, including password.
 * @returns An object with success status, a message, and the user object if successful.
 */
export async function signupUser(userData: { name: string; email: string; role: 'user' | 'admin'; password?: string; tenantId?: string; }): Promise<{ success: boolean; user: UserProfile | null; message?: string; error?: string }> {
  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    return {
      success: false,
      user: null,
      message: "An account with this email already exists. Please login instead.",
      error: "Account Exists",
    };
  }

  const newUser = await createUser(userData);

  if (newUser) {
    return { success: true, user: newUser };
  }

  return { success: false, user: null, message: "Could not create a new user account." };
}

/**
 * Validates a user's session by checking their email and session ID against the database.
 * @param email The user's email.
 * @param sessionId The user's current session ID.
 * @returns The user profile if the session is valid, otherwise null.
 */
export async function validateSession(email: string, sessionId: string): Promise<UserProfile | null> {
  const user = await getUserByEmail(email);
  if (user && user.sessionId === sessionId) {
    return user;
  }
  return null;
}
