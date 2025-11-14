#!/usr/bin/env node

/**
 * Daily Database Reset Script
 *
 * This script resets the users table to default data every day to prevent
 * griefing and maintain a clean demo environment.
 *
 * Usage:
 * - Manual: node server/scripts/daily-reset.js
 * - Scheduled: Add to cron job or GitHub Actions
 */

const {
	initializeDatabase,
	getPool,
	isConnected,
	closeDatabase,
} = require('../database-mysql')

const DEFAULT_USERS = [
	['Alice', 'Johnson', 'alice.johnson@example.com', true],
	['Bob', 'Smith', 'bob.smith@example.com', true],
	['Carol', 'Lee', 'carol.lee@example.com', false],
	['David', 'Nguyen', 'david.nguyen@example.com', true],
	['Eve', 'Martinez', 'eve.martinez@example.com', false],
]

async function resetDatabase() {
	console.log('🔄 Starting daily database reset...')
	console.log(`📅 Reset time: ${new Date().toISOString()}`)

	try {
		// Initialize database connection
		await initializeDatabase()

		if (!isConnected()) {
			throw new Error('Failed to connect to database')
		}

		const pool = getPool()

		// Clear existing users
		console.log('🗑️ Clearing existing users...')
		const [deleteResult] = await pool.execute('DELETE FROM users')
		console.log(`✅ Removed ${deleteResult.affectedRows} existing users`)

		// Reset auto-increment to start from 1
		await pool.execute('ALTER TABLE users AUTO_INCREMENT = 1')
		console.log('🔢 Reset auto-increment counter')

		// Insert default users
		console.log('👥 Inserting default users...')
		for (let i = 0; i < DEFAULT_USERS.length; i++) {
			const user = DEFAULT_USERS[i]
			await pool.execute(
				'INSERT INTO users (first_name, last_name, email, is_active) VALUES (?, ?, ?, ?)',
				user
			)
			console.log(`   ✅ Added: ${user[0]} ${user[1]}`)
		}

		// Verify the reset
		const [countResult] = await pool.execute(
			'SELECT COUNT(*) as count FROM users'
		)
		console.log(
			`📊 Database reset complete! ${countResult[0].count} users restored`
		)

		// Close database connection
		await closeDatabase()

		console.log('✅ Daily database reset completed successfully')
		return {
			success: true,
			usersRestored: DEFAULT_USERS.length,
			resetTime: new Date().toISOString(),
		}
	} catch (error) {
		console.error('❌ Daily reset failed:', error.message)
		console.error('🔍 Error details:', error)

		// Ensure database connection is closed
		try {
			await closeDatabase()
		} catch (closeError) {
			console.error(
				'❌ Failed to close database connection:',
				closeError.message
			)
		}

		throw error
	}
}

// Run the reset if this script is executed directly
if (require.main === module) {
	resetDatabase()
		.then((result) => {
			console.log('🎉 Script completed successfully')
			process.exit(0)
		})
		.catch((error) => {
			console.error('💥 Script failed:', error.message)
			process.exit(1)
		})
}

module.exports = { resetDatabase, DEFAULT_USERS }
