module.exports = {
  rootDir: __dirname,
  preset: 'ts-jest',
   testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/tests/**/*.test.tsx',
    '**/tests/**/*.spec.tsx',
    '**/src/tests/**/*.test.ts',
    '**/src/tests/**/*.spec.ts',
    '**/src/tests/**/*.test.tsx',
    '**/src/tests/**/*.spec.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
   moduleNameMapper: {
     '^@/(.*)$': '<rootDir>/src/$1',
     '^(\\.{1,2}/.*)\\.js$': '$1',
     '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js'
   },
   setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
