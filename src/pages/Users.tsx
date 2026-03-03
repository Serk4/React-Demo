import { useState, useEffect } from 'react'
import UserCreateModal from '../components/UserCreateModal'
import UserEditModal from '../components/UserEditModal'
import ResultDemo from '../components/ResultDemo'
import { apiEndpoints } from '../config/api'
import type { Result } from '../types/Result'
import { isSuccess } from '../types/Result'
import '../components/ResultDemo.css'

interface User {
	id: number
	name: string
	email: string
	role: string
	status: 'active' | 'inactive'
}

export default function Users() {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)
	const [lastResult, setLastResult] = useState<Result | undefined>(undefined)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isCreatingUser, setIsCreatingUser] = useState(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [isEditingUser, setIsEditingUser] = useState(false)
	const [userToEdit, setUserToEdit] = useState<User | null>(null)

	// Helper function to create user
	const createUser = async (
		firstName: string,
		lastName: string,
		email: string,
	): Promise<Result> => {
		try {
			const response = await fetch(apiEndpoints.users, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					firstName,
					lastName,
					email,
					isActive: true,
				}),
			})

			const result = await response.json()

			if (response.ok) {
				// Success: backend returns user object directly
				const successResult: Result = {
					kind: 'success',
					data: `User "${firstName} ${lastName}" created successfully!`,
				}

				// Refresh users list on success
				const fetchResponse = await fetch(apiEndpoints.users)
				if (fetchResponse.ok) {
					const data = await fetchResponse.json()
					setUsers(data)
				}
				return successResult
			} else {
				// Error: backend returns { error: "message" } format
				const errorResult: Result = {
					kind: 'error',
					message: result.error || 'Failed to create user',
				}
				setError(errorResult.message)
				return errorResult
			}
		} catch {
			const errorResult: Result = {
				kind: 'error',
				message:
					'Failed to create user. Please check your connection and try again.',
			}
			setError(errorResult.message)
			return errorResult
		}
	}

	// Helper function to update user
	const updateUser = async (
		id: number,
		firstName: string,
		lastName: string,
		email: string,
		isActive: boolean,
	): Promise<Result> => {
		try {
			const response = await fetch(`${apiEndpoints.users}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					firstName,
					lastName,
					email,
					isActive,
				}),
			})

			const result = await response.json()

			if (response.ok) {
				// Success: backend returns user object directly
				const successResult: Result = {
					kind: 'success',
					data: `User "${firstName} ${lastName}" updated successfully!`,
				}

				// Refresh users list on success
				const fetchResponse = await fetch(apiEndpoints.users)
				if (fetchResponse.ok) {
					const data = await fetchResponse.json()
					setUsers(data)
				}
				return successResult
			} else {
				// Error: backend returns { error: "message" } format
				const errorResult: Result = {
					kind: 'error',
					message: result.error || 'Failed to update user',
				}
				setError(errorResult.message)
				return errorResult
			}
		} catch {
			const errorResult: Result = {
				kind: 'error',
				message:
					'Failed to update user. Please check your connection and try again.',
			}
			setError(errorResult.message)
			return errorResult
		}
	}

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await fetch(apiEndpoints.users)
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}
				const data = await response.json()
				setUsers(data)
			} catch (err) {
				console.error('Failed to fetch users:', err)
				setError('Failed to load users. Make sure the server is running.')
				// Fallback to mock data if API fails
				const mockUsers: User[] = [
					{
						id: 1,
						name: 'John Doe',
						email: 'john@example.com',
						role: 'Admin',
						status: 'active',
					},
					{
						id: 2,
						name: 'Jane Smith',
						email: 'jane@example.com',
						role: 'User',
						status: 'active',
					},
					{
						id: 3,
						name: 'Bob Johnson',
						email: 'bob@example.com',
						role: 'Editor',
						status: 'inactive',
					},
				]
				setUsers(mockUsers)
			} finally {
				setLoading(false)
			}
		}

		fetchUsers()
	}, [])

	const handleDelete = (userId: number) => {
		if (!confirm('Are you sure you want to delete this user?')) {
			return
		}

		deleteUser(userId)
	}

	const handleCreate = () => {
		setIsCreateModalOpen(true)
	}

	const handleCreateUser = async (
		firstName: string,
		lastName: string,
		email: string,
	) => {
		setIsCreatingUser(true)
		setError(null) // Clear any previous errors

		try {
			const result = await createUser(firstName, lastName, email)
			setLastResult(result) // Track result for demo

			if (isSuccess(result)) {
				setIsCreateModalOpen(false)
				setSuccessMessage(result.data)
				// Clear success message after 5 seconds
				setTimeout(() => setSuccessMessage(null), 5000)
			}
			// Error is already set in createUser function for error cases
		} catch (error) {
			console.error('Failed to create user:', error)
			setError('Something went wrong. Please try again.')
		} finally {
			setIsCreatingUser(false)
		}
	}

	const handleEdit = (user: User) => {
		setUserToEdit(user)
		setIsEditModalOpen(true)
	}

	const handleEditUser = async (
		id: number,
		firstName: string,
		lastName: string,
		email: string,
		isActive: boolean,
	) => {
		setIsEditingUser(true)
		setError(null) // Clear any previous errors

		try {
			const result = await updateUser(id, firstName, lastName, email, isActive)
			setLastResult(result) // Track result for demo

			if (isSuccess(result)) {
				setIsEditModalOpen(false)
				setUserToEdit(null)
				setSuccessMessage(result.data)
				// Clear success message after 5 seconds
				setTimeout(() => setSuccessMessage(null), 5000)
			} else {
				// Keep modal open on error so user can correct the issue
				// Error message is already set in updateUser function
			}
		} catch (error) {
			console.error('Failed to update user:', error)
			setError('Something went wrong. Please try again.')
			setIsEditModalOpen(false)
			setUserToEdit(null)
		} finally {
			setIsEditingUser(false)
		}
	}

	const deleteUser = async (userId: number) => {
		try {
			const response = await fetch(`${apiEndpoints.users}/${userId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			// Remove user from local state
			setUsers(users.filter((user) => user.id !== userId))
			setError(null) // Clear any previous errors
		} catch (err) {
			console.error('Failed to delete user:', err)
			setError('Failed to delete user. Please try again.')
		}
	}

	if (loading) {
		return (
			<div className='users-page'>
				<h1>Users</h1>
				<div className='loading'>Loading users from database...</div>
			</div>
		)
	}

	return (
		<div className='users-page'>
			<div className='page-header'>
				<h1>Users Management</h1>
				<p>Manage your application users from a MySQL database.</p>
				<p className='database-note'>*This database will auto-reset nightly</p>
				{error && <div className='error-message'>{error}</div>}
				{successMessage && (
					<div className='success-message'>{successMessage}</div>
				)}
			</div>

			<div className='page-actions'>
				<button className='btn btn-add' onClick={handleCreate}>
					Create User
				</button>
			</div>

			<ResultDemo result={lastResult} />

			<div className='users-table-container'>
				<table className='users-table'>
					<thead>
						<tr>
							<th>ID</th>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr key={user.id}>
								<td>{user.id}</td>
								<td>{user.name}</td>
								<td>{user.email}</td>
								<td>
									<span
										className={`role-badge role-${user.role.toLowerCase()}`}
									>
										{user.role}
									</span>
								</td>
								<td>
									<span className={`status-badge status-${user.status}`}>
										{user.status}
									</span>
								</td>
								<td>
									<div className='action-buttons'>
										<button
											className='btn btn-edit'
											onClick={() => handleEdit(user)}
										>
											Edit
										</button>
										<button
											className='btn btn-delete'
											onClick={() => handleDelete(user.id)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className='users-stats'>
				<div className='stat-card'>
					<h3>Total Users</h3>
					<p>{users.length}</p>
				</div>
				<div className='stat-card'>
					<h3>Active Users</h3>
					<p>{users.filter((u) => u.status === 'active').length}</p>
				</div>
				<div className='stat-card'>
					<h3>Inactive Users</h3>
					<p>{users.filter((u) => u.status === 'inactive').length}</p>
				</div>
			</div>

			<UserCreateModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreateUser}
				isLoading={isCreatingUser}
			/>

			<UserEditModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false)
					setUserToEdit(null)
				}}
				onSubmit={handleEditUser}
				user={userToEdit}
				isLoading={isEditingUser}
			/>
		</div>
	)
}
