// Test setup file
require('dotenv').config({ path: '.env.test' })

// Global test timeout
jest.setTimeout(10000)

// Mock console.log for cleaner test output
global.console = {
	...console,
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	info: jest.fn(),
}
