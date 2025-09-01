import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SignupPage from '../app/auth/signup/page';
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


// Mock the useAuth hook as it's used within the form, but we don't need its functionality for this render test.
jest.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    signup: jest.fn(),
  }),
}));

describe('SignupPage', () => {
  it('renders the signup form heading', () => {
    render(
      <AuthProvider>
        <I18nProvider>
          <SignupPage />
        </I18nProvider>
      </AuthProvider>
    );

    const heading = screen.getByRole('heading', { name: /Join Bhasha Setu/i, level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the create account button', () => {
    render(
      <AuthProvider>
        <I18nProvider>
          <SignupPage />
        </I18nProvider>
      </AuthProvider>
    );

    const button = screen.getByRole('button', { name: /Create Account/i });
    expect(button).toBeInTheDocument();
  });
});
