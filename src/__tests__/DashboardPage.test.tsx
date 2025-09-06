
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/(app)/dashboard/page';
import { I18nProvider } from '@/contexts/i18n-provider';
import { AuthProvider } from '@/contexts/auth-provider';
import { SettingsProvider } from '@/contexts/settings-provider';
import type { PlatformSettings } from '@/types';

// Correctly import the mock function from its actual file path
const { __setMockState } = require('../__mocks__/use-auth.js');

// Mock next/navigation because the AuthProvider and layout use it.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock the custom useAuth hook for Jest using the correct relative path
jest.mock('../hooks/use-auth');

const samplePlatformSettings: PlatformSettings = {
  id: 'settings1',
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
  walletEnabled: true,
};


describe('DashboardPage', () => {
  // Test case for an authenticated user
  it('renders the main dashboard heading for an authenticated user', () => {
    // Simulate a logged-in user
    __setMockState({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        tenantId: 'platform',
      },
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <AuthProvider>
        <SettingsProvider settings={samplePlatformSettings}>
          <I18nProvider>
            <DashboardPage />
          </I18nProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    // Check for the main heading of the UserDashboard
    const heading = screen.getByRole('heading', { name: /Dashboard/i });
    expect(heading).toBeInTheDocument();
  });

  // Test case for an unauthenticated user
  it('renders an access denied message for an unauthenticated user', () => {
    // Simulate a logged-out user
    __setMockState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <AuthProvider>
        <SettingsProvider settings={samplePlatformSettings}>
          <I18nProvider>
            <DashboardPage />
          </I18nProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    // Check for the "Access Denied" message
    const accessDeniedHeading = screen.getByRole('heading', { name: /Access Denied/i });
    expect(accessDeniedHeading).toBeInTheDocument();
  });
});
