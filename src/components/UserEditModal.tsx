import { useState, useEffect } from 'react'
import Modal from './Modal'
import { getApiBaseUrl } from '../config/api'

interface User {
	id: number
	name: string
	email: string
	role: string
	status: 'active' | 'inactive'
}

interface Role {
	id: number
	name: string
	description: string
}

interface UserRole {
	id: number
	user_id: number
	role_id: number
	assigned_at: string
	role: Role
}

interface UserEditModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (
		id: number,
		firstName: string,
		lastName: string,
		email: string,
		isActive: boolean,
	) => void
	user: User | null
	isLoading?: boolean
	onRoleChange?: () => void
}

export default function UserEditModal({
	isOpen,
	onClose,
	onSubmit,
	user,
	isLoading = false,
	onRoleChange,
}: UserEditModalProps) {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		isActive: true,
	})

	const [errors, setErrors] = useState({
		firstName: '',
		lastName: '',
		email: '',
	})

	const [roles, setRoles] = useState<Role[]>([])
	const [userRoles, setUserRoles] = useState<UserRole[]>([])
	const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('')
	const [roleLoading, setRoleLoading] = useState(false)
	const [roleMessage, setRoleMessage] = useState('')

	const apiBaseUrl = getApiBaseUrl()

	// Populate form when user data changes
	useEffect(() => {
		if (user && isOpen) {
			console.log('📋 Modal opened for user:', user)
			// Split the name into first and last name
			const nameParts = user.name.split(' ')
			const firstName = nameParts[0] || ''
			const lastName = nameParts.slice(1).join(' ') || ''

			const newFormData = {
				firstName,
				lastName,
				email: user.email,
				isActive: user.status === 'active',
			}

			console.log('📝 Setting form data:', newFormData)
			setFormData(newFormData)

			// Clear any existing errors
			setErrors({
				firstName: '',
				lastName: '',
				email: '',
			})

			// Reset role selection and clear any previous role messages
			setSelectedRoleId('')
			setRoleMessage('')

			// Fetch fresh role data when modal opens
			fetchRoles()
			fetchUserRoles(user.id)
		}
	}, [user, isOpen])

	const fetchRoles = async () => {
		try {
			const response = await fetch(`${apiBaseUrl}/roles`)
			if (response.ok) {
				const data = await response.json()
				setRoles(data)
			}
		} catch (error) {
			console.error('Error fetching roles:', error)
		}
	}

	const fetchUserRoles = async (userId: number) => {
		console.log('🔄 Fetching user roles for user:', userId)
		try {
			const response = await fetch(`${apiBaseUrl}/users/${userId}/roles`)
			console.log('📡 User roles response status:', response.status)
			if (response.ok) {
				const data = await response.json()
				console.log('📥 User roles data received:', data)
				setUserRoles(data)
			}
		} catch (error) {
			console.error('❌ Error fetching user roles:', error)
			setUserRoles([])
		}
	}

	const handleAssignRole = async () => {
		console.log('🎯 Attempting to assign role:', {
			selectedRoleId,
			userId: user?.id,
			isActive: formData.isActive,
		})
		if (!selectedRoleId || !user || !formData.isActive) return

		setRoleLoading(true)
		try {
			const response = await fetch(
				`${apiBaseUrl}/roles/${selectedRoleId}/users/${user.id}`,
				{
					method: 'POST',
				},
			)

			console.log('📡 Role assignment response status:', response.status)
			if (response.ok) {
				const responseData = await response.json()
				console.log('✅ Role assignment successful:', responseData)
				setRoleMessage('Role assigned successfully!')
				setSelectedRoleId('')
				
				// Refresh both user roles and parent component data
				await fetchUserRoles(user.id)
				if (onRoleChange) {
					onRoleChange()
				}
				setTimeout(() => setRoleMessage(''), 3000)
			} else {
				const errorData = await response.json()
				console.error('❌ Role assignment failed:', errorData)
				
				// If it's a conflict error, refresh the user roles to sync data
				if (response.status === 409) {
					console.log('🔄 Conflict detected, refreshing user roles to sync...')
					await fetchUserRoles(user.id)
					setRoleMessage('Role already assigned. Role list updated.')
				} else {
					setRoleMessage(errorData.message || 'Failed to assign role')
				}
			}
		} catch (error) {
			console.error('❌ Role assignment error:', error)
			setRoleMessage('Failed to assign role')
		} finally {
			setRoleLoading(false)
			setTimeout(() => setRoleMessage(''), 3000)
		}
	}

	const handleRemoveRole = async (roleId: number) => {
		if (
			!user ||
			!formData.isActive ||
			!confirm('Are you sure you want to remove this role?')
		)
			return

		setRoleLoading(true)
		try {
			const response = await fetch(
				`${apiBaseUrl}/roles/${roleId}/users/${user.id}`,
				{
					method: 'DELETE',
				},
			)

			if (response.ok) {
				setRoleMessage('Role removed successfully!')
				fetchUserRoles(user.id)
				// Notify parent to refresh user list
				if (onRoleChange) {
					onRoleChange()
				}
				setTimeout(() => setRoleMessage(''), 3000)
			} else {
				const errorData = await response.json()
				setRoleMessage(errorData.message || 'Failed to remove role')
			}
		} catch (error) {
			console.error('Error removing role:', error)
			setRoleMessage('Failed to remove role')
		} finally {
			setRoleLoading(false)
		}
	}

	const validateForm = () => {
		const newErrors = {
			firstName: '',
			lastName: '',
			email: '',
		}

		// Validate first name
		if (!formData.firstName.trim()) {
			newErrors.firstName = 'First name is required'
		} else if (formData.firstName.trim().length < 2) {
			newErrors.firstName = 'First name must be at least 2 characters'
		}

		// Validate last name
		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Last name is required'
		} else if (formData.lastName.trim().length < 2) {
			newErrors.lastName = 'Last name must be at least 2 characters'
		}

		// Validate email
		if (!formData.email.trim()) {
			newErrors.email = 'Email is required'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address'
		}

		setErrors(newErrors)
		return !Object.values(newErrors).some((error) => error !== '')
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!user) return

		if (validateForm()) {
			onSubmit(
				user.id,
				formData.firstName.trim(),
				formData.lastName.trim(),
				formData.email.trim(),
				formData.isActive,
			)
			handleReset()
		}
	}

	const handleReset = () => {
		setFormData({
			firstName: '',
			lastName: '',
			email: '',
			isActive: true,
		})
		setErrors({
			firstName: '',
			lastName: '',
			email: '',
		})
	}

	const handleClose = () => {
		handleReset()
		onClose()
	}

	const handleInputChange =
		(field: keyof typeof formData) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = field === 'isActive' ? e.target.checked : e.target.value

			setFormData((prev) => ({
				...prev,
				[field]: value,
			}))

			// Clear error when user starts typing (except for isActive checkbox)
			if (field !== 'isActive' && errors[field as keyof typeof errors]) {
				setErrors((prev) => ({
					...prev,
					[field]: '',
				}))
			}
		}

	if (!user) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={`Edit User: ${user.name}`}
		>
			<form onSubmit={handleSubmit} className='modal-form'>
				<div className='form-group'>
					<label htmlFor='editFirstName'>First Name *</label>
					<input
						type='text'
						id='editFirstName'
						value={formData.firstName}
						onChange={handleInputChange('firstName')}
						placeholder='Enter first name'
						disabled={isLoading}
						className={errors.firstName ? 'error' : ''}
					/>
					{errors.firstName && (
						<span className='error-message'>{errors.firstName}</span>
					)}
				</div>

				<div className='form-group'>
					<label htmlFor='editLastName'>Last Name *</label>
					<input
						type='text'
						id='editLastName'
						value={formData.lastName}
						onChange={handleInputChange('lastName')}
						placeholder='Enter last name'
						disabled={isLoading}
						className={errors.lastName ? 'error' : ''}
					/>
					{errors.lastName && (
						<span className='error-message'>{errors.lastName}</span>
					)}
				</div>

				<div className='form-group'>
					<label htmlFor='editEmail'>Email Address *</label>
					<input
						type='email'
						id='editEmail'
						value={formData.email}
						onChange={handleInputChange('email')}
						placeholder='Enter email address'
						disabled={isLoading}
						className={errors.email ? 'error' : ''}
					/>
					{errors.email && (
						<span className='error-message'>{errors.email}</span>
					)}
				</div>

				<div className='form-group'>
					<label className='checkbox-label'>
						<input
							type='checkbox'
							checked={formData.isActive}
							onChange={handleInputChange('isActive')}
							disabled={isLoading}
						/>
						<span className='checkbox-text'>User is active</span>
					</label>
				</div>

				{/* Role Management Section */}
				<div className='role-management-section'>
					<h4>Role Management</h4>

					{roleMessage && (
						<div
							className={`role-message ${roleMessage.includes('success') ? 'success' : 'error'}`}
						>
							{roleMessage}
						</div>
					)}

					{/* Current Roles */}
					<div className='current-roles'>
						<label>Current Roles:</label>
						{userRoles.length > 0 ? (
							<div className='role-list'>
								{userRoles.map((userRole) => (
									<div key={userRole.id} className='role-item'>
										<span
											className={`role-badge role-${userRole.role.name.toLowerCase()}`}
										>
											{userRole.role.name}
										</span>
										<button
											type='button'
											className='role-remove-btn'
											onClick={() => handleRemoveRole(userRole.role_id)}
											disabled={roleLoading || !formData.isActive}
											title={
												formData.isActive
													? 'Remove role'
													: 'User must be active to remove roles'
											}
										>
											×
										</button>
									</div>
								))}
							</div>
						) : (
							<div className='no-roles'>No roles assigned</div>
						)}
					</div>

					{/* Assign New Role */}
					<div className='assign-role'>
						<label htmlFor='roleSelect'>Assign New Role:</label>
						<div className='assign-role-controls'>
							<select
								id='roleSelect'
								value={selectedRoleId}
								onChange={(e) => {
									const value =
										e.target.value === '' ? '' : Number(e.target.value)
									console.log('🎯 Role selected:', value)
									setSelectedRoleId(value)
								}}
								disabled={roleLoading || !formData.isActive}
								title={
									formData.isActive
										? 'Select a role to assign to the user'
										: 'User must be active to assign roles'
								}
							>
								<option value=''>Select a role...</option>
								{roles
									.filter(
										(role) => !userRoles.some((ur) => ur.role_id === role.id),
									)
									.map((role) => (
										<option key={role.id} value={role.id}>
											{role.name} - {role.description}
										</option>
									))}
							</select>
							<button
								type='button'
								className='btn-assign-role'
								onClick={handleAssignRole}
								disabled={roleLoading || !selectedRoleId || !formData.isActive}
								title={
									formData.isActive
										? undefined
										: 'User must be active to assign roles'
								}
							>
								{roleLoading ? 'Assigning...' : 'Assign'}
							</button>
						</div>
					</div>
				</div>

				<div className='form-actions'>
					<button
						type='button'
						className='btn-secondary'
						onClick={handleClose}
						disabled={isLoading}
					>
						Cancel
					</button>
					<button type='submit' className='btn-primary' disabled={isLoading}>
						{isLoading ? 'Updating...' : 'Update User'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
