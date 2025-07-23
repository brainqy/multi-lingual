import type { UserProfile } from '@/types';
import { db } from '@/lib/db';
import { samplePlatformUsers } from '@/lib/data/users'; // Using the direct import for mock data

// This file acts as a database service. In a real application, these
// functions would interact with a database like PostgreSQL.

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  console.log(`[DataService] Fetching user by email: ${email}`);
  // In a real app, this would be the only line.
  // const user = await db.user.findUnique({ where: { email } });
  
  // For demo purposes, we check our sample data array first.
  const user = samplePlatformUsers.find(u => u.email === email);
  return user ? (user as UserProfile) : null;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  console.log(`[DataService] Fetching user by id: ${id}`);
  // Real app: const user = await db.user.findUnique({ where: { id } });
  const user = samplePlatformUsers.find(u => u.id === id);
  return user ? (user as UserProfile) : null;
}

export async function createUser(data: Partial<UserProfile>): Promise<UserProfile | null> {
    console.log(`[DataService] Creating new user: ${data.email}`);
    if (!data.name || !data.email || !data.role) {
        throw new Error("Name, email, and role are required to create a user.");
    }

    // Real app: const newUser = await db.user.create({ data: { ... } });
    const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        tenantId: data.tenantId || 'Brainqy',
        name: data.name,
        email: data.email,
        role: data.role,
        status: 'active',
        lastLogin: new Date().toISOString(),
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
        createdAt: new Date().toISOString(),
        isDistinguished: false,
        shortBio: '',
        university: '',
        sessionId: data.sessionId,
        areasOfSupport: [],
        interests: [],
        offersHelpWith: [],
        pastInterviewSessions: [],
        challengeTopics: [],
        // Ensure all required fields from UserProfile are present
        // Add default values for any missing fields to ensure type compatibility
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        mobileNumber: data.mobileNumber,
        currentAddress: data.currentAddress,
        graduationYear: data.graduationYear,
        degreeProgram: data.degreeProgram,
        department: data.department,
        currentOrganization: data.currentOrganization,
        industry: data.industry,
        workLocation: data.workLocation,
        linkedInProfile: data.linkedInProfile,
        yearsOfExperience: data.yearsOfExperience,
        timeCommitment: data.timeCommitment,
        preferredEngagementMode: data.preferredEngagementMode,
        otherComments: data.otherComments,
        lookingForSupportType: data.lookingForSupportType,
        helpNeededDescription: data.helpNeededDescription,
        shareProfileConsent: data.shareProfileConsent,
        featureInSpotlightConsent: data.featureInSpotlightConsent,
        resumeText: data.resumeText,
        careerInterests: data.careerInterests,
        userApiKey: data.userApiKey,
        appointmentCoinCost: data.appointmentCoinCost,
        referralCode: data.referralCode,
        affiliateCode: data.affiliateCode,
        challengeProgress: data.challengeProgress,
    };
    
    samplePlatformUsers.push(newUser);
    return newUser;
}

export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  console.log(`[DataService] Updating user: ${userId}`);
  // Real app: const user = await db.user.update({ where: { id: userId }, data });
  const userIndex = samplePlatformUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    samplePlatformUsers[userIndex] = { ...samplePlatformUsers[userIndex], ...data };
    return samplePlatformUsers[userIndex] as UserProfile;
  }
  return null;
}
