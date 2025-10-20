const express = require('express')
const { getPool, isConnected, sql } = require('../database')

const router = express.Router()

// Mock data for when database is not connected
const mockUsers = [
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

// GET /api/users - Get all users
router.get('/', async (req, res) => {
	try {
		console.log('🔍 Checking database connection status...')

		if (!isConnected()) {
			throw new Error('Database connection not available')
		}

		const pool = getPool()
		console.log('📡 Executing SQL query to fetch users...')

		const result = await pool.request().query(`
                SELECT 
                    Id as id,
                    FirstName as firstName,
                    LastName as lastName,
                    Email as email,
                    IsActive as isActive
                FROM Users
                ORDER BY Id
            `)

		console.log(`📊 Raw query result: ${result.recordset.length} records found`)

		// Transform data to match frontend interface
		const users = result.recordset.map((user) => ({
			id: user.id,
			name: `${user.firstName} ${user.lastName}`,
			email: user.email,
			role: 'User', // Default role since it's not in DB
			status: user.isActive ? 'active' : 'inactive',
		}))

		console.log(
			`✅ Successfully fetched ${users.length} users from SQL Server database`
		)
		res.json(users)
	} catch (error) {
		console.error('❌ Error fetching users from database:')
		console.error('   Error message:', error.message)
		console.error('   Error type:', error.constructor.name)
		console.error('   Full error:', error)
		console.log('📊 Returning mock data as fallback')
		// Return mock data if database fails
		res.json(mockUsers)
	}
})

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const pool = getPool()
		const result = await pool.request().input('id', sql.Int, id).query(`
                SELECT 
                    Id as id,
                    FirstName as firstName,
                    LastName as lastName,
                    Email as email,
                    IsActive as isActive
                FROM Users
                WHERE Id = @id
            `)

		if (result.recordset.length === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		const user = result.recordset[0]
		const transformedUser = {
			id: user.id,
			name: `${user.firstName} ${user.lastName}`,
			email: user.email,
			role: 'User',
			status: user.isActive ? 'active' : 'inactive',
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

		const pool = getPool()
		const result = await pool
			.request()
			.input('firstName', sql.NVarChar(50), firstName)
			.input('lastName', sql.NVarChar(50), lastName)
			.input('email', sql.NVarChar(100), email)
			.input('isActive', sql.Bit, isActive).query(`
                INSERT INTO Users (FirstName, LastName, Email, IsActive)
                OUTPUT INSERTED.Id, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email, INSERTED.IsActive
                VALUES (@firstName, @lastName, @email, @isActive)
            `)

		const newUser = result.recordset[0]
		const transformedUser = {
			id: newUser.Id,
			name: `${newUser.FirstName} ${newUser.LastName}`,
			email: newUser.Email,
			role: 'User',
			status: newUser.IsActive ? 'active' : 'inactive',
		}

		res.status(201).json(transformedUser)
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

		const pool = getPool()
		const result = await pool
			.request()
			.input('id', sql.Int, id)
			.input('firstName', sql.NVarChar(50), firstName)
			.input('lastName', sql.NVarChar(50), lastName)
			.input('email', sql.NVarChar(100), email)
			.input('isActive', sql.Bit, isActive).query(`
                UPDATE Users 
                SET 
                    FirstName = @firstName,
                    LastName = @lastName,
                    Email = @email,
                    IsActive = @isActive
                OUTPUT INSERTED.Id, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email, INSERTED.IsActive
                WHERE Id = @id
            `)

		if (result.recordset.length === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		const updatedUser = result.recordset[0]
		const transformedUser = {
			id: updatedUser.Id,
			name: `${updatedUser.FirstName} ${updatedUser.LastName}`,
			email: updatedUser.Email,
			role: 'User',
			status: updatedUser.IsActive ? 'active' : 'inactive',
		}

		res.json(transformedUser)
	} catch (error) {
		console.error('Error updating user:', error)
		res.status(500).json({ error: 'Failed to update user' })
	}
})

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params

		const pool = getPool()
		const result = await pool.request().input('id', sql.Int, id).query(`
                DELETE FROM Users 
                WHERE Id = @id
            `)

		if (result.rowsAffected[0] === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		res.json({ message: 'User deleted successfully' })
	} catch (error) {
		console.error('Error deleting user:', error)
		res.status(500).json({ error: 'Failed to delete user' })
	}
})

module.exports = router
