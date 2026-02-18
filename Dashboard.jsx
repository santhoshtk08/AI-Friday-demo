import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fdAPI } from '../services/api';
import '../styles/Cards.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        closed: 0,
        prematurelyClosed: 0,
        totalDeposits: 0,
    });
    const [recentFDs, setRecentFDs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const data = await fdAPI.list();
            const fds = data.fd_accounts || [];

            // Calculate statistics
            const active = fds.filter((fd) => fd.status === 'Active').length;
            const closed = fds.filter((fd) => fd.status === 'Closed').length;
            const prematurelyClosed = fds.filter((fd) => fd.status === 'PrematurelyClosed').length;
            const totalDeposits = fds.reduce((sum, fd) => sum + fd.deposit_amount, 0);

            setStats({
                total: fds.length,
                active,
                closed,
                prematurelyClosed,
                totalDeposits,
            });

            // Get 5 most recent FDs
            setRecentFDs(fds.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of your Fixed Deposit portfolio</p>
            </div>

            {/* Statistics Cards */}
            <div className="card-grid">
                <div className="stat-card">
                    <div className="stat-card-icon primary">📊</div>
                    <div className="stat-card-label">Total FDs</div>
                    <div className="stat-card-value">{stats.total}</div>
                    <div className="stat-card-change">All time</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon success">✓</div>
                    <div className="stat-card-label">Active FDs</div>
                    <div className="stat-card-value">{stats.active}</div>
                    <div className="stat-card-change">Currently running</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon info">💰</div>
                    <div className="stat-card-label">Total Deposits</div>
                    <div className="stat-card-value">
                        ₹{stats.totalDeposits.toLocaleString('en-IN')}
                    </div>
                    <div className="stat-card-change">Across all FDs</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon warning">⚠️</div>
                    <div className="stat-card-label">Premature Closures</div>
                    <div className="stat-card-value">{stats.prematurelyClosed}</div>
                    <div className="stat-card-change">Total closed early</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                        <Link to="/fd/create" className="btn btn-primary">
                            ➕ Create New FD
                        </Link>
                        <Link to="/fd/register" className="btn btn-secondary">
                            📋 View All FDs
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent FDs */}
            {recentFDs.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Fixed Deposits</h3>
                        <Link to="/fd/register" className="btn btn-sm btn-secondary">
                            View All
                        </Link>
                    </div>
                    <div className="card-body">
                        <div className="recent-fds">
                            {recentFDs.map((fd) => (
                                <Link
                                    key={fd.fd_no}
                                    to={`/fd/${fd.fd_no}`}
                                    className="recent-fd-item"
                                >
                                    <div className="recent-fd-info">
                                        <div className="recent-fd-customer">{fd.customer_name}</div>
                                        <div className="recent-fd-number">{fd.fd_no}</div>
                                    </div>
                                    <div className="recent-fd-amount">
                                        ₹{fd.deposit_amount.toLocaleString('en-IN')}
                                    </div>
                                    <div className="recent-fd-status">
                                        <span className={`badge badge-${fd.status === 'Active' ? 'success' : fd.status === 'Closed' ? 'info' : 'warning'}`}>
                                            {fd.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .recent-fds {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .recent-fd-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all var(--transition-fast);
          gap: var(--space-4);
        }

        .recent-fd-item:hover {
          background-color: var(--bg-secondary);
          transform: translateX(4px);
        }

        .recent-fd-info {
          flex: 1;
        }

        .recent-fd-customer {
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .recent-fd-number {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .recent-fd-amount {
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          font-size: var(--text-lg);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        @media (max-width: 768px) {
          .recent-fd-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
