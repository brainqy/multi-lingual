// jest.config.mjs
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // This pattern tells Jest to NOT transform files in node_modules, EXCEPT for the ones listed.
  // This is crucial for packages that use modern JavaScript (ESM) syntax.
  transformIgnorePatterns: [
    '/node_modules/(?!(genkit|@genkit-ai|yaml|dotprompt)/)',
  ],
  moduleNameMapper: {
    // Mock for lucide-react icons
    '^lucide-react$': '<rootDir>/src/__mocks__/lucide-react.js',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
