
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import LaunchingSoonPage from '../app/launching-soon/page';
import { I18nProvider } from '@/contexts/i18n-provider';
import { AuthProvider } from '@/contexts/auth-provider';

// Mock timers (setInterval, setTimeout) used by the component for countdowns
jest.useFakeTimers();

// Mock next/navigation as some child components might use it
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

describe('LaunchingSoonPage', () => {
  it('renders the main heading', () => {
    render(
      <AuthProvider>
        <I18nProvider>
          <LaunchingSoonPage />
        </I18nProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', { name: /Launching Soon!/i, level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the waitlist form button', () => {
    render(
      <AuthProvider>
        <I18nProvider>
          <LaunchingSoonPage />
        </I18nProvider>
      </AuthProvider>
    );

    const button = screen.getByRole('button', { name: /Notify Me/i });
    expect(button).toBeInTheDocument();
  });
});
