import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fdAPI } from '../services/api';
import '../styles/Cards.css';
import '../styles/Forms.css';

const FDDetails = () => {
    const { fdNo } = useParams();
    const navigate = useNavigate();
    const [fd, setFd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSimulation, setShowSimulation] = useState(false);
    const [closureDate, setClosureDate] = useState(new Date().toISOString().split('T')[0]);
    const [simulation, setSimulation] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadFD();
    }, [fdNo]);

    const loadFD = async () => {
        try {
            const data = await fdAPI.getById(fdNo);
            setFd(data);
        } catch (error) {
            console.error('Failed to load FD:', error);
            alert('Failed to load FD details');
            navigate('/fd/register');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async () => {
        try {
            setActionLoading(true);
            await fdAPI.downloadReceipt(fdNo);
        } catch (error) {
            alert(`Failed to download receipt: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSimulateClosure = async () => {
        try {
            setActionLoading(true);
            const result = await fdAPI.simulateClosure(fdNo, closureDate);
            setSimulation(result);
        } catch (error) {
            alert(`Simulation failed: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseFD = async () => {
        if (!confirm('Are you sure you want to close this FD prematurely?')) {
            return;
        }

        try {
            setActionLoading(true);
            await fdAPI.close(fdNo, closureDate);
            alert('FD closed successfully');
            loadFD();
            setShowSimulation(false);
        } catch (error) {
            alert(`Failed to close FD: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMatureFD = async () => {
        if (!confirm('Mark this FD as matured?')) {
            return;
        }

        try {
            setActionLoading(true);
            await fdAPI.mature(fdNo);
            alert('FD marked as matured');
            loadFD();
        } catch (error) {
            alert(`Failed to mature FD: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading FD details...</p>
            </div>
        );
    }

    if (!fd) {
        return null;
    }

    const getStatusBadge = (status) => {
        const badgeClass =
            status === 'Active'
                ? 'badge-success'
                : status === 'Closed'
                    ? 'badge-info'
                    : 'badge-warning';
        return <span className={`badge ${badgeClass}`}>{status}</span>;
    };

    return (
        <div className="fd-details">
            <div className="page-header">
                <div>
                    <h1 className="page-title">FD Details</h1>
                    <p className="page-subtitle">{fd.fd_no}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/fd/register')}>
                        ← Back to Register
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleDownloadReceipt}
                        disabled={actionLoading}
                    >
                        📄 Download Receipt
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                {/* Main Details */}
                <div>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Customer Information</h3>
                        </div>
                        <div className="card-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <div className="detail-label">Customer Name</div>
                                    <div className="detail-value">{fd.customer_name}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">ID Type</div>
                                    <div className="detail-value">{fd.id_type}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">ID Number</div>
                                    <div className="detail-value">{fd.id_number}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                        <div className="card-header">
                            <h3 className="card-title">FD Information</h3>
                        </div>
                        <div className="card-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <div className="detail-label">Deposit Amount</div>
                                    <div className="detail-value">₹{fd.deposit_amount.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Interest Rate</div>
                                    <div className="detail-value">{fd.interest_rate}% p.a.</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Tenure</div>
                                    <div className="detail-value">{fd.tenure_value} {fd.tenure_unit}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Interest Type</div>
                                    <div className="detail-value" style={{ textTransform: 'capitalize' }}>
                                        {fd.interest_type_used}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Start Date</div>
                                    <div className="detail-value">{fd.start_date}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Maturity Date</div>
                                    <div className="detail-value">{fd.maturity_date}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Maturity Amount</div>
                                    <div className="detail-value" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)' }}>
                                        ₹{fd.maturity_amount.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Created By</div>
                                    <div className="detail-value">{fd.created_by}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Sidebar */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: 'var(--space-6)' }}>
                        <div className="card-header">
                            <h3 className="card-title">Status & Actions</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <div className="detail-label">Current Status</div>
                                <div style={{ marginTop: 'var(--space-2)' }}>{getStatusBadge(fd.status)}</div>
                            </div>

                            {fd.status === 'Active' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowSimulation(!showSimulation)}
                                    >
                                        {showSimulation ? 'Hide Simulation' : '🔍 Simulate Closure'}
                                    </button>

                                    {new Date(fd.maturity_date) <= new Date() && (
                                        <button
                                            className="btn btn-success"
                                            onClick={handleMatureFD}
                                            disabled={actionLoading}
                                        >
                                            ✓ Mark as Matured
                                        </button>
                                    )}
                                </div>
                            )}

                            {showSimulation && fd.status === 'Active' && (
                                <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>
                                        Premature Closure
                                    </h4>

                                    <div className="form-group">
                                        <label className="form-label">Closure Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={closureDate}
                                            onChange={(e) => setClosureDate(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleSimulateClosure}
                                        disabled={actionLoading}
                                        style={{ width: '100%', marginBottom: 'var(--space-3)' }}
                                    >
                                        Calculate
                                    </button>

                                    {simulation && (
                                        <>
                                            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-medium)' }}>
                                                <div className="detail-item" style={{ marginBottom: 'var(--space-2)' }}>
                                                    <div className="detail-label">Days Held</div>
                                                    <div className="detail-value">{simulation.days_held}</div>
                                                </div>
                                                <div className="detail-item" style={{ marginBottom: 'var(--space-2)' }}>
                                                    <div className="detail-label">Accrued Interest</div>
                                                    <div className="detail-value">₹{simulation.accrued_interest.toLocaleString('en-IN')}</div>
                                                </div>
                                                <div className="detail-item" style={{ marginBottom: 'var(--space-2)' }}>
                                                    <div className="detail-label">Penalty ({simulation.penalty_percent}%)</div>
                                                    <div className="detail-value" style={{ color: 'var(--error-600)' }}>
                                                        -₹{simulation.penalty_amount.toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                                <div className="detail-item" style={{ marginBottom: 'var(--space-2)' }}>
                                                    <div className="detail-label">Net Interest</div>
                                                    <div className="detail-value">₹{simulation.net_interest.toLocaleString('en-IN')}</div>
                                                </div>
                                                <div className="detail-item" style={{ paddingTop: 'var(--space-3)', borderTop: '2px solid var(--border-medium)' }}>
                                                    <div className="detail-label" style={{ fontWeight: 'var(--font-semibold)' }}>Net Payout</div>
                                                    <div className="detail-value" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)' }}>
                                                        ₹{simulation.net_payout.toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={handleCloseFD}
                                                disabled={actionLoading}
                                                style={{ width: '100%', marginTop: 'var(--space-4)' }}
                                            >
                                                Close FD
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-5);
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .detail-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--font-medium);
        }

        .detail-value {
          font-size: var(--text-base);
          color: var(--text-primary);
          font-weight: var(--font-semibold);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        @media (max-width: 1024px) {
          .fd-details > div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }

          .card[style*="sticky"] {
            position: static !important;
          }
        }
      `}</style>
        </div>
    );
};

export default FDDetails;
