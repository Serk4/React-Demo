const express = require('express')
const { getPool, isConnected } = require('../database-mysql')

const router = express.Router()

// In-memory storage fallback when MySQL is not available
let users = [
	{
		id: 1,
		name: 'Alice Johnson',
		email: 'alice.johnson@example.com',
		role: 'User',
		status: 'active',
	},
	{
		id: 2,
		name: 'Bob Smith',
		email: 'bob.smith@example.com',
		role: 'User',
		status: 'active',
	},
	{
		id: 3,
		name: 'Carol Lee',
		email: 'carol.lee@example.com',
		role: 'User',
		status: 'inactive',
	},
	{
		id: 4,
		name: 'David Nguyen',
		email: 'david.nguyen@example.com',
		role: 'User',
		status: 'active',
	},
	{
		id: 5,
		name: 'Eve Martinez',
		email: 'eve.martinez@example.com',
		role: 'User',
		status: 'inactive',
	},
]

let nextId = 6

// GET /api/users - Get all users
router.get('/', async (req, res) => {
	try {
		console.log('🔍 Checking database connection status...')

		if (!isConnected()) {
			console.log('📊 Using in-memory storage fallback')
			return res.json(users)
		}

		const pool = getPool()
		console.log('📡 Executing MySQL query to fetch users...')

		const [rows] = await pool.execute(`
			SELECT 
				id,
				first_name,
				last_name,
				email,
				is_active,
				created_at,
				updated_at
			FROM users
			ORDER BY id
		`)

		// Transform data to match frontend interface
		const transformedUsers = rows.map((user) => ({
			id: user.id,
			name: `${user.first_name} ${user.last_name}`,
			email: user.email,
			role: 'User', // Default role
			status: user.is_active ? 'active' : 'inactive',
		}))

		console.log(
			`✅ Successfully fetched ${transformedUsers.length} users from MySQL`
		)
		res.json(transformedUsers)
	} catch (error) {
		console.error('❌ Error fetching users from MySQL:', error.message)
		console.log('📊 Returning in-memory data as fallback')
		res.json(users)
	}
})

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params

		if (!isConnected()) {
			const user = users.find((u) => u.id === parseInt(id))
			if (!user) {
				return res.status(404).json({ error: 'User not found' })
			}
			return res.json(user)
		}

		const pool = getPool()
		const [rows] = await pool.execute(
			`
			SELECT 
				id,
				first_name,
				last_name,
				email,
				is_active
			FROM users
			WHERE id = ?
		`,
			[id]
		)

		if (rows.length === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		const user = rows[0]
		const transformedUser = {
			id: user.id,
			name: `${user.first_name} ${user.last_name}`,
			email: user.email,
			role: 'User',
			status: user.is_active ? 'active' : 'inactive',
		}

		res.json(transformedUser)
	} catch (error) {
		console.error('Error fetching user:', error)
		res.status(500).json({ error: 'Failed to fetch user' })
	}
})

