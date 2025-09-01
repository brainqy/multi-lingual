import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import LoginPage from '../app/auth/login/page';
import { I18nProvider } from '@/contexts/i18n-provider';
import { AuthProvider } from '@/contexts/auth-provider';

// Mock next/navigation to provide a dummy router for Jest
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock the useAuth hook as it's used within the form
jest.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renders the login form heading', () => {
    render(
      <AuthProvider>
        <I18nProvider>
          <LoginPage />
        </I18nProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', { name: /Welcome Back to Bhasha Setu/i, level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the login button', () => {
    render(
      <AuthProvider>
        <I18nProvider>
          <LoginPage />
        </I18nProvider>
      </AuthProvider>
    );

    const button = screen.getByRole('button', { name: /Login/i });
    expect(button).toBeInTheDocument();
  });
});
