import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import TranslatePage from '../app/(app)/translate/page'
import { I18nProvider } from '@/contexts/i18n-provider';
import { AuthProvider } from '@/contexts/auth-provider';
import { SettingsProvider } from '@/contexts/settings-provider';
import { samplePlatformSettings } from '@/lib/sample-data';

// Mock the useAuth hook to provide a dummy user
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    wallet: { coins: 100 },
    isLoading: false,
  }),
}));

describe('TranslatePage', () => {
  it('renders the translation tool heading', () => {
    render(
      <AuthProvider>
        <SettingsProvider settings={samplePlatformSettings}>
          <I18nProvider>
            <TranslatePage />
          </I18nProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', { name: /Translation Tool/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the translate button', () => {
    render(
       <AuthProvider>
        <SettingsProvider settings={samplePlatformSettings}>
          <I18nProvider>
            <TranslatePage />
          </I18nProvider>
        </SettingsProvider>
      </AuthProvider>
    );

    const button = screen.getByRole('button', { name: /Translate/i });
    expect(button).toBeInTheDocument();
  });
});
