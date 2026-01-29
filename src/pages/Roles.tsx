import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '../config/api'

interface Role {
	id: number
	name: string
	description: string
	created_at: string
	user_count: number
}

interface User {
	id: number
	first_name: string
	last_name: string
	email: string
	is_active: boolean
	assigned_at: string
}

interface RoleWithUsers extends Role {
	users: User[]
}

export default function Roles() {
	const [roles, setRoles] = useState<Role[]>([])
	const [selectedRole, setSelectedRole] = useState<RoleWithUsers | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>('')
	const [success, setSuccess] = useState<string>('')
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [editingRole, setEditingRole] = useState<Role | null>(null)

	const apiBaseUrl = getApiBaseUrl()

	useEffect(() => {
		fetchRoles()
	}, [])

	const fetchRoles = async () => {
		try {
			setLoading(true)
			const response = await fetch(`${apiBaseUrl}/roles`)
			if (!response.ok) throw new Error('Failed to fetch roles')
			const data = await response.json()
			setRoles(data)
		} catch (error) {
			setError('Failed to load roles')
			console.error('Error fetching roles:', error)
		} finally {
			setLoading(false)
		}
	}

	const fetchRoleDetails = async (roleId: number) => {
		try {
			const response = await fetch(`${apiBaseUrl}/roles/${roleId}`)
			if (!response.ok) throw new Error('Failed to fetch role details')
			const data = await response.json()
			setSelectedRole(data)
		} catch (error) {
			setError('Failed to load role details')
			console.error('Error fetching role details:', error)
		}
	}

	const handleCreateRole = async (roleData: {
		name: string
		description: string
	}) => {
		try {
			const response = await fetch(`${apiBaseUrl}/roles`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(roleData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to create role')
			}

			setSuccess('Role created successfully!')
			setIsCreateModalOpen(false)
			fetchRoles()
			setTimeout(() => setSuccess(''), 3000)
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Failed to create role')
			setTimeout(() => setError(''), 3000)
		}
	}

	const handleUpdateRole = async (roleData: {
		name: string
		description: string
	}) => {
		if (!editingRole) return

		try {
			const response = await fetch(`${apiBaseUrl}/roles/${editingRole.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(roleData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to update role')
			}

			setSuccess('Role updated successfully!')
			setIsEditModalOpen(false)
			setEditingRole(null)
			fetchRoles()
			setTimeout(() => setSuccess(''), 3000)
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Failed to update role')
			setTimeout(() => setError(''), 3000)
		}
	}

	const handleDeleteRole = async (roleId: number) => {
		if (!confirm('Are you sure you want to delete this role?')) return

		try {
			const response = await fetch(`${apiBaseUrl}/roles/${roleId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to delete role')
			}

			setSuccess('Role deleted successfully!')
			fetchRoles()
			if (selectedRole?.id === roleId) {
				setSelectedRole(null)
			}
			setTimeout(() => setSuccess(''), 3000)
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Failed to delete role')
			setTimeout(() => setError(''), 3000)
		}
	}

	if (loading) {
		return <div className='loading'>Loading roles...</div>
	}

	return (
		<div className='users-page'>
			<div className='page-header'>
				<h1>Role Management</h1>
				<p>Manage system roles and permissions</p>
			</div>

			{error && <div className='error-message'>{error}</div>}
			{success && <div className='success-message'>{success}</div>}

			<div className='page-actions'>
				<button
					className='btn btn-add'
					onClick={() => setIsCreateModalOpen(true)}
				>
					+ Create Role
				</button>
			</div>

			<div className='roles-container'>
				{/* Roles Table */}
				<div className='roles-table-container'>
					<table className='users-table'>
						<thead>
							<tr>
								<th>Role Name</th>
								<th>Description</th>
								<th>Users</th>
								<th>Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{roles.map((role) => (
								<tr
									key={role.id}
									className={selectedRole?.id === role.id ? 'selected-row' : ''}
									onClick={() => fetchRoleDetails(role.id)}
									style={{ cursor: 'pointer' }}
								>
									<td>
										<span
											className={`role-badge role-${role.name.toLowerCase()}`}
										>
											{role.name}
										</span>
									</td>
									<td>{role.description}</td>
									<td>
										<span className='user-count-badge'>
											{role.user_count} user{role.user_count !== 1 ? 's' : ''}
										</span>
									</td>
									<td>{new Date(role.created_at).toLocaleDateString()}</td>
									<td>
										<div className='action-buttons'>
											<button
												className='btn btn-edit'
												onClick={(e) => {
													e.stopPropagation()
													setEditingRole(role)
													setIsEditModalOpen(true)
												}}
											>
												Edit
											</button>
											<button
												className='btn btn-delete'
												onClick={(e) => {
													e.stopPropagation()
													handleDeleteRole(role.id)
												}}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{roles.length === 0 && (
						<div className='empty-state'>
							<p>No roles found. Create your first role to get started!</p>
						</div>
					)}
				</div>

				{/* Role Details Panel */}
				{selectedRole && (
					<div className='role-details-panel'>
						<h3>Role Details: {selectedRole.name}</h3>
						<p>
							<strong>Description:</strong> {selectedRole.description}
						</p>
						<p>
							<strong>Users assigned:</strong> {selectedRole.users.length}
						</p>

						{selectedRole.users.length > 0 && (
							<div className='assigned-users'>
								<h4>Assigned Users:</h4>
								<ul className='user-list'>
									{selectedRole.users.map((user) => (
										<li key={user.id} className='user-item'>
											<span className='user-name'>
												{user.first_name} {user.last_name}
											</span>
											<span className='user-email'>{user.email}</span>
											<span
												className={`status-badge status-${user.is_active ? 'active' : 'inactive'}`}
											>
												{user.is_active ? 'Active' : 'Inactive'}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Create Role Modal */}
			{isCreateModalOpen && (
				<RoleModal
					title='Create New Role'
					onClose={() => setIsCreateModalOpen(false)}
					onSubmit={handleCreateRole}
				/>
			)}

			{/* Edit Role Modal */}
			{isEditModalOpen && editingRole && (
				<RoleModal
					title='Edit Role'
					initialData={editingRole}
					onClose={() => {
						setIsEditModalOpen(false)
						setEditingRole(null)
					}}
					onSubmit={handleUpdateRole}
				/>
			)}
		</div>
	)
}

// Role Modal Component
interface RoleModalProps {
	title: string
	initialData?: { name: string; description: string }
	onClose: () => void
	onSubmit: (data: { name: string; description: string }) => void
}

function RoleModal({ title, initialData, onClose, onSubmit }: RoleModalProps) {
	const [formData, setFormData] = useState({
		name: initialData?.name || '',
		description: initialData?.description || '',
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.name.trim() || !formData.description.trim()) {
			alert('Please fill in all fields')
			return
		}
		onSubmit(formData)
	}

	return (
		<div className='modal-overlay'>
			<div className='modal-content'>
				<div className='modal-header'>
					<h3>{title}</h3>
					<button className='modal-close' onClick={onClose}>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label htmlFor='name'>Role Name</label>
						<input
							type='text'
							id='name'
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							maxLength={50}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='description'>Description</label>
						<textarea
							id='description'
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							maxLength={255}
							rows={3}
							required
						/>
					</div>

					<div className='form-actions'>
						<button
							type='button'
							onClick={onClose}
							className='btn btn-secondary'
						>
							Cancel
						</button>
						<button type='submit' className='btn btn-primary'>
							{initialData ? 'Update Role' : 'Create Role'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
