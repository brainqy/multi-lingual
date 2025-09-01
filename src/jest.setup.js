// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock browser APIs that are not available in JSDOM
// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.ResizeObserver = mockResizeObserver;

// Mock window.matchMedia for Jest/JSDOM environment, which is required by embla-carousel-react
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Genkit and its related dependencies.
// The moduleNameMapper in jest.config.ts will redirect these to our manual mock.
jest.mock('genkit');
jest.mock('@genkit-ai/core');
jest.mock('@genkit-ai/ai');
jest.mock('@genkit-ai/googleai');

// Stub out low-level deps we don’t care about to prevent parsing errors
jest.mock('dotprompt', () => ({}));
jest.mock('yaml', () => ({}));
