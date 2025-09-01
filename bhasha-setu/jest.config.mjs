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
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Force module uuid to resolve with the CJS entry point
    uuid: require.resolve('uuid'),
  },
  // This pattern tells Jest to NOT transform files in node_modules,
  // EXCEPT for the ones listed in the negative lookahead pattern.
  // We need to transform these because they use modern JS (ESM) syntax.
  transformIgnorePatterns: [
    '/node_modules/(?!' +
    [
      'lucide-react',
      'genkit',
      '@genkit-ai',
      'dotprompt',
      'yaml',
    ].join('|') +
    ')/',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);