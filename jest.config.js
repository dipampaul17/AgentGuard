module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'agent-guard.js',
    '!node_modules/**',
    '!tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true
};