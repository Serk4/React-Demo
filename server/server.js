const express = require('express')
const cors = require('cors')
const { initializeDatabase } = require('./database-mysql')
const usersRoutes = require('./routes/users')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
	cors({
		origin: true, // Allow all origins for now
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
)
app.use(express.json())

// Routes
app.use('/api/users', usersRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({
		status: 'OK',
		message: 'Server is running',
		environment: process.env.VERCEL ? 'production' : 'development',
		database: process.env.MYSQL_HOST ? 'MySQL' : 'in-memory fallback',
	})
})

// Initialize database and start server
const startServer = async () => {
	let dbConnected = false
	try {
		await initializeDatabase()
		console.log('✅ MySQL database connected successfully!')
		dbConnected = true
	} catch (error) {
		console.error('❌ MySQL database connection failed:', error.message)
		console.log('⚠️  Server will start with in-memory storage as fallback')
		console.log('📊 API endpoints will return mock/temporary data')
	}

	// Start server (only in local development)
	if (require.main === module) {
		app.listen(PORT, () => {
			console.log(`🚀 Server running on http://localhost:${PORT}`)
			console.log(`📡 API endpoints available at http://localhost:${PORT}/api`)
			console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
			console.log(
				`💾 Database status: ${
					dbConnected ? 'CONNECTED (MySQL)' : 'FALLBACK (In-memory)'
				}`
			)
		})
	}
}

// Initialize on startup
startServer()

// Export app for Vercel and testing
module.exports = app
