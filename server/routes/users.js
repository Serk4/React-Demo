const express = require('express')
const { getPool, isConnected } = require('../database-mysql')
const sharedData = require('../shared-data')

const router = express.Router()

// GET /api/users - Get all users
router.get('/', async (req, res) => {
	try {
		console.log('🔍 Checking database connection status...')

		if (!isConnected()) {
			console.log('📊 Using in-memory storage fallback')

			// Transform users and include role information from userRoleAssignments
			const usersWithRoles = sharedData.getUsers().map((user) => {
				// Find all role assignments for this user
				const userAssignments = sharedData
					.getUserRoleAssignments()
					.filter((assignment) => assignment.user_id === user.id)

				// Get role names for this user
				const roleNames = userAssignments.map((assignment) => {
					const role = sharedData
						.getRoles()
						.find((r) => r.id === assignment.role_id)
					return role ? role.name : 'Unknown Role'
				})

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					role:
						roleNames.length > 0 ? roleNames.join(', ') : 'No roles assigned',
					status: user.status,
				}
			})

			return res.json(usersWithRoles)
		}

		const pool = getPool()
		console.log('📡 Executing MySQL query to fetch users...')

		const [rows] = await pool.execute(`
			SELECT 
				u.id,
				u.first_name,
				u.last_name,
				u.email,
				u.is_active,
				u.created_at,
				u.updated_at,
				GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ', ') as roles
			FROM users u
			LEFT JOIN user_roles ur ON u.id = ur.user_id
			LEFT JOIN roles r ON ur.role_id = r.id
			GROUP BY u.id, u.first_name, u.last_name, u.email, u.is_active, u.created_at, u.updated_at
			ORDER BY u.id
		`)

		// Transform data to match frontend interface
		const transformedUsers = rows.map((user) => ({
			id: user.id,
			name: `${user.first_name} ${user.last_name}`,
			email: user.email,
			role: user.roles || 'No roles assigned',
			status: user.is_active ? 'active' : 'inactive',
		}))

		console.log(
			`✅ Successfully fetched ${transformedUsers.length} users from MySQL`,
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
			const user = sharedData.getUsers().find((u) => u.id === parseInt(id))
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
			[id],
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

// GET /api/users/:id/roles - Get user's roles
router.get('/:id/roles', async (req, res) => {
	try {
		const { id } = req.params
		const userId = parseInt(id)

		if (!isConnected()) {
			console.log('📊 Using in-memory user roles fallback')

			// Filter role assignments for this user
			const userAssignments = sharedData
				.getUserRoleAssignments()
				.filter((assignment) => assignment.user_id === userId)

			// Map assignments to include role information
			const userRoles = userAssignments.map((assignment) => {
				const role = sharedData
					.getRoles()
					.find((r) => r.id === assignment.role_id)
				return {
					id: assignment.role_id, // Using role_id as id for consistency
					user_id: assignment.user_id,
					role_id: assignment.role_id,
					assigned_at: assignment.assigned_at,
					role: {
						id: role?.id || assignment.role_id,
						name: role?.name || 'Unknown Role',
						description: role?.description || 'Role not found',
					},
				}
			})

			return res.json(userRoles)
		}

		const pool = getPool()
		const [rows] = await pool.execute(
			`
			SELECT 
				ur.id,
				ur.user_id,
				ur.role_id,
				ur.assigned_at,
				r.name as role_name,
				r.description as role_description
			FROM user_roles ur
			JOIN roles r ON ur.role_id = r.id
			WHERE ur.user_id = ?
			ORDER BY r.name
		`,
			[id],
		)

		// Transform data to include role object
		const dbUserRoles = rows.map((row) => ({
			id: row.id,
			user_id: row.user_id,
			role_id: row.role_id,
			assigned_at: row.assigned_at,
			role: {
				id: row.role_id,
				name: row.role_name,
				description: row.role_description,
			},
		}))

		res.json(dbUserRoles)
	} catch (error) {
		console.error('Error fetching user roles:', error)
		res.status(500).json({ error: 'Failed to fetch user roles' })
	}
})

// POST /api/users/:id/roles - Assign role to user
router.post('/:id/roles', async (req, res) => {
	try {
		const { id } = req.params
		const { role_id } = req.body
		const userId = parseInt(id)
		const roleId = parseInt(role_id)

		if (!role_id) {
			return res.status(400).json({ error: 'Role ID is required' })
		}

		if (!isConnected()) {
			console.log('📊 Using in-memory role assignment in users route')

			// Check if role exists
			const roleExists = sharedData.getRoles().find((r) => r.id === roleId)
			if (!roleExists) {
				return res.status(404).json({ error: 'Role not found' })
			}

			// Check if assignment already exists
			const existingAssignment = sharedData
				.getUserRoleAssignments()
				.find(
					(assignment) =>
						assignment.user_id === userId && assignment.role_id === roleId,
				)

			if (existingAssignment) {
				return res
					.status(409)
					.json({ error: 'Role already assigned to this user' })
			}

			// Add assignment to in-memory storage
			sharedData.addUserRoleAssignment({
				user_id: userId,
				role_id: roleId,
				assigned_at: new Date().toISOString(),
			})

			return res.status(201).json({
				id: roleId, // Using roleId as id for consistency
				user_id: userId,
				role_id: roleId,
				assigned_at: new Date().toISOString(),
				message: 'Role assigned successfully',
			})
			return res
				.status(500)
				.json({ error: 'Database connection not available' })
		}

		const pool = getPool()

		// Check if assignment already exists
		const [existing] = await pool.execute(
			'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
			[id, role_id],
		)

		if (existing.length > 0) {
			return res
				.status(409)
				.json({ error: 'Role already assigned to this user' })
		}

		// Insert new role assignment
		const [result] = await pool.execute(
			'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
			[id, role_id],
		)

		res.status(201).json({
			id: result.insertId,
			user_id: parseInt(id),
			role_id: parseInt(role_id),
			assigned_at: new Date(),
			message: 'Role assigned successfully',
		})
	} catch (error) {
		console.error('Error assigning role:', error)
		res.status(500).json({ error: 'Failed to assign role' })
	}
})

// DELETE /api/users/:id/roles/:roleId - Remove role from user
router.delete('/:id/roles/:roleId', async (req, res) => {
	try {
		const { id, roleId } = req.params
		const userId = parseInt(id)
		const roleIdInt = parseInt(roleId)

		if (!isConnected()) {
			console.log('📊 Using in-memory role removal in users route')

			// Remove assignment from in-memory storage
			sharedData.removeUserRoleAssignment(userId, roleIdInt)

			return res.json({ message: 'Role removed successfully' })
		}

		const pool = getPool()

		const [result] = await pool.execute(
			'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
			[id, roleId],
		)

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'Role assignment not found' })
		}

		res.json({ message: 'Role removed successfully' })
	} catch (error) {
		console.error('Error removing role:', error)
		res.status(500).json({ error: 'Failed to remove role' })
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

		// Check for duplicate name
		const fullName = `${firstName} ${lastName}`

		if (!isConnected()) {
			// Check for duplicate name in memory
			const existingUser = sharedData
				.getUsers()
				.find((u) => u.name.toLowerCase() === fullName.toLowerCase())
			if (existingUser) {
				return res.status(400).json({
					error: `A user with the name "${fullName}" already exists. Please choose a different name.`,
				})
			}

			// Check 10-user limit for in-memory storage
			if (sharedData.getUsers().length >= 10) {
				return res.status(400).json({
					error:
						'Demo limit reached! 📊 This demo app has a 10-user limit. Delete an existing user or use the Reset button.',
					currentCount: sharedData.getUsers().length,
					currentCount: sharedData.getUsers().length,
					maxAllowed: 10,
					howToContinue: {
						option1: 'Delete an existing user to test the Create feature',
						option2: 'Use the Reset button to restore default users',
						note: 'Data resets automatically on new deployments',
					},
					tips: [
						'💡 Try editing or deleting existing users',
						'🔄 Use the reset feature for a clean slate',
						'👥 This data is shared with all demo visitors',
					],
				})
			}

			const newUser = {
				name: `${firstName} ${lastName}`,
				email: email,
				role: 'User',
				status: isActive ? 'active' : 'inactive',
			}
			const createdUser = sharedData.addUser(newUser)
			console.log(
				`✅ Created new user in memory: ${createdUser.name} (${sharedData.getUsers().length}/10)`,
			)

			return res.status(201).json(createdUser)
		}

		const pool = getPool()

		// Check for duplicate name in database
		const [existingUsers] = await pool.execute(
			'SELECT first_name, last_name FROM users WHERE LOWER(CONCAT(first_name, " ", last_name)) = LOWER(?)',
			[fullName],
		)

		if (existingUsers.length > 0) {
			return res.status(400).json({
				error: `A user with the name "${fullName}" already exists. Please choose a different name.`,
			})
		}

		// Check current user count before inserting
		const [countResult] = await pool.execute(
			'SELECT COUNT(*) as count FROM users',
		)
		const currentCount = countResult[0].count

		if (currentCount >= 10) {
			console.log(`🚫 User creation blocked: ${currentCount}/10 users exist`)
			return res.status(400).json({
				error:
					'Demo limit reached! 📊 This demo app has a 10-user limit. Delete an existing user or use the Reset button.',
				currentCount: currentCount,
				maxAllowed: 10,
				howToContinue: {
					option1: 'Delete an existing user to test the Create feature',
					option2: 'Use the Reset button to restore default users',
					note: 'Data resets automatically on new deployments',
				},
				tips: [
					'💡 Try editing or deleting existing users',
					'🔄 Use the reset feature for a clean slate',
					'👥 This data is shared with all demo visitors',
				],
			})
		}

		const [result] = await pool.execute(
			`
			INSERT INTO users (first_name, last_name, email, is_active)
			VALUES (?, ?, ?, ?)
		`,
			[firstName, lastName, email, isActive],
		)

		const newUser = {
			id: result.insertId,
			name: `${firstName} ${lastName}`,
			email: email,
			role: 'User',
			status: isActive ? 'active' : 'inactive',
		}

		console.log(
			`✅ Created new user in MySQL: ${newUser.name} (${currentCount + 1}/10)`,
		)

		return res.status(201).json(newUser)
	} catch (error) {
		console.error('Error creating user:', error)
		res.status(500).json({ error: 'Failed to create user. Please try again.' })
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

		// Check for duplicate name (excluding current user)
		const fullName = `${firstName} ${lastName}`

		if (!isConnected()) {
			const userIndex = sharedData
				.getUsers()
				.findIndex((u) => u.id === parseInt(id))

			if (userIndex === -1) {
				return res.status(404).json({ error: 'User not found' })
			}

			// Check for duplicate name (excluding current user)
			const existingUser = sharedData
				.getUsers()
				.find(
					(u) =>
						u.name.toLowerCase() === fullName.toLowerCase() &&
						u.id !== parseInt(id),
				)
			if (existingUser) {
				return res.status(400).json({
					error: `A user with the name "${fullName}" already exists. Please choose a different name.`,
				})
			}

			const updatedUser = {
				...sharedData.getUsers()[userIndex],
				name: `${firstName} ${lastName}`,
				email: email,
				status: isActive ? 'active' : 'inactive',
			}

			sharedData.getUsers()[userIndex] = updatedUser
			console.log(`✅ Updated user in memory: ${updatedUser.name}`)
			return res.json(updatedUser)
		}

		const pool = getPool()

		// Check if user exists
		const [existingUserResult] = await pool.execute(
			'SELECT id FROM users WHERE id = ?',
			[id],
		)

		if (existingUserResult.length === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Check for duplicate name (excluding current user)
		const [duplicateUsers] = await pool.execute(
			'SELECT id FROM users WHERE LOWER(CONCAT(first_name, " ", last_name)) = LOWER(?) AND id != ?',
			[fullName, id],
		)

		if (duplicateUsers.length > 0) {
			return res.status(400).json({
				error: `A user with the name "${fullName}" already exists. Please choose a different name.`,
			})
		}
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
			[firstName, lastName, email, isActive, id],
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
		res.status(500).json({ error: 'Failed to update user. Please try again.' })
	}
})

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params

		if (!isConnected()) {
			console.log(`🗑️ DELETE request for user ID: ${id}`)
			console.log(`📊 Users before delete: ${sharedData.getUsers().length}`)

			const userIndex = sharedData
				.getUsers()
				.findIndex((u) => u.id === parseInt(id))

			if (userIndex === -1) {
				console.log(`❌ User with ID ${id} not found`)
				return res.status(404).json({ error: 'User not found' })
			}

			console.log(`🎯 Found user at index: ${userIndex}`)
			const deletedUser = sharedData.getUsers().splice(userIndex, 1)[0]
			console.log(`📊 Users after delete: ${sharedData.getUsers().length}`)
			console.log(
				`✅ Deleted user from memory: ${deletedUser.name} (${sharedData.getUsers().length}/10 remaining)`,
			)
			return res.json({
				message: 'User deleted successfully',
				remainingUsers: sharedData.getUsers().length,
				maxAllowed: 10,
				note:
					sharedData.getUsers().length === 0
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
			[id],
		)

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Get updated count after deletion
		const [countResult] = await pool.execute(
			'SELECT COUNT(*) as count FROM users',
		)
		const remainingCount = countResult[0].count

		console.log(
			`✅ Deleted user from MySQL: ID ${id} (${remainingCount}/10 remaining)`,
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
			currentCount = sharedData.getUsers().length
			storageType = 'memory'
		} else {
			const pool = getPool()
			const [countResult] = await pool.execute(
				'SELECT COUNT(*) as count FROM users',
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
			isNearLimit: currentCount >= 8,
			resetSchedule: 'On new deployments',
			status: {
				message:
					currentCount >= 10
						? '🚫 Demo limit reached!'
						: currentCount >= 8
							? `⚠️ Approaching limit (${currentCount}/10)`
							: `✅ ${10 - currentCount} users remaining`,
				canCreateUsers: currentCount < 10,
				suggestion:
					currentCount >= 10
						? 'Delete a user or use Reset to continue testing'
						: currentCount >= 8
							? 'Consider testing delete/edit features soon'
							: 'Feel free to create more test users',
			},
			demoInfo: {
				purpose: 'CI/CD Pipeline Demonstration',
				sharedData: 'All visitors see the same data',
				autoReset: 'Data resets on new deployments',
				features: ['Create', 'Read', 'Update', 'Delete', 'Reset'],
			},
		})
	} catch (error) {
		console.error('Error getting status:', error)
		res.status(500).json({ error: 'Failed to get status' })
	}
})

// POST /api/users/admin/reset - Manual database reset (for demo purposes)
router.post('/admin/reset', async (req, res) => {
	try {
		console.log('🔄 Demo reset triggered - restoring default users...')

		// Reset in-memory storage to defaults (perfect for demos!)
		sharedData.setUsers([
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
		])

		// Reset the ID counter
		sharedData.setNextUserId(6)

		res.json({
			message: 'Demo database reset successfully! 🎬',
			usersRestored: 5,
			resetTime: new Date().toISOString(),
			mode: 'In-Memory Demo Mode',
			note: 'Perfect for CI/CD demonstrations - data auto-resets on deployments!',
		})
	} catch (error) {
		console.error('Error during demo reset:', error)
		res.status(500).json({ error: 'Failed to reset demo database' })
	}
})

module.exports = router
