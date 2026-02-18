import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fdAPI } from '../services/api';
import '../styles/Tables.css';

const FDRegister = () => {
    const navigate = useNavigate();
    const [fds, setFds] = useState([]);
    const [filteredFds, setFilteredFds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        customer_name: '',
        start_date_from: '',
        start_date_to: '',
    });

    useEffect(() => {
        loadFDs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, fds]);

    const loadFDs = async () => {
        try {
            const data = await fdAPI.list();
            setFds(data.fd_accounts || []);
            setFilteredFds(data.fd_accounts || []);
        } catch (error) {
            console.error('Failed to load FDs:', error);
            alert('Failed to load FD register');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...fds];

        if (filters.status) {
            result = result.filter((fd) => fd.status === filters.status);
        }

        if (filters.customer_name) {
            result = result.filter((fd) =>
                fd.customer_name.toLowerCase().includes(filters.customer_name.toLowerCase())
            );
        }

        if (filters.start_date_from) {
            result = result.filter((fd) => fd.start_date >= filters.start_date_from);
        }

        if (filters.start_date_to) {
            result = result.filter((fd) => fd.start_date <= filters.start_date_to);
        }

        setFilteredFds(result);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            customer_name: '',
            start_date_from: '',
            start_date_to: '',
        });
    };

    const getStatusBadge = (status) => {
        const badgeClass =
            status === 'Active'
                ? 'badge-success'
                : status === 'Closed'
                    ? 'badge-info'
                    : 'badge-warning';
        return <span className={`badge ${badgeClass}`}>{status}</span>;
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading FD register...</p>
            </div>
        );
    }

    return (
        <div className="fd-register">
            <div className="page-header">
                <h1 className="page-title">FD Register</h1>
                <p className="page-subtitle">View and manage all Fixed Deposit accounts</p>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">All Fixed Deposits ({filteredFds.length})</h3>
                    <div className="table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                            Clear Filters
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/fd/create')}>
                            ➕ Create FD
                        </button>
                    </div>
                </div>

                <div className="table-filters">
                    <div className="filter-group">
                        <label className="filter-label">Status</label>
                        <select
                            name="status"
                            className="filter-input"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">All</option>
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                            <option value="PrematurelyClosed">Prematurely Closed</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Customer Name</label>
                        <input
                            type="text"
                            name="customer_name"
                            className="filter-input"
                            placeholder="Search by name..."
                            value={filters.customer_name}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Start Date From</label>
                        <input
                            type="date"
                            name="start_date_from"
                            className="filter-input"
                            value={filters.start_date_from}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Start Date To</label>
                        <input
                            type="date"
                            name="start_date_to"
                            className="filter-input"
                            value={filters.start_date_to}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>

                {filteredFds.length === 0 ? (
                    <div className="table-empty">
                        <div className="table-empty-icon">📋</div>
                        <div className="table-empty-text">
                            {fds.length === 0 ? 'No FDs created yet' : 'No FDs match your filters'}
                        </div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>FD Number</th>
                                    <th>Customer Name</th>
                                    <th>Deposit Amount</th>
                                    <th>Rate (%)</th>
                                    <th>Tenure</th>
                                    <th>Start Date</th>
                                    <th>Maturity Date</th>
                                    <th>Maturity Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFds.map((fd) => (
                                    <tr key={fd.fd_no} onClick={() => navigate(`/fd/${fd.fd_no}`)}>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                                            {fd.fd_no}
                                        </td>
                                        <td style={{ fontWeight: 'var(--font-semibold)' }}>{fd.customer_name}</td>
                                        <td>₹{fd.deposit_amount.toLocaleString('en-IN')}</td>
                                        <td>{fd.interest_rate}%</td>
                                        <td>{fd.tenure}</td>
                                        <td>{fd.start_date}</td>
                                        <td>{fd.maturity_date}</td>
                                        <td style={{ fontWeight: 'var(--font-semibold)' }}>
                                            ₹{fd.maturity_amount.toLocaleString('en-IN')}
                                        </td>
                                        <td>{getStatusBadge(fd.status)}</td>
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

export default FDRegister;
