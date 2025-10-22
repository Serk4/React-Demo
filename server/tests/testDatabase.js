const { sql } = require('../database')

/**
 * Database test utilities
 */
class TestDatabase {
	/**
	 * Clean up test data
	 */
	static async cleanup() {
		try {
			await sql.query("DELETE FROM Users WHERE Email LIKE '%test.com'")
		} catch (error) {
			// Ignore cleanup errors
		}
	}

	/**
	 * Create a test user
	 */
	static async createTestUser(userData = {}) {
		const defaultUser = {
			FirstName: 'Test',
			LastName: 'User',
			Email: 'test.user@test.com',
			IsActive: true,
		}

		const user = { ...defaultUser, ...userData }

		try {
			const result = await sql.query(`
        INSERT INTO Users (FirstName, LastName, Email, IsActive)
        OUTPUT INSERTED.*
        VALUES ('${user.FirstName}', '${user.LastName}', '${user.Email}', ${
				user.IsActive ? 1 : 0
			})
      `)
			return result.recordset[0]
		} catch (error) {
			throw new Error(`Failed to create test user: ${error.message}`)
		}
	}

	/**
	 * Get test user by email
	 */
	static async getTestUserByEmail(email) {
		try {
			const result = await sql.query(`
        SELECT * FROM Users WHERE Email = '${email}'
      `)
			return result.recordset[0]
		} catch (error) {
			throw new Error(`Failed to get test user: ${error.message}`)
		}
	}

	/**
	 * Setup test database schema
	 */
	static async setupSchema() {
		try {
			await sql.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
        CREATE TABLE Users (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          FirstName NVARCHAR(100) NOT NULL,
          LastName NVARCHAR(100) NOT NULL,
          Email NVARCHAR(100) NOT NULL,
          IsActive BIT NOT NULL
        )
      `)
		} catch (error) {
			throw new Error(`Failed to setup test schema: ${error.message}`)
		}
	}
}

module.exports = TestDatabase
