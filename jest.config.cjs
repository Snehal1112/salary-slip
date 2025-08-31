module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
	},
	testPathIgnorePatterns: ['/node_modules/', '/playwright/'],
	testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
	setupFilesAfterEnv: [
		'<rootDir>/src/setupTests.ts',
		'<rootDir>/src/test-utils/jest-setup.ts'
	],
	// Improved coverage configuration
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/test-utils/**',
		'!src/**/*.stories.{ts,tsx}',
		'!src/**/index.ts',
	],
	coverageReporters: ['text', 'lcov', 'html'],
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70,
		},
	},
	// Performance optimizations
	maxWorkers: '50%',
	testTimeout: 10000,
	// Better error reporting
	verbose: true,
	errorOnDeprecated: true,
	// Module name mapping for absolute imports
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
	},
	// Global test setup
	globalSetup: undefined,
	globalTeardown: undefined,
}
