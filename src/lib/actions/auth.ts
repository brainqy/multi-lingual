
'use server';

import { getUserByEmail, createUser, updateUser } from '@/lib/data-services/users';
import type { UserProfile } from '@/types';
import { db } from '@/lib/db';
import { logAction, logError } from '@/lib/logger';

/**
 * Handles user login, scoped to a specific tenant.
 * @param email The user's email address.
 * @param password The user's password.
 * @param tenantId The ID of the tenant from the URL subdomain.
 * @returns The user profile if login is successful, otherwise null.
 */
export async function loginUser(email: string, password?: string, tenantId?: string): Promise<UserProfile | null> {
  try {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      const isPlatformLogin = !tenantId || tenantId === 'platform';
      
      if (user.role === 'admin' && !isPlatformLogin) {
        logError('Admin login attempt failed on tenant subdomain', { email, tenantId });
        return null;
      }
      
      if (user.role !== 'admin' && user.tenantId !== tenantId) {
        logError('User login attempt failed due to tenant mismatch', { email, userTenant: user.tenantId, loginTenant: tenantId });
        return null;
      }

      const isPasswordMatch = user.password ? (password === user.password) : true;
      
      if (isPasswordMatch) {
        const sessionId = `session-${Date.now()}`;
        const updatedUser = await updateUser(user.id, { sessionId, lastLogin: new Date().toISOString() });
        logAction('User login successful', { userId: user.id, email: user.email, tenantId: user.tenantId, sessionId });
        return updatedUser;
      }
    }
    logError('Login failed for email', { email, reason: 'User not found or password incorrect' });
    return null;
  } catch (error) {
    logError('Exception during loginUser', error, { email });
    return null;
  }
}

/**
 * Handles new user registration.
 * @param userData The data for the new user, including password.
 * @returns An object with success status, a message, and the user object if successful.
 */
export async function signupUser(userData: { name: string; email: string; role: 'user' | 'admin'; password?: string; tenantId?: string; }): Promise<{ success: boolean; user: UserProfile | null; message?: string; error?: string }> {
  try {
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      logAction('Signup failed: Account exists', { email: userData.email });
      return {
        success: false,
        user: null,
        message: "An account with this email already exists. Please login instead.",
        error: "Account Exists",
      };
    }

    const newUser = await createUser(userData);

    if (newUser) {
      logAction('New user signup successful', { userId: newUser.id, email: newUser.email, tenantId: newUser.tenantId, sessionId: newUser.sessionId });
      return { success: true, user: newUser };
    }

    logError('Signup failed: Could not create user', {}, { email: userData.email });
    return { success: false, user: null, message: "Could not create a new user account." };
  } catch (error) {
    logError('Exception during signupUser', error, { email: userData.email });
    return { success: false, user: null, message: 'An unexpected error occurred during signup.' };
  }
}

/**
 * Validates a user's session by checking their email and session ID against the database.
 * @param email The user's email.
 * @param sessionId The user's current session ID.
 * @returns The user profile if the session is valid, otherwise null.
 */
export async function validateSession(email: string, sessionId: string): Promise<UserProfile | null> {
  try {
    const user = await getUserByEmail(email);
    if (user && user.sessionId === sessionId) {
      logAction('Session validated successfully', { userId: user.id, email, sessionId });
      return user;
    }
    logAction('Session validation failed', { email, reason: user ? 'Session ID mismatch' : 'User not found' });
    return null;
  } catch (error) {
    logError('Exception during validateSession', error, { email });
    return null;
  }
}
