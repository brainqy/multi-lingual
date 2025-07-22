
'use server';

import { getUserByEmail, createUser, updateUser } from '@/lib/data-services/users';
import type { UserProfile } from '@/types';

/**
 * Handles user login. Generates a new session ID and updates the user record.
 * @param email The user's email address.
 * @returns The user profile if login is successful, otherwise null.
 */
export async function loginUser(email: string): Promise<UserProfile | null> {
  const user = await getUserByEmail(email);

  if (user) {
    const sessionId = `session-${Date.now()}`;
    const updatedUser = await updateUser(user.id, { sessionId });
    return updatedUser;
  }

  return null;
}

/**
 * Handles new user registration.
 * @param userData The data for the new user.
 * @returns An object with success status, a message, and the user object if successful.
 */
export async function signupUser(userData: { name: string; email: string; role: 'user' | 'admin' }): Promise<{ success: boolean; user: UserProfile | null; message?: string; error?: string }> {
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
