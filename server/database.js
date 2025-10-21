require('dotenv').config()
const sql = require('mssql/msnodesqlv8')

const dbConfig = {
	connectionString: process.env.DB_CONNECTION_STRING,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000,
	},
}

let pool

const initializeDatabase = async () => {
	try {
		console.log('🔍 Attempting to connect to SQL Server...')
		console.log('Database config:', {
			connectionString: dbConfig.connectionString,
		})

		pool = await sql.connect(dbConfig)
		const result = await pool.request().query('SELECT 1 AS ping')
		console.log('Ping result:', result.recordset)
		console.log('✅ Connected to SQL Server database successfully!')
		console.log(`🗄️  Connected to LocalDB database`)
		return pool
	} catch (error) {
		console.error('❌ Database connection failed:', error.message)
		console.log('❌ Full DB error:', JSON.stringify(error, null, 2))
		throw error
	}
}

const getPool = () => {
	if (!pool || !pool.connected) {
		throw new Error(
			'Database not connected. Pool is either not initialized or connection was lost.'
		)
	}
	return pool
}

const isConnected = () => {
	return pool && pool.connected
}

module.exports = {
	initializeDatabase,
	getPool,
	isConnected,
	sql,
}
