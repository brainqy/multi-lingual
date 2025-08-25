
'use server';

import { db } from '@/lib/db';
import type { PlatformSettings } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches the platform settings from the database.
 * If no settings exist, it creates and returns a default set.
 * @returns A promise that resolves to the PlatformSettings object.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  logAction('Fetching platform settings');
  try {
    let settings = await db.platformSettings.findFirst();

    if (!settings) {
      logAction('[PlatformSettings] No settings found, creating default settings.');
      settings = await db.platformSettings.create({
        data: {
          platformName: "JobMatch AI",
          maintenanceMode: false,
          communityFeedEnabled: true,
          autoModeratePosts: true,
          jobBoardEnabled: true,
          maxJobPostingDays: 30,
          gamificationEnabled: true,
          xpForLogin: 10,
          xpForNewPost: 20,
          resumeAnalyzerEnabled: true,
          aiResumeWriterEnabled: true,
          coverLetterGeneratorEnabled: true,
          mockInterviewEnabled: true,
          aiMockInterviewCost: 25,
          referralsEnabled: true,
          affiliateProgramEnabled: true,
          alumniConnectEnabled: true,
          defaultAppointmentCost: 10,
          featureRequestsEnabled: true,
          allowTenantCustomBranding: true,
          allowTenantEmailCustomization: false,
          allowUserApiKey: true,
          defaultProfileVisibility: 'alumni_only',
          maxResumeUploadsPerUser: 5,
          defaultTheme: 'light',
          enablePublicProfilePages: false,
          sessionTimeoutMinutes: 60,
          maxEventRegistrationsPerUser: 3,
          globalAnnouncement: 'Welcome to JobMatch AI! Our platform is currently in beta. Explore our AI features and connect with the community.',
          pointsForAffiliateSignup: 50,
          walletEnabled: true,
        },
      });
    }
    return settings as unknown as PlatformSettings;
  } catch (error) {
    logError('[PlatformSettingsAction] Error fetching settings', error);
    // Return a safe default object in case of a catastrophic error
    return {
        id: 'error-default',
        platformName: "JobMatch AI",
        maintenanceMode: false,
        communityFeedEnabled: true,
        autoModeratePosts: true,
        jobBoardEnabled: true,
        maxJobPostingDays: 30,
        gamificationEnabled: true,
        xpForLogin: 10,
        xpForNewPost: 20,
        resumeAnalyzerEnabled: true,
        aiResumeWriterEnabled: true,
        coverLetterGeneratorEnabled: true,
        mockInterviewEnabled: true,
        aiMockInterviewCost: 25,
        referralsEnabled: true,
        affiliateProgramEnabled: true,
        alumniConnectEnabled: true,
        defaultAppointmentCost: 10,
        featureRequestsEnabled: true,
        allowTenantCustomBranding: true,
        allowTenantEmailCustomization: false,
        allowUserApiKey: true,
        defaultProfileVisibility: 'alumni_only',
        maxResumeUploadsPerUser: 5,
        defaultTheme: 'light',
        enablePublicProfilePages: false,
        sessionTimeoutMinutes: 60,
        maxEventRegistrationsPerUser: 3,
        globalAnnouncement: 'Error: Could not load settings.',
        pointsForAffiliateSignup: 50,
        walletEnabled: true,
    };
  }
}

/**
 * Updates the platform settings in the database.
 * @param settingsData The settings data to update.
 * @returns The updated PlatformSettings object or null if failed.
 */
export async function updatePlatformSettings(settingsData: Partial<Omit<PlatformSettings, 'id'>>): Promise<PlatformSettings | null> {
  logAction('Updating platform settings');
  try {
    const currentSettings = await getPlatformSettings();
    const updatedSettings = await db.platformSettings.update({
      where: { id: currentSettings.id },
      data: settingsData,
    });
    return updatedSettings as unknown as PlatformSettings;
  } catch (error) {
    logError('[PlatformSettingsAction] Error updating settings', error, { settingsData });
    return null;
  }
}
