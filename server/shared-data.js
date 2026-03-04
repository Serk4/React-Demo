// Shared in-memory storage for all routes
// This ensures data consistency across different route files

let roles = [
	{
		id: 1,
		name: 'Admin',
		description: 'Full system access with user management capabilities',
		created_at: new Date().toISOString(),
		user_count: 1,
	},
	{
		id: 2,
		name: 'Manager',
		description: 'Departmental management with limited admin features',
		created_at: new Date().toISOString(),
		user_count: 2,
	},
	{
		id: 3,
		name: 'Editor',
		description: 'Content creation and editing permissions',
		created_at: new Date().toISOString(),
		user_count: 2,
	},
	{
		id: 4,
		name: 'Viewer',
		description: 'Read-only access to system resources',
		created_at: new Date().toISOString(),
		user_count: 2,
	},
	{
		id: 5,
		name: 'Support',
		description: 'Customer support and helpdesk capabilities',
		created_at: new Date().toISOString(),
		user_count: 1,
	},
]

let userRoleAssignments = [
	{ user_id: 1, role_id: 1, assigned_at: new Date().toISOString() },
	{ user_id: 1, role_id: 2, assigned_at: new Date().toISOString() },
	{ user_id: 2, role_id: 2, assigned_at: new Date().toISOString() },
	{ user_id: 2, role_id: 3, assigned_at: new Date().toISOString() },
	{ user_id: 3, role_id: 4, assigned_at: new Date().toISOString() },
	{ user_id: 4, role_id: 3, assigned_at: new Date().toISOString() },
	{ user_id: 4, role_id: 5, assigned_at: new Date().toISOString() },
	{ user_id: 5, role_id: 5, assigned_at: new Date().toISOString() },
]

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

let nextUserId = 6

module.exports = {
	// Data getters
	getRoles: () => roles,
	getUserRoleAssignments: () => userRoleAssignments,
	getUsers: () => users,

	// Data setters
	setRoles: (newRoles) => {
		roles = newRoles
	},
	setUserRoleAssignments: (newAssignments) => {
		userRoleAssignments = newAssignments
	},
	setUsers: (newUsers) => {
		users = newUsers
	},

	// Helper functions
	addUserRoleAssignment: (assignment) => {
		userRoleAssignments.push(assignment)
	},

	removeUserRoleAssignment: (userId, roleId) => {
		const index = userRoleAssignments.findIndex(
			(assignment) =>
				assignment.user_id === userId && assignment.role_id === roleId,
		)
		if (index !== -1) {
			userRoleAssignments.splice(index, 1)
		}
	},

	addUser: (user) => {
		user.id = nextUserId++
		users.push(user)
		return user
	},

	getNextUserId: () => nextUserId,
	incrementNextUserId: () => {
		nextUserId++
	},
	setNextUserId: (id) => {
		nextUserId = id
	},
}
