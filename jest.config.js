const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {        // ✅ fixed typo
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jsdom',  // or 'jest-environment-jsdom'
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
}

module.exports = createJestConfig(customJestConfig)