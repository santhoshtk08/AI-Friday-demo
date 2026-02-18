import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fdAPI, configAPI } from '../services/api';
import '../styles/Forms.css';
import '../styles/Cards.css';

const CreateFD = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(null);
    const [formData, setFormData] = useState({
        customer_name: '',
        id_type: 'Aadhaar',
        id_number: '',
        deposit_amount: '',
        interest_rate: '',
        tenure_value: '',
        tenure_unit: 'months',
        start_date: new Date().toISOString().split('T')[0],
    });
    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        loadConfig();
    }, []);

    useEffect(() => {
        calculatePreview();
    }, [formData, config]);

    const loadConfig = async () => {
        try {
            const data = await configAPI.get();
            setConfig(data);
            // Set default interest rate based on tenure
            if (data.default_rate_12m) {
                setFormData((prev) => ({ ...prev, interest_rate: data.default_rate_12m }));
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const calculatePreview = () => {
        if (!formData.deposit_amount || !formData.interest_rate || !formData.tenure_value || !config) {
            setPreview(null);
            return;
        }

        const principal = parseFloat(formData.deposit_amount);
        const rate = parseFloat(formData.interest_rate) / 100;
        const years = formData.tenure_unit === 'months'
            ? parseInt(formData.tenure_value) / 12
            : parseInt(formData.tenure_value);

        let maturityAmount;
        if (config.interest_type === 'simple') {
            maturityAmount = principal * (1 + rate * years);
        } else {
            maturityAmount = principal * Math.pow(1 + rate, years);
        }

        const startDate = new Date(formData.start_date);
        const maturityDate = new Date(startDate);
        if (formData.tenure_unit === 'months') {
            maturityDate.setMonth(maturityDate.getMonth() + parseInt(formData.tenure_value));
        } else {
            maturityDate.setFullYear(maturityDate.getFullYear() + parseInt(formData.tenure_value));
        }

        setPreview({
            maturityAmount: maturityAmount.toFixed(2),
            maturityDate: maturityDate.toISOString().split('T')[0],
            interestEarned: (maturityAmount - principal).toFixed(2),
            interestType: config.interest_type,
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.customer_name.trim()) {
            newErrors.customer_name = 'Customer name is required';
        }
        if (!formData.id_number.trim()) {
            newErrors.id_number = 'ID number is required';
        }
        if (!formData.deposit_amount || parseFloat(formData.deposit_amount) <= 0) {
            newErrors.deposit_amount = 'Deposit amount must be greater than 0';
        }
        if (!formData.interest_rate || parseFloat(formData.interest_rate) <= 0 || parseFloat(formData.interest_rate) > 20) {
            newErrors.interest_rate = 'Interest rate must be between 0 and 20%';
        }
        if (!formData.tenure_value || parseInt(formData.tenure_value) <= 0) {
            newErrors.tenure_value = 'Tenure must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                deposit_amount: parseFloat(formData.deposit_amount),
                interest_rate: parseFloat(formData.interest_rate),
                tenure_value: parseInt(formData.tenure_value),
            };

            const result = await fdAPI.create(payload);
            alert(`FD Created Successfully!\nFD Number: ${result.fd_no}`);
            navigate('/fd/register');
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-fd">
            <div className="page-header">
                <h1 className="page-title">Create Fixed Deposit</h1>
                <p className="page-subtitle">Open a new FD account with customer KYC details</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">FD Details</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <h4 style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                                Customer KYC
                            </h4>

                            <div className="form-group">
                                <label htmlFor="customer_name" className="form-label required">
                                    Customer Name
                                </label>
                                <input
                                    id="customer_name"
                                    name="customer_name"
                                    type="text"
                                    className={`form-input ${errors.customer_name ? 'error' : ''}`}
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    placeholder="Enter customer full name"
                                />
                                {errors.customer_name && <span className="form-error">{errors.customer_name}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="id_type" className="form-label required">
                                        ID Type
                                    </label>
                                    <select
                                        id="id_type"
                                        name="id_type"
                                        className="form-select"
                                        value={formData.id_type}
                                        onChange={handleChange}
                                    >
                                        <option value="Aadhaar">Aadhaar</option>
                                        <option value="PAN">PAN</option>
                                        <option value="Passport">Passport</option>
                                        <option value="Voter ID">Voter ID</option>
                                        <option value="Driving License">Driving License</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="id_number" className="form-label required">
                                        ID Number
                                    </label>
                                    <input
                                        id="id_number"
                                        name="id_number"
                                        type="text"
                                        className={`form-input ${errors.id_number ? 'error' : ''}`}
                                        value={formData.id_number}
                                        onChange={handleChange}
                                        placeholder="Enter ID number"
                                    />
                                    {errors.id_number && <span className="form-error">{errors.id_number}</span>}
                                </div>
                            </div>

                            <h4 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                                FD Information
                            </h4>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="deposit_amount" className="form-label required">
                                        Deposit Amount (₹)
                                    </label>
                                    <input
                                        id="deposit_amount"
                                        name="deposit_amount"
                                        type="number"
                                        step="0.01"
                                        className={`form-input ${errors.deposit_amount ? 'error' : ''}`}
                                        value={formData.deposit_amount}
                                        onChange={handleChange}
                                        placeholder="100000"
                                    />
                                    {errors.deposit_amount && <span className="form-error">{errors.deposit_amount}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="interest_rate" className="form-label required">
                                        Interest Rate (% p.a.)
                                    </label>
                                    <input
                                        id="interest_rate"
                                        name="interest_rate"
                                        type="number"
                                        step="0.01"
                                        className={`form-input ${errors.interest_rate ? 'error' : ''}`}
                                        value={formData.interest_rate}
                                        onChange={handleChange}
                                        placeholder="7.5"
                                    />
                                    {errors.interest_rate && <span className="form-error">{errors.interest_rate}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="tenure_value" className="form-label required">
                                        Tenure
                                    </label>
                                    <input
                                        id="tenure_value"
                                        name="tenure_value"
                                        type="number"
                                        className={`form-input ${errors.tenure_value ? 'error' : ''}`}
                                        value={formData.tenure_value}
                                        onChange={handleChange}
                                        placeholder="12"
                                    />
                                    {errors.tenure_value && <span className="form-error">{errors.tenure_value}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tenure_unit" className="form-label required">
                                        Tenure Unit
                                    </label>
                                    <select
                                        id="tenure_unit"
                                        name="tenure_unit"
                                        className="form-select"
                                        value={formData.tenure_unit}
                                        onChange={handleChange}
                                    >
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="start_date" className="form-label required">
                                    Start Date
                                </label>
                                <input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    className="form-input"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Creating FD...' : 'Create FD'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/fd/register')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Preview Card */}
                {preview && (
                    <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 'var(--space-6)' }}>
                        <div className="card-header">
                            <h3 className="card-title">Maturity Preview</h3>
                        </div>
                        <div className="card-body">
                            <div className="preview-item">
                                <div className="preview-label">Interest Type</div>
                                <div className="preview-value" style={{ textTransform: 'capitalize' }}>
                                    {preview.interestType}
                                </div>
                            </div>
                            <div className="preview-item">
                                <div className="preview-label">Maturity Date</div>
                                <div className="preview-value">{preview.maturityDate}</div>
                            </div>
                            <div className="preview-item">
                                <div className="preview-label">Interest Earned</div>
                                <div className="preview-value" style={{ color: 'var(--success-600)' }}>
                                    ₹{parseFloat(preview.interestEarned).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="preview-item" style={{ paddingTop: 'var(--space-4)', borderTop: '2px solid var(--border-medium)' }}>
                                <div className="preview-label" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
                                    Maturity Amount
                                </div>
                                <div className="preview-value" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)' }}>
                                    ₹{parseFloat(preview.maturityAmount).toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--border-light);
        }

        .preview-item:last-child {
          border-bottom: none;
        }

        .preview-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--font-medium);
        }

        .preview-value {
          font-size: var(--text-base);
          color: var(--text-primary);
          font-weight: var(--font-semibold);
        }

        @media (max-width: 1024px) {
          .create-fd > div {
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

export default CreateFD;
