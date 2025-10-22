module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/tests/**/*.test.js'],
	collectCoverageFrom: [
		'routes/**/*.js',
		'database.js',
		'server.js',
		'!**/node_modules/**',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
	testTimeout: 10000,
}
