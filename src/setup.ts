// Test setup file
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import '@testing-library/user-event';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  // Set a longer timeout for async operations if needed
  asyncUtilTimeout: 5000,
});

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Ignore specific React-related warnings if needed
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: React.createFactory() is deprecated')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock window.matchMedia if needed for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Reset all mocks automatically between tests
beforeEach(() => {
  jest.clearAllMocks();
});