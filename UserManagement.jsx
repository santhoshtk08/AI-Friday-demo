import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import '../styles/Forms.css';
import '../styles/Tables.css';
import '../styles/Cards.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'officer',
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userAPI.list();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            await userAPI.create(formData);
            alert(`User '${formData.username}' created successfully!`);
            setFormData({ username: '', password: '', role: 'officer' });
            setShowCreateForm(false);
            loadUsers();
        } catch (error) {
            alert(`Failed to create user: ${error.message}`);
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="user-management">
            <div className="page-header">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage system users and their roles</p>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h3 className="card-title">Create New User</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="username" className="form-label required">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        className="form-input"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        required
                                        minLength={3}
                                        maxLength={50}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password" className="form-label required">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="form-input"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="role" className="form-label required">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="form-select"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="officer">Officer</option>
                                        <option value="supervisor">Supervisor</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create User'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateForm(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">All Users ({users.length})</h3>
                    {!showCreateForm && (
                        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateForm(true)}>
                            ➕ Create User
                        </button>
                    )}
                </div>

                {users.length === 0 ? (
                    <div className="table-empty">
                        <div className="table-empty-icon">👥</div>
                        <div className="table-empty-text">No users found</div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td style={{ fontWeight: 'var(--font-semibold)' }}>{user.username}</td>
                                        <td>
                                            <span
                                                className={`badge ${user.role === 'supervisor' ? 'badge-info' : 'badge-secondary'
                                                    }`}
                                                style={{ textTransform: 'capitalize' }}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
