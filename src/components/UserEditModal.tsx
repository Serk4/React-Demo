import { useState, useEffect } from 'react';
import Modal from './Modal';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, firstName: string, lastName: string, email: string, isActive: boolean) => void;
  user: User | null;
  isLoading?: boolean;
}

export default function UserEditModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user,
  isLoading = false 
}: UserEditModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isActive: true
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Populate form when user data changes
  useEffect(() => {
    if (user && isOpen) {
      // Split the name into first and last name
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        firstName,
        lastName,
        email: user.email,
        isActive: user.status === 'active'
      });
      
      // Clear any existing errors
      setErrors({
        firstName: '',
        lastName: '',
        email: ''
      });
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: ''
    };

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (validateForm()) {
      onSubmit(
        user.id,
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.email.trim(),
        formData.isActive
      );
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      isActive: true
    });
    setErrors({
      firstName: '',
      lastName: '',
      email: ''
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'isActive' ? e.target.checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing (except for isActive checkbox)
    if (field !== 'isActive' && errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit User: ${user.name}`}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="editFirstName">First Name *</label>
          <input
            type="text"
            id="editFirstName"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            placeholder="Enter first name"
            disabled={isLoading}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && (
            <span className="error-message">{errors.firstName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="editLastName">Last Name *</label>
          <input
            type="text"
            id="editLastName"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            placeholder="Enter last name"
            disabled={isLoading}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && (
            <span className="error-message">{errors.lastName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="editEmail">Email Address *</label>
          <input
            type="email"
            id="editEmail"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="Enter email address"
            disabled={isLoading}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={handleInputChange('isActive')}
              disabled={isLoading}
            />
            <span className="checkbox-text">User is active</span>
          </label>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </Modal>
  );
}