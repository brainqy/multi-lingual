
import type { UserProfile } from '@/types';
import { samplePlatformUsers, ensureFullUserProfile } from '@/lib/data/users';

// This file acts as a mock database service. In a real application, these
// functions would interact with a database like PostgreSQL.

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  console.log(`[DataService] Fetching user by email: ${email}`);
  const user = samplePlatformUsers.find(u => u.email === email);
  return Promise.resolve(user || null);
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  console.log(`[DataService] Fetching user by id: ${id}`);
  const user = samplePlatformUsers.find(u => u.id === id);
  return Promise.resolve(user || null);
}

export async function createUser(data: { name: string; email: string; role: 'user' | 'admin' }): Promise<UserProfile | null> {
  console.log(`[DataService] Creating new user: ${data.email}`);
  if (samplePlatformUsers.some(u => u.email === data.email)) {
    console.error(`[DataService] User with email ${data.email} already exists.`);
    return null;
  }
  
  const newUser = ensureFullUserProfile({
    id: `user-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    sessionId: `session-${Date.now()}`,
  });
  
  samplePlatformUsers.push(newUser);
  console.log('[DataService] New user created:', newUser);
  return Promise.resolve(newUser);
}

export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  console.log(`[DataService] Updating user: ${userId}`);
  const userIndex = samplePlatformUsers.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    samplePlatformUsers[userIndex] = { ...samplePlatformUsers[userIndex], ...data };
    console.log('[DataService] User updated:', samplePlatformUsers[userIndex]);
    return Promise.resolve(samplePlatformUsers[userIndex]);
  }
  console.error(`[DataService] User with id ${userId} not found for update.`);
  return null;
}
