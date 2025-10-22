const express = require('express')
const cors = require('cors')
const { initializeDatabase } = require('./database')
const usersRoutes = require('./routes/users')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/users', usersRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ status: 'OK', message: 'Server is running' })
})

// Initialize database and start server
const startServer = async () => {
	let dbConnected = false
	try {
		await initializeDatabase()
		console.log('✅ Database connected successfully!')
		console.log('🗄️  Using SQL Server LocalDB for user data')
		dbConnected = true
	} catch (error) {
		console.error('❌ Database connection failed:', error.message)
		console.log('⚠️  Server will start without database connection')
		console.log('📊 API endpoints will return mock data as fallback')
	}

	// Start server regardless of database connection
	if (require.main === module) {
		app.listen(PORT, () => {
			console.log(`🚀 Server running on http://localhost:${PORT}`)
			console.log(`📡 API endpoints available at http://localhost:${PORT}/api`)
			console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
			console.log(
				`💾 Database status: ${
					dbConnected ? 'CONNECTED (Real data)' : 'DISCONNECTED (Mock data)'
				}`
			)
		})
	}
}

startServer()

// Export app for testing
module.exports = app
