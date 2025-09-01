// src/__mocks__/use-auth.js
// This file is a manual mock for the useAuth hook, used by Jest.
// It allows us to simulate different authentication states in our tests.

const React = require('react');

// We'll store the mock state here so tests can configure it.
let mockState = {
  user: null,
  wallet: { coins: 0 },
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  refreshWallet: jest.fn(),
  isStreakPopupOpen: false,
  setStreakPopupOpen: jest.fn(),
};

// This function allows our tests to change the mock's behavior.
const __setMockState = (newState) => {
  mockState = { ...mockState, ...newState };
};

const useAuth = () => mockState;

// Export the hook and the setter function.
module.exports = {
  useAuth,
  __setMockState,
};
