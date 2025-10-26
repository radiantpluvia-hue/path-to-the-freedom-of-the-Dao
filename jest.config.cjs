module.exports = {
  rootDir: __dirname,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // setupFiles runs before the test framework and module imports. Use it for early shims.
  setupFiles: ['<rootDir>/src/tests/setupBeforeEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/hideTutorialInTests.ts', '<rootDir>/src/tests/setupTests.ts', '<rootDir>/tests/jest.setup.generated_passives.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js'
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/\\.tmp_build/'],
};
