
'use server';

import { getUserByEmail, createUser, updateUser } from '@/lib/data-services/users';
import type { UserProfile } from '@/types';
import { db } from '@/lib/db';
import { logAction, logError } from '@/lib/logger';
import { headers } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '../firebase-admin';

initializeFirebaseAdmin();

/**
 * Handles user login, scoped to a specific tenant identified by the request headers.
 * @param email The user's email address.
 * @param password The user's password.
 * @returns The user profile if login is successful, otherwise null.
 */
export async function loginUser(email: string, password?: string): Promise<UserProfile | null> {
  try {
    const headersList = headers();
    const identifier = headersList.get('X-Tenant-Id') || 'platform';
    
    const user = await db.user.findFirst({
      where: { email: email },
    });

    if (user) {
      const isPlatformLogin = identifier === 'platform';
      
      let tenant = null;
      if (!isPlatformLogin) {
        // Find tenant by ID or custom domain from the identifier.
        tenant = await db.tenant.findFirst({
          where: { OR: [{ domain: identifier }, { id: identifier }] },
        });
        if (!tenant) {
            logError('Login failed: Tenant not found by identifier from header', { email, identifier });
            return null; // The specified tenant subdomain does not exist.
        }
      }
      
      const tenantId = tenant ? tenant.id : 'platform';

      if (user.role === 'admin' && !isPlatformLogin) {
        logError('Admin login attempt failed on tenant subdomain', { email, identifier });
        return null;
      }
      
      // A user's tenantId must match the resolved tenantId from the subdomain.
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

export async function loginOrSignupWithGoogle(
  tenantId?: string
): Promise<{ success: boolean; user: UserProfile | null; message?: string }> {
  try {
    const headersList = headers();
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return { success: false, user: null, message: 'Authorization token not found.' };
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    if (!email) {
      return { success: false, user: null, message: 'Email not found in Google token.' };
    }
    
    const effectiveTenantId = tenantId || headersList.get('X-Tenant-Id') || 'platform';

    let user = await getUserByEmail(email);

    if (user) {
      // User exists, log them in
      const sessionId = `session-${Date.now()}`;
      user = await updateUser(user.id, { sessionId, lastLogin: new Date().toISOString(), profilePictureUrl: picture });
      logAction('Google login successful for existing user', { userId: user?.id, email, tenantId: user?.tenantId });
    } else {
      // User does not exist, create a new one
      user = await createUser({
        name: name || email.split('@')[0],
        email: email,
        role: 'user',
        tenantId: effectiveTenantId,
        status: 'active',
        profilePictureUrl: picture,
      });

      if (!user) {
        throw new Error('Failed to create new user account after Google sign-in.');
      }
      logAction('Google signup successful for new user', { userId: user.id, email, tenantId: user.tenantId });
    }

    return { success: true, user };
  } catch (error) {
    logError('Exception during loginOrSignupWithGoogle', error, {});
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, user: null, message };
  }
}


/**
 * Handles new user registration.
 * @param userData The data for the new user, including the password.
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
    
    // Determine tenant from headers if not explicitly provided
    const headersList = headers();
    const tenantIdFromHeader = headersList.get('X-Tenant-Id') || 'platform';
    const finalTenantId = userData.tenantId || tenantIdFromHeader;

    const newUser = await createUser({ ...userData, tenantId: finalTenantId });

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

/**
 * Changes a user's password after verifying their current password.
 * @param data Object containing userId, currentPassword, and newPassword.
 * @returns A success or error object.
 */
export async function changePassword(data: { userId: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; error?: string }> {
  logAction('Attempting to change password', { userId: data.userId });
  try {
    const user = await db.user.findUnique({ where: { id: data.userId } });

    if (!user) {
      logError('[AuthAction] User not found for password change', {}, { userId: data.userId });
      return { success: false, error: "User not found." };
    }

    // In a real app with hashed passwords, you'd compare the hash.
    // For this app's logic, we compare plain text.
    if (user.password && user.password !== data.currentPassword) {
      logAction('Password change failed: Incorrect current password', { userId: data.userId });
      return { success: false, error: "The current password you entered is incorrect." };
    }
    
    // In a real app, you would hash the new password here before saving.
    // const hashedPassword = await hash(data.newPassword, 10);
    await db.user.update({
      where: { id: data.userId },
      data: { password: data.newPassword }, // Save the plain text password as per current app structure
    });
    
    logAction('Password changed successfully', { userId: data.userId });
    return { success: true };

  } catch (error) {
    logError('[AuthAction] Exception during password change', error, { userId: data.userId });
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Resets a user's password using a token (base64 email).
 * @param data Object containing the token and the new password.
 * @returns A success or error object.
 */
export async function resetPassword(data: { token: string; newPassword?: string }): Promise<{ success: boolean; error?: string }> {
  logAction('Attempting to reset password', { token: data.token });
  try {
    const email = Buffer.from(data.token, 'base64').toString('ascii');
    const user = await getUserByEmail(email);

    if (!user) {
      logError('[AuthAction] User not found for password reset', {}, { email });
      return { success: false, error: "Invalid token or user not found." };
    }

    await db.user.update({
      where: { id: user.id },
      data: { password: data.newPassword },
    });

    logAction('Password reset successfully', { userId: user.id });
    return { success: true };
  } catch (error) {
    logError('[AuthAction] Exception during password reset', error, { token: data.token });
    return { success: false, error: "An unexpected error occurred during password reset." };
  }
}
