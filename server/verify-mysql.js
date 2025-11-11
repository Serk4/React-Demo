// MySQL Connection Verification Script
require('dotenv').config()
const mysql = require('mysql2/promise')

async function verifyMySQLSetup() {
	console.log('🔍 Verifying MySQL Setup...\n')

	const dbConfig = {
		host: process.env.MYSQL_HOST || 'localhost',
		user: process.env.MYSQL_USER || 'root',
		password: process.env.MYSQL_PASSWORD || '',
		port: process.env.MYSQL_PORT || 3306,
	}

	const dbName = process.env.MYSQL_DATABASE || 'react_demo'
	let connection

	try {
		// Connect to MySQL server
		console.log('📡 Connecting to MySQL server...')
		connection = await mysql.createConnection(dbConfig)
		console.log('✅ Connected to MySQL server successfully!')

		// Check if database exists
		const [databases] = await connection.query('SHOW DATABASES')
		const dbExists = databases.some((db) => db.Database === dbName)
		console.log(
			`📊 Database '${dbName}': ${dbExists ? '✅ EXISTS' : '❌ NOT FOUND'}`
		)

		if (dbExists) {
			// Connect to our database
			await connection.query(`USE \`${dbName}\``)

			// Check tables
			const [tables] = await connection.query('SHOW TABLES')
			console.log(`📋 Tables in '${dbName}':`)
			if (tables.length === 0) {
				console.log('   (No tables found)')
			} else {
				tables.forEach((table) => {
					console.log(`   - ${Object.values(table)[0]}`)
				})
			}

			// Check users data if table exists
			try {
				const [users] = await connection.query(
					'SELECT * FROM users ORDER BY id'
				)
				console.log(`\n👥 Users in database (${users.length} total):`)
				if (users.length === 0) {
					console.log('   (No users found)')
				} else {
					users.forEach((user) => {
						console.log(
							`   ${user.id}: ${user.first_name} ${user.last_name} (${
								user.email
							}) - ${user.is_active ? 'Active' : 'Inactive'}`
						)
					})
				}
			} catch (tableError) {
				console.log('   ❌ Users table not found or error reading data')
			}
		}

		console.log('\n🎉 MySQL setup verification complete!')
	} catch (error) {
		console.error('❌ MySQL verification failed:', error.message)
		if (error.code === 'ECONNREFUSED') {
			console.log('\n💡 Possible solutions:')
			console.log('   1. Install XAMPP and start MySQL service')
			console.log('   2. Install MySQL Server directly')
			console.log('   3. Check if MySQL is running on port 3306')
		}
	} finally {
		// Always close connection
		if (connection) {
			try {
				await connection.end()
				console.log('🔌 Connection closed.')
			} catch (closeError) {
				console.log('⚠️  Error closing connection:', closeError.message)
			}
		}

		// Force exit to prevent hanging
		setTimeout(() => {
			console.log('👋 Exiting...')
			process.exit(0)
		}, 500)
	}
}

// Run verification
verifyMySQLSetup()
