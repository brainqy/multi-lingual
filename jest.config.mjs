// jest.config.mjs
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Force modules to resolve with the CJS entry point
    'lucide-react': 'lucide-react/dist/cjs',
  },
  // This is the key part: it tells Jest to NOT ignore these modules when transforming.
  // All other modules in node_modules will be ignored.
  transformIgnorePatterns: [
    '/node_modules/(?!(@genkit-ai/|genkit|dotprompt|yaml)/)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
