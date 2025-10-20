const sql = require('mssql')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const dbConfig = {
	server: process.env.DB_SERVER,
	database: process.env.DB_DATABASE,
	port: parseInt(process.env.DB_PORT) || 1433,
	options: {
		encrypt: process.env.DB_ENCRYPT === 'true',
		trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
		// Use integrated security for Windows Authentication
		integratedSecurity: true,
		instanceName: process.env.DB_INSTANCE,
	},
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000,
	},
	connectionTimeout: 30000,
	requestTimeout: 30000,
}

let pool

const initializeDatabase = async () => {
	try {
		console.log('🔍 Attempting to connect to SQL Server...')
		console.log('Database config:', {
			server: dbConfig.server,
			database: dbConfig.database,
			integratedSecurity: dbConfig.options.integratedSecurity,
			encrypt: dbConfig.options.encrypt,
		})

		pool = await sql.connect(dbConfig)
		console.log('✅ Connected to SQL Server database successfully!')
		console.log(`🗄️  Connected to: ${dbConfig.server}\\${dbConfig.database}`)
		return pool
	} catch (error) {
		console.error('❌ Database connection failed:', error.message)
		console.log('💡 Make sure SQL Server is running and accessible')
		console.log('💡 Verify Windows Authentication is enabled')
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