// POST /api/users - Create new user
router.post('/', async (req, res) => {
	try {
		const { firstName, lastName, email, isActive = true } = req.body

		if (!firstName || !lastName || !email) {
			return res
				.status(400)
				.json({ error: 'FirstName, LastName, and Email are required' })
		}

		if (!isConnected()) {
			// Check 10-user limit for in-memory storage
			if (users.length >= 10) {
				return res.status(400).json({
					error:
						'Maximum of 10 users allowed. 5 default users reset daily at midnight.',
					currentCount: users.length,
					maxAllowed: 10,
					defaultUsers: 5,
					additionalAllowed: 5,
				})
			}

			const newUser = {
				id: nextId++,
				name: `${firstName} ${lastName}`,
				email: email,
				role: 'User',
				status: isActive ? 'active' : 'inactive',
			}
			users.push(newUser)
			console.log(
				`✅ Created new user in memory: ${newUser.name} (${users.length}/10)`
			)
			return res.status(201).json(newUser)
		}

		const pool = getPool()

		// Check current user count before inserting
		const [countResult] = await pool.execute(
			'SELECT COUNT(*) as count FROM users'
		)
		const currentCount = countResult[0].count

		if (currentCount >= 10) {
			console.log(`🚫 User creation blocked: ${currentCount}/10 users exist`)
			return res.status(400).json({
				error:
					'Maximum of 10 users allowed. 5 default users reset daily at midnight.',
				currentCount: currentCount,
				maxAllowed: 10,
				defaultUsers: 5,
				additionalAllowed: 5,
				resetInfo: '5 default users automatically reset every day',
			})
		}

		const [result] = await pool.execute(
			`
			INSERT INTO users (first_name, last_name, email, is_active)
			VALUES (?, ?, ?, ?)
		`,
			[firstName, lastName, email, isActive]
		)

		const newUser = {
			id: result.insertId,
			name: `${firstName} ${lastName}`,
			email: email,
			role: 'User',
			status: isActive ? 'active' : 'inactive',
		}

		console.log(
			`✅ Created new user in MySQL: ${newUser.name} (${currentCount + 1}/10)`
		)
		res.status(201).json(newUser)
	} catch (error) {
		console.error('Error creating user:', error)
		res.status(500).json({ error: 'Failed to create user' })
	}
})

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { firstName, lastName, email, isActive } = req.body

		// Validate required fields
		if (!firstName || !lastName || !email) {
			return res
				.status(400)
				.json({ error: 'FirstName, LastName, and Email are required' })
		}

		if (!isConnected()) {
			const userIndex = users.findIndex((u) => u.id === parseInt(id))

			if (userIndex === -1) {
				return res.status(404).json({ error: 'User not found' })
			}

			const updatedUser = {
				...users[userIndex],
				name: `${firstName} ${lastName}`,
				email: email,
				status: isActive ? 'active' : 'inactive',
			}

			users[userIndex] = updatedUser
			console.log(`✅ Updated user in memory: ${updatedUser.name}`)
			return res.json(updatedUser)
		}

		const pool = getPool()
		const [result] = await pool.execute(
			`
			UPDATE users 
			SET 
				first_name = ?,
				last_name = ?,
				email = ?,
				is_active = ?
			WHERE id = ?
		`,
			[firstName, lastName, email, isActive, id]
		)

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		const updatedUser = {
			id: parseInt(id),
			name: `${firstName} ${lastName}`,
			email: email,
			role: 'User',
			status: isActive ? 'active' : 'inactive',
		}

		console.log(`✅ Updated user in MySQL: ${updatedUser.name}`)
		res.json(updatedUser)
	} catch (error) {
		console.error('Error updating user:', error)
		res.status(500).json({ error: 'Failed to update user' })
	}
})

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params

		if (!isConnected()) {
			const userIndex = users.findIndex((u) => u.id === parseInt(id))

			if (userIndex === -1) {
				return res.status(404).json({ error: 'User not found' })
			}

			const deletedUser = users.splice(userIndex, 1)[0]
			console.log(
				`✅ Deleted user from memory: ${deletedUser.name} (${users.length}/10 remaining)`
			)
			return res.json({
				message: 'User deleted successfully',
				remainingUsers: users.length,
				maxAllowed: 10,
				note:
					users.length === 0
						? 'All users deleted - 5 default users will reset at midnight'
						: null,
			})
		}

		const pool = getPool()
		const [result] = await pool.execute(
			`
			DELETE FROM users 
			WHERE id = ?
		`,
			[id]
		)

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Get updated count after deletion
		const [countResult] = await pool.execute(
			'SELECT COUNT(*) as count FROM users'
		)
		const remainingCount = countResult[0].count

		console.log(
			`✅ Deleted user from MySQL: ID ${id} (${remainingCount}/10 remaining)`
		)
		res.json({
			message: 'User deleted successfully',
			remainingUsers: remainingCount,
			maxAllowed: 10,
			note:
				remainingCount === 0
					? 'All users deleted - 5 default users will reset at midnight'
					: null,
		})
	} catch (error) {
		console.error('Error deleting user:', error)
		res.status(500).json({ error: 'Failed to delete user' })
	}
})

// GET /api/users/admin/status - Get database status and limits
router.get('/admin/status', async (req, res) => {
	try {
		let currentCount = 0
		let storageType = 'memory'

		if (!isConnected()) {
			currentCount = users.length
			storageType = 'memory'
		} else {
			const pool = getPool()
			const [countResult] = await pool.execute(
				'SELECT COUNT(*) as count FROM users'
			)
			currentCount = countResult[0].count
			storageType = 'mysql'
		}

		res.json({
			storageType,
			currentUsers: currentCount,
			maxUsers: 10,
			defaultUsers: 5,
			additionalAllowed: 5,
			usersRemaining: Math.max(0, 10 - currentCount),
			isAtLimit: currentCount >= 10,
			resetSchedule: 'Daily at midnight UTC',
			lastResetInfo:
				'5 default users automatically reset, up to 5 additional users allowed (10 max total)',
		})
	} catch (error) {
		console.error('Error getting status:', error)
		res.status(500).json({ error: 'Failed to get status' })
	}
})

// POST /api/users/admin/reset - Manual database reset (for testing)
router.post('/admin/reset', async (req, res) => {
	try {
		const { resetDatabase, DEFAULT_USERS } = require('../scripts/daily-reset')

		console.log('🔄 Manual database reset triggered...')
		const result = await resetDatabase()

		res.json({
			message: 'Database reset successfully',
			usersRestored: result.usersRestored,
			resetTime: result.resetTime,
		})
	} catch (error) {
		console.error('Error during manual reset:', error)
		res.status(500).json({ error: 'Failed to reset database' })
	}
})

module.exports = router
