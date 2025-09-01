// src/__mocks__/genkit.ts

// This is a manual mock to prevent Genkit's dependencies (like yaml)
// from causing Jest transformation errors in UI component tests that
// don't need to execute actual AI logic.

export const googleAI = jest.fn(() => ({
  generate: jest.fn().mockResolvedValue({ text: 'Mocked AI response' }),
}));

// Mock the defineFlow function and other core Genkit exports
export const defineFlow = jest.fn((name, fn) => ({
  name,
  fn,
  run: jest.fn(() => Promise.resolve({ result: 'mocked flow result' })),
}));

export const runFlow = jest.fn(() => Promise.resolve({ result: 'mocked flow result' }));

export const genkit = {
  defineFlow: defineFlow,
  runFlow: runFlow,
  // Add any other genkit exports that might be used
  start: jest.fn(),
};

// Mock other related exports from the genkit ecosystem
export const ai = {
  definePrompt: jest.fn(() => jest.fn().mockResolvedValue({ output: { a: 'b' }})),
  defineTool: jest.fn(),
  defineFlow: defineFlow,
  generate: jest.fn().mockResolvedValue({ text: () => 'Mocked AI response' }),
};

export const configureGenkit = jest.fn();

// Export constants that might be imported by components
export const STANDARD_SAFETY_SETTINGS = [];
export const AI_PROMPT_CONFIG = {};
