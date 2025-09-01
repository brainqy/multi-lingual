
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
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.js'],
  
  // By default, everything in node_modules is ignored. This pattern creates an exception
  // for the specified packages, telling Jest to transform them.
  transformIgnorePatterns: [
    '/node_modules/(?!(@genkit-ai|genkit|dotprompt|yaml)/)',
  ],
  
  // This transform is necessary because we are now transforming some node_modules.
  // It tells Jest to use babel-jest for all JS/TS files.
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
