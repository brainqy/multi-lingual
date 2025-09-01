
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // This is the crucial part:
  // By default, everything in node_modules is ignored. We need to create an exception for
  // the ESM modules that are causing the syntax error.
  transformIgnorePatterns: [
    '/node_modules/(?!(@genkit-ai|genkit|dotprompt|yaml)/)',
  ],
  
  // Since we are now ignoring some transform ignores, we need to tell jest how to transform them.
  // Next.js's SWC compiler will handle this.
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Mock lucide-react to prevent errors with icons in tests
  moduleNameMapper: {
    'lucide-react': '<rootDir>/src/__mocks__/lucide-react.js',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
