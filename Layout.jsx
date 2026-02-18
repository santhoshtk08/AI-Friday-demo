import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Layout = () => {
    const { user, logout, isSupervisor } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    const isActive = (path) => location.pathname === path;

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h1 className="sidebar-logo">FD Manager</h1>
                    <p className="sidebar-subtitle">Fixed Deposit System</p>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main</div>
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">📊</span>
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/fd/create"
                            className={`nav-link ${isActive('/fd/create') ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">➕</span>
                            <span>Create FD</span>
                        </Link>
                        <Link
                            to="/fd/register"
                            className={`nav-link ${isActive('/fd/register') ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">📋</span>
                            <span>FD Register</span>
                        </Link>
                    </div>

                    {isSupervisor && (
                        <div className="nav-section">
                            <div className="nav-section-title">Administration</div>
                            <Link
                                to="/config"
                                className={`nav-link ${isActive('/config') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="nav-icon">⚙️</span>
                                <span>System Config</span>
                            </Link>
                            <Link
                                to="/users"
                                className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="nav-icon">👥</span>
                                <span>User Management</span>
                            </Link>
                        </div>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Navbar */}
                <header className="navbar">
                    <div className="navbar-left">
                        <button className="menu-toggle" onClick={toggleSidebar}>
                            ☰
                        </button>
                        <h2 className="navbar-title">
                            {location.pathname === '/dashboard' && 'Dashboard'}
                            {location.pathname === '/fd/create' && 'Create Fixed Deposit'}
                            {location.pathname === '/fd/register' && 'FD Register'}
                            {location.pathname.startsWith('/fd/') && location.pathname !== '/fd/create' && location.pathname !== '/fd/register' && 'FD Details'}
                            {location.pathname === '/config' && 'System Configuration'}
                            {location.pathname === '/users' && 'User Management'}
                        </h2>
                    </div>

                    <div className="navbar-right">
                        <div className="user-menu">
                            <div className="user-avatar">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <div className="user-name">{user?.username}</div>
                                <div className="user-role">{user?.role}</div>
                            </div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
