const express = require('express')
const router = express.Router()
const { getPool } = require('../database-mysql')

// Get all roles
router.get('/', async (req, res) => {
	try {
		const pool = getPool()
		const [rows] = await pool.execute(`
			SELECT 
				r.id,
				r.name,
				r.description,
				r.created_at,
				COUNT(ur.user_id) as user_count
			FROM roles r
			LEFT JOIN user_roles ur ON r.id = ur.role_id
			GROUP BY r.id, r.name, r.description, r.created_at
			ORDER BY r.name
		`)
		res.json(rows)
	} catch (error) {
		console.error('Error fetching roles:', error)
		res.status(500).json({
			error: 'Failed to fetch roles',
			message: 'An error occurred while retrieving roles from the database',
		})
	}
})

// Get role by ID with assigned users
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const pool = getPool()

		// Get role details
		const [roleRows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [
			id,
		])

		if (roleRows.length === 0) {
			return res.status(404).json({ error: 'Role not found' })
		}

		// Get users assigned to this role
		const [userRows] = await pool.execute(
			`
			SELECT 
				u.id,
				u.first_name,
				u.last_name,
				u.email,
				u.is_active,
				ur.assigned_at
			FROM users u
			JOIN user_roles ur ON u.id = ur.user_id
			WHERE ur.role_id = ?
			ORDER BY u.first_name, u.last_name
		`,
			[id],
		)

		const role = roleRows[0]
		role.users = userRows

		res.json(role)
	} catch (error) {
		console.error('Error fetching role:', error)
		res.status(500).json({
			error: 'Failed to fetch role',
			message: 'An error occurred while retrieving role details',
		})
	}
})

// Create new role
router.post('/', async (req, res) => {
	try {
		const { name, description } = req.body

		// Validation
		if (!name || !description) {
			return res.status(400).json({
				error: 'Missing required fields',
				message: 'Role name and description are required',
			})
		}

		if (name.length > 50) {
			return res.status(400).json({
				error: 'Invalid data',
				message: 'Role name must be 50 characters or less',
			})
		}

		if (description.length > 255) {
			return res.status(400).json({
				error: 'Invalid data',
				message: 'Role description must be 255 characters or less',
			})
		}

		const pool = getPool()

		// Check if role name already exists
		const [existing] = await pool.execute(
			'SELECT id FROM roles WHERE name = ?',
			[name],
		)

		if (existing.length > 0) {
			return res.status(409).json({
				error: 'Role already exists',
				message: `A role with the name "${name}" already exists`,
			})
		}

		const [result] = await pool.execute(
			'INSERT INTO roles (name, description) VALUES (?, ?)',
			[name, description],
		)

		// Fetch the created role
		const [newRole] = await pool.execute('SELECT * FROM roles WHERE id = ?', [
			result.insertId,
		])

		res.status(201).json(newRole[0])
	} catch (error) {
		console.error('Error creating role:', error)
		res.status(500).json({
			error: 'Failed to create role',
			message: 'An error occurred while creating the role',
		})
	}
})

// Update role
router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { name, description } = req.body

		// Validation
		if (!name || !description) {
			return res.status(400).json({
				error: 'Missing required fields',
				message: 'Role name and description are required',
			})
		}

		if (name.length > 50) {
			return res.status(400).json({
				error: 'Invalid data',
				message: 'Role name must be 50 characters or less',
			})
		}

		if (description.length > 255) {
			return res.status(400).json({
				error: 'Invalid data',
				message: 'Role description must be 255 characters or less',
			})
		}

		const pool = getPool()

		// Check if role exists
		const [existing] = await pool.execute('SELECT id FROM roles WHERE id = ?', [
			id,
		])

		if (existing.length === 0) {
			return res.status(404).json({ error: 'Role not found' })
		}

		// Check if name conflicts with another role
		const [nameConflict] = await pool.execute(
			'SELECT id FROM roles WHERE name = ? AND id != ?',
			[name, id],
		)

		if (nameConflict.length > 0) {
			return res.status(409).json({
				error: 'Role name already exists',
				message: `Another role with the name "${name}" already exists`,
			})
		}

		await pool.execute(
			'UPDATE roles SET name = ?, description = ? WHERE id = ?',
			[name, description, id],
		)

		// Fetch updated role
		const [updatedRole] = await pool.execute(
			'SELECT * FROM roles WHERE id = ?',
			[id],
		)

		res.json(updatedRole[0])
	} catch (error) {
		console.error('Error updating role:', error)
		res.status(500).json({
			error: 'Failed to update role',
			message: 'An error occurred while updating the role',
		})
	}
})

// Delete role
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const pool = getPool()

		// Check if role exists
		const [existing] = await pool.execute('SELECT id FROM roles WHERE id = ?', [
			id,
		])

		if (existing.length === 0) {
			return res.status(404).json({ error: 'Role not found' })
		}

		// Check if role is assigned to any users
		const [assigned] = await pool.execute(
			'SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?',
			[id],
		)

		if (assigned[0].count > 0) {
			return res.status(409).json({
				error: 'Cannot delete role',
				message: `This role is currently assigned to ${assigned[0].count} user(s). Please remove all assignments before deleting.`,
			})
		}

		await pool.execute('DELETE FROM roles WHERE id = ?', [id])
		res.status(204).send()
	} catch (error) {
		console.error('Error deleting role:', error)
		res.status(500).json({
			error: 'Failed to delete role',
			message: 'An error occurred while deleting the role',
		})
	}
})

// User-Role assignment endpoints

// Assign role to user
router.post('/:roleId/users/:userId', async (req, res) => {
	try {
		const { roleId, userId } = req.params
		const pool = getPool()

		// Validate role and user exist
		const [roleExists] = await pool.execute(
			'SELECT id FROM roles WHERE id = ?',
			[roleId],
		)
		const [userExists] = await pool.execute(
			'SELECT id FROM users WHERE id = ?',
			[userId],
		)

		if (roleExists.length === 0) {
			return res.status(404).json({ error: 'Role not found' })
		}
		if (userExists.length === 0) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Check if assignment already exists
		const [existing] = await pool.execute(
			'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
			[userId, roleId],
		)

		if (existing.length > 0) {
			return res.status(409).json({
				error: 'Assignment already exists',
				message: 'This user is already assigned to this role',
			})
		}

		await pool.execute(
			'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
			[userId, roleId],
		)

		res.status(201).json({
			message: 'Role assigned successfully',
			userId: parseInt(userId),
			roleId: parseInt(roleId),
		})
	} catch (error) {
		console.error('Error assigning role:', error)
		res.status(500).json({
			error: 'Failed to assign role',
			message: 'An error occurred while assigning the role',
		})
	}
})

// Remove role from user
router.delete('/:roleId/users/:userId', async (req, res) => {
	try {
		const { roleId, userId } = req.params
		const pool = getPool()

		// Check if assignment exists
		const [existing] = await pool.execute(
			'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
			[userId, roleId],
		)

		if (existing.length === 0) {
			return res.status(404).json({
				error: 'Assignment not found',
				message: 'This user is not assigned to this role',
			})
		}

		await pool.execute(
			'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
			[userId, roleId],
		)

		res.status(204).send()
	} catch (error) {
		console.error('Error removing role assignment:', error)
		res.status(500).json({
			error: 'Failed to remove role assignment',
			message: 'An error occurred while removing the role assignment',
		})
	}
})

module.exports = router
