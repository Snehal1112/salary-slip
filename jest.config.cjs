module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
	},
	testPathIgnorePatterns: ['/node_modules/', '/playwright/'],
	testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
	setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
}
