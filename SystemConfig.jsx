import React, { useState, useEffect } from 'react';
import { configAPI } from '../services/api';
import '../styles/Forms.css';
import '../styles/Cards.css';

const SystemConfig = () => {
    const [config, setConfig] = useState({
        interest_type: 'compound',
        penalty_percent: '1.0',
        default_rate_12m: '6.5',
        default_rate_24m: '7.0',
        default_rate_36m: '7.5',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await configAPI.get();
            setConfig(data);
        } catch (error) {
            console.error('Failed to load config:', error);
            alert('Failed to load system configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                interest_type: config.interest_type,
                penalty_percent: parseFloat(config.penalty_percent),
                default_rate_12m: parseFloat(config.default_rate_12m),
                default_rate_24m: parseFloat(config.default_rate_24m),
                default_rate_36m: parseFloat(config.default_rate_36m),
            };

            await configAPI.update(payload);
            alert('Configuration updated successfully!');
        } catch (error) {
            alert(`Failed to update configuration: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading configuration...</p>
            </div>
        );
    }

    return (
        <div className="system-config">
            <div className="page-header">
                <h1 className="page-title">System Configuration</h1>
                <p className="page-subtitle">Manage global FD system settings</p>
            </div>

            <div style={{ maxWidth: '800px' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Interest Calculation Settings</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="interest_type" className="form-label required">
                                    Interest Type
                                </label>
                                <select
                                    id="interest_type"
                                    name="interest_type"
                                    className="form-select"
                                    value={config.interest_type}
                                    onChange={handleChange}
                                >
                                    <option value="simple">Simple Interest</option>
                                    <option value="compound">Compound Interest (Annual)</option>
                                </select>
                                <span className="form-help">
                                    {config.interest_type === 'simple'
                                        ? 'Formula: Principal × (1 + Rate × Years)'
                                        : 'Formula: Principal × (1 + Rate)^Years'}
                                </span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="penalty_percent" className="form-label required">
                                    Premature Closure Penalty (%)
                                </label>
                                <input
                                    id="penalty_percent"
                                    name="penalty_percent"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    className="form-input"
                                    value={config.penalty_percent}
                                    onChange={handleChange}
                                />
                                <span className="form-help">
                                    Percentage of accrued interest deducted as penalty for premature closure
                                </span>
                            </div>

                            <h4 style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                                Default Interest Rates by Tenure
                            </h4>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="default_rate_12m" className="form-label">
                                        12 Months (%)
                                    </label>
                                    <input
                                        id="default_rate_12m"
                                        name="default_rate_12m"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="20"
                                        className="form-input"
                                        value={config.default_rate_12m}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="default_rate_24m" className="form-label">
                                        24 Months (%)
                                    </label>
                                    <input
                                        id="default_rate_24m"
                                        name="default_rate_24m"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="20"
                                        className="form-input"
                                        value={config.default_rate_24m}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="default_rate_36m" className="form-label">
                                        36 Months (%)
                                    </label>
                                    <input
                                        id="default_rate_36m"
                                        name="default_rate_36m"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="20"
                                        className="form-input"
                                        value={config.default_rate_36m}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Configuration'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={loadConfig}
                                    disabled={saving}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemConfig;
