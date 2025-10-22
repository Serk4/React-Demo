import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Make sure the server is running.');
        // Fallback to mock data if API fails
        const mockUsers: User[] = [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'inactive' },
        ];
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    deleteUser(userId);
  };

  const handleCreate = () => {
    // For now, we'll just show an alert. Later this can open a modal or form
    const firstName = prompt('Enter first name:');
    const lastName = prompt('Enter last name:');
    const email = prompt('Enter email:');
    
    if (!firstName || !lastName || !email) {
      alert('All fields are required');
      return;
    }

    createUser(firstName, lastName, email);
  };

  const handleEdit = (user: User) => {
    // Extract first and last name from the full name
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const newFirstName = prompt('Enter first name:', firstName);
    const newLastName = prompt('Enter last name:', lastName);
    const newEmail = prompt('Enter email:', user.email);
    const newStatus = confirm('Is user active? (OK = Active, Cancel = Inactive)') ? 'active' : 'inactive';
    
    if (!newFirstName || !newLastName || !newEmail) {
      alert('All fields are required');
      return;
    }

    updateUser(user.id, newFirstName, newLastName, newEmail, newStatus === 'active');
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  const createUser = async (firstName: string, lastName: string, email: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName, 
          email,
          isActive: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newUser = await response.json();
      // Add new user to local state
      setUsers([...users, newUser]);
      alert('User created successfully!');
    } catch (err) {
      console.error('Failed to create user:', err);
      alert('Failed to create user. Please try again.');
    }
  };

  const updateUser = async (userId: number, firstName: string, lastName: string, email: string, isActive: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          isActive
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      // Update user in local state
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
      alert('User updated successfully!');
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to update user. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="users-page">
        <h1>Users</h1>
        <div className="loading">Loading users from database...</div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <p>Manage your application users from SQL Server database.</p>
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="page-actions">
        <button className='btn btn-add' onClick={handleCreate}>Create User</button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
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
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-edit" onClick={() => handleEdit(user)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h3>Inactive Users</h3>
          <p>{users.filter(u => u.status === 'inactive').length}</p>
        </div>
      </div>
    </div>
  );
}
