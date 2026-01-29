const mysql = require('mysql2/promise')

let pool = null
let connected = false

// Database configuration
const dbConfig = {
	host: process.env.MYSQL_HOST || 'localhost',
	user: process.env.MYSQL_USER || 'root',
	password: process.env.MYSQL_PASSWORD || '',
	port: process.env.MYSQL_PORT || 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
}

const dbName = process.env.MYSQL_DATABASE || 'react_demo'

// Initialize MySQL connection pool
const initializeDatabase = async () => {
	try {
		console.log('🔧 Initializing MySQL database connection...')

		// Create connection pool
		pool = mysql.createPool(dbConfig)

		// Test the connection
		const connection = await pool.getConnection()
		console.log('✅ MySQL connection established successfully')

		// Create database if it doesn't exist
		await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
		console.log(`📊 Database '${dbName}' created/verified`)

		// Close the initial connection and recreate pool with database
		connection.release()
		await pool.end()

		// Create new pool with database specified
		pool = mysql.createPool({
			...dbConfig,
			database: dbName,
		})

		// Get connection with database
		const dbConnection = await pool.getConnection()
		console.log(`🔗 Connected to database '${dbName}'`)

		// Create users table if it doesn't exist
		await dbConnection.execute(`
			CREATE TABLE IF NOT EXISTS users (
				id INT AUTO_INCREMENT PRIMARY KEY,
				first_name VARCHAR(50) NOT NULL,
				last_name VARCHAR(50) NOT NULL,
				email VARCHAR(100) UNIQUE NOT NULL,
				is_active BOOLEAN DEFAULT TRUE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			)
		`)
		console.log('📋 Users table ready')

		// Create roles table if it doesn't exist
		await dbConnection.execute(`
			CREATE TABLE IF NOT EXISTS roles (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(50) UNIQUE NOT NULL,
				description VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			)
		`)
		console.log('🎭 Roles table ready')

		// Create user_roles junction table if it doesn't exist
		await dbConnection.execute(`
			CREATE TABLE IF NOT EXISTS user_roles (
				id INT AUTO_INCREMENT PRIMARY KEY,
				user_id INT NOT NULL,
				role_id INT NOT NULL,
				assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
				UNIQUE KEY unique_user_role (user_id, role_id)
			)
		`)
		console.log('🔗 User-Roles junction table ready')

		// Insert sample data if table is empty
		const [rows] = await dbConnection.execute(
			'SELECT COUNT(*) as count FROM users',
		)
		if (rows[0].count === 0) {
			console.log('📝 Inserting sample users...')
			const sampleUsers = [
				['Alice', 'Johnson', 'alice.johnson@example.com', true],
				['Bob', 'Smith', 'bob.smith@example.com', true],
				['Carol', 'Lee', 'carol.lee@example.com', false],
				['David', 'Nguyen', 'david.nguyen@example.com', true],
				['Eve', 'Martinez', 'eve.martinez@example.com', false],
			]

			for (const user of sampleUsers) {
				await dbConnection.execute(
					'INSERT INTO users (first_name, last_name, email, is_active) VALUES (?, ?, ?, ?)',
					user,
				)
			}
			console.log('✅ Sample users inserted')
		}

		// Insert sample roles if roles table is empty
		const [roleRows] = await dbConnection.execute(
			'SELECT COUNT(*) as count FROM roles',
		)
		if (roleRows[0].count === 0) {
			console.log('🎭 Inserting sample roles...')
			const sampleRoles = [
				['Admin', 'Full system access with user management capabilities'],
				['Manager', 'Departmental management with limited admin features'],
				['Editor', 'Content creation and editing permissions'],
				['Viewer', 'Read-only access to system resources'],
				['Support', 'Customer support and helpdesk capabilities'],
			]

			for (const role of sampleRoles) {
				await dbConnection.execute(
					'INSERT INTO roles (name, description) VALUES (?, ?)',
					role,
				)
			}
			console.log('✅ Sample roles inserted')

			// Assign some sample user-role relationships
			console.log('🔗 Creating sample user-role assignments...')
			const userRoleAssignments = [
				[1, 1], // Alice -> Admin
				[1, 2], // Alice -> Manager (multiple roles)
				[2, 2], // Bob -> Manager
				[2, 3], // Bob -> Editor
				[3, 4], // Carol -> Viewer
				[4, 3], // David -> Editor
				[4, 5], // David -> Support
				[5, 4], // Eve -> Viewer
			]

			for (const assignment of userRoleAssignments) {
				await dbConnection.execute(
					'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
					assignment,
				)
			}
			console.log('✅ Sample user-role assignments created')
		}

		dbConnection.release()
		connected = true
		console.log('🗄️ MySQL database initialization complete!')
	} catch (error) {
		console.error('❌ Database initialization failed:', error.message)
		connected = false
		throw error
	}
}

// Get database pool
const getPool = () => {
	if (!pool) {
		throw new Error('Database pool not initialized')
	}
	return pool
}

// Check if connected
const isConnected = () => connected

// Close database connection
const closeDatabase = async () => {
	if (pool) {
		await pool.end()
		pool = null
		connected = false
		console.log('🔌 Database connection closed')
	}
}

module.exports = {
	initializeDatabase,
	getPool,
	isConnected,
	closeDatabase,
}
